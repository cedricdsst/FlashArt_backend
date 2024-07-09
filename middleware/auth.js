const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        if (!req.cookies || !req.cookies.auth_token) {
            throw new Error('Authentication token not found');
        }

        const token = req.cookies.auth_token;
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        const userId = decodedToken.userId;
        const role = decodedToken.role;
        req.auth = { userId,role };
        next();
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};
