const { Clerk } = require('@clerk/clerk-sdk-node');

const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

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
    next();
  } catch (error) {
    console.error('Clerk verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = clerkAuth;
