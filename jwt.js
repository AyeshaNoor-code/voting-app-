const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).json({ error: 'Token not found' });
    }

    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token: ", decoded);

        req.user = decoded; // Attach decoded user data to request
        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: 'Invalid token' });
    }
};


const generateToken = (userData) => {
    const payload = { id: userData._id, username: userData.username };
    console.log('Generating token with payload:', payload); // Log the payload
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Generated Token:', token);
    return token;
};


module.exports = { jwtAuthMiddleware, generateToken };
