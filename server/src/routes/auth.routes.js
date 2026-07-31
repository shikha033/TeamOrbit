const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Resend } = require('resend');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

const signToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password, role, college, skills } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing required fields' });
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'member',
      college: college || '',
      skills: skills || [],
    });
    const token = signToken(user);
    res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken(user);
    res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always respond the same way whether or not the account exists,
    // so this endpoint can't be used to check which emails are registered.
    const genericMessage = { message: 'If that email is registered, a reset link has been sent.' };

    if (!user) return res.json(genericMessage);

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordTokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${rawToken}`;

    if (resend) {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'TeamOrbit <onboarding@resend.dev>',
        to: user.email,
        subject: 'Reset your TeamOrbit password',
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2>Reset your password</h2>
            <p>We got a request to reset the password for your TeamOrbit account. This link expires in 15 minutes.</p>
            <p><a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none;">Reset password</a></p>
            <p>If you didn't request this, you can safely ignore this email — your password won't change.</p>
          </div>
        `,
      });
    } else {
      // No RESEND_API_KEY configured — fail loudly in logs so it's obvious in deployment,
      // but keep responding generically to the client.
      console.error('RESEND_API_KEY not set — password reset email was NOT sent. Reset URL:', resetUrl);
    }

    res.json(genericMessage);
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password/:token', async (req, res, next) => {
  try {
    const { password } = req.body;
    const { token } = req.params;
    if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordTokenHash +resetPasswordExpires');

    if (!user) return res.status(400).json({ error: 'This reset link is invalid or has expired' });

    user.password = password;
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    next(err);
  }
});

router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
