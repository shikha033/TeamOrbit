"""

TeamOrbit AI Service

This FastAPI service handles all AI-related requests.
It receives requests from the Node.js backend, communicates
with the Google Gemini API, and returns AI-generated responses.
It also proxies non-AI API requests to the Express backend.

"""
import os
import logging
from pathlib import Path
from typing import Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
NODE_BACKEND_URL = os.environ.get("NODE_BACKEND_URL", "http://localhost:8002")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [FASTAPI] %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="TeamOrbit FastAPI Companion")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


class AIRequest(BaseModel):
    system: str = "You are a helpful assistant."
    prompt: str
    session: str = "default"
    model: Optional[str] = None
    json: bool = False


@app.get("/api/_health")
async def health():
    return {"status": "ok", "service": "fastapi-companion"}


@app.post("/api/_ai/generate")
async def ai_generate(req: AIRequest):
    """Internal endpoint invoked by the Node.js backend for all AI features.

    Uses Google Gemini directly via its REST API.
    """
    if not GEMINI_API_KEY:
        raise HTTPException(500, "GEMINI_API_KEY not configured")
    model = req.model or GEMINI_MODEL
    system = req.system + ("\nAlways respond in strict valid JSON only, no prose." if req.json else "")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "systemInstruction": {"parts": [{"text": system}]},
        "contents": [{"role": "user", "parts": [{"text": req.prompt}]}],
        "generationConfig": {"temperature": 0.6, "maxOutputTokens": 2048},
    }
    try:
        async with httpx.AsyncClient(timeout=90.0) as gc:
            r = await gc.post(url, json=payload)
            if r.status_code != 200:
                logger.warning("Gemini error %s: %s", r.status_code, r.text[:300])
                raise HTTPException(502, f"Gemini error: {r.text[:200]}")
            data = r.json()
        parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
        text = "".join(p.get("text", "") for p in parts).strip()
        return {"text": text}
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("ai_generate failed: %s", exc)
        raise HTTPException(500, f"AI generation failed: {exc}")

# ---------------------------------------------------------------------------

# Forward all non-AI API requests to the Express backend.

# ---------------------------------------------------------------------------

_client: Optional[httpx.AsyncClient] = None


@app.on_event("startup")
async def _startup():
    global _client
    _client = httpx.AsyncClient(base_url=NODE_BACKEND_URL, timeout=120.0)
    logger.info("FastAPI companion started. Proxying /api/* → %s", NODE_BACKEND_URL)


@app.on_event("shutdown")
async def _shutdown():
    global _client
    if _client is not None:
        await _client.aclose()


HOP_BY_HOP = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
    "host",
    "content-length",
}


async def _proxy(request: Request, target_path: str) -> Response:
    global _client
    if _client is None:
        return JSONResponse({"error": "Proxy not ready"}, status_code=503)
    headers = {k: v for k, v in request.headers.items() if k.lower() not in HOP_BY_HOP}
    body = await request.body()
    try:
        upstream = await _client.request(
            request.method,
            target_path,
            content=body,
            headers=headers,
            params=request.query_params,
        )
    except httpx.RequestError as exc:
        logger.warning("Upstream error for %s: %s", target_path, exc)
        return JSONResponse({"error": "Node backend unreachable"}, status_code=502)
    resp_headers = {k: v for k, v in upstream.headers.items() if k.lower() not in HOP_BY_HOP}
    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        headers=resp_headers,
        media_type=upstream.headers.get("content-type"),
    )


@app.api_route("/api/{full_path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def api_proxy(full_path: str, request: Request):

#Handles AI requests by sending prompts to the Google Gemini API and returning the generated response.

    return await _proxy(request, f"/api/{full_path}")


@app.api_route("/uploads/{full_path:path}", methods=["GET"])
async def uploads_proxy(full_path: str, request: Request):
    return await _proxy(request, f"/uploads/{full_path}")


@app.get("/")
async def root():
    return {"service": "TeamOrbit", "docs": "/api/", "backend": "node+express (port 8002)"}
