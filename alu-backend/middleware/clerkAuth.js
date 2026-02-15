const { Clerk } = require('@clerk/clerk-sdk-node');
const { User } = require('../config/db');

const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

const toDisplayName = (claims) => {
  const first = String(claims?.first_name || '').trim();
  const last = String(claims?.last_name || '').trim();
  const full = `${first} ${last}`.trim();
  if (full) return full;
  const username = String(claims?.username || claims?.preferred_username || '').trim();
  if (username) return username;
  const primaryEmail = String(claims?.email || claims?.email_address || '').trim();
  if (primaryEmail) return primaryEmail;
  const emails = Array.isArray(claims?.email_addresses) ? claims.email_addresses : [];
  const firstEmailObj = emails[0];
  if (typeof firstEmailObj === 'string') return String(firstEmailObj || '').trim();
  return String(firstEmailObj?.email_address || '').trim();
};

const toAvatarUrl = (claims) => {
  const candidates = [
    claims?.image_url,
    claims?.picture,
    claims?.imageUrl,
    claims?.avatar_url,
    claims?.profile_image_url,
  ];
  for (const value of candidates) {
    const url = String(value || '').trim();
    if (url) return url;
  }
  return '';
};

const clerkAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Bearer token missing' });
  }

  try {
    const claims = await clerk.verifyToken(token);
    if (!claims) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.auth = claims; // Attach user claims to the request object

    // Keep backend user directory in sync with signed-in users so search works.
    try {
      const userId = claims.sub;
      if (userId) {
        const displayName = toDisplayName(claims);
        const avatarUrl = toAvatarUrl(claims);
        const setFields = {};
        if (displayName) setFields.displayName = displayName;
        if (avatarUrl) setFields.avatarUrl = avatarUrl;

        await User.findOneAndUpdate(
          { userId },
          {
            $setOnInsert: { userId },
            ...(Object.keys(setFields).length > 0 ? { $set: setFields } : {}),
          },
          { upsert: true, new: true }
        );
      }
    } catch (syncErr) {
      // Auth must still proceed even if profile sync fails.
      console.warn('User sync on auth failed:', syncErr.message);
    }

    next();
  } catch (error) {
    console.error('Clerk verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = clerkAuth;
