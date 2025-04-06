const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  console.log('\n=== Auth Middleware ===');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  try {
    const authHeader = req.headers.authorization;
    console.log('Authorization header:', authHeader);
    
    if (!authHeader) {
      console.log('No authorization header found');
      return res.status(401).json({ message: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token extracted:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.log('No token found in authorization header');
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully');
    console.log('Decoded token:', { ...decoded, iat: undefined, exp: undefined });
    
    req.user = decoded;
    console.log('User added to request:', req.user);
    console.log('===================\n');
    
    next();
  } catch (error) {
    console.error('\n=== Auth Error ===');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Stack:', error.stack);
    console.error('===================\n');
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token format' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const isAdmin = (req, res, next) => {
  console.log('\n=== Admin Check ===');
  console.log('User:', req.user);
  
  if (!req.user) {
    console.log('No user found in request');
    return res.status(403).json({ message: 'Access denied. No user found.' });
  }
  
  if (!req.user.isAdmin) {
    console.log('User is not an admin');
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  
  console.log('Admin access granted');
  console.log('===================\n');
  next();
};

module.exports = {
  verifyToken,
  isAdmin
}; 