const cookieParser = require('cookie-parser');

const authMiddleware = (req, res, next) => {
    const userCookie = req.cookies.userData;

    if (!userCookie) {
        return res.status(401).json({ message: "No autorizado" });
    }

    try {
        req.user = JSON.parse(userCookie);
        next();
    } catch (error) {
        res.status(400).json({ message: "Cookie inválida" });
    }
};

module.exports = authMiddleware;