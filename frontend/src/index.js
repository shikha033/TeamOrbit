import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from '@/App';
import { AuthProvider } from '@/lib/auth';
import '@/index.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#121620',
              color: '#F8FAFC',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: 14,
              borderRadius: 12,
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
