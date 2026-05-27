const userService = require('../services/userService');

const signup = async (req, res) => {
    try {
        console.log("Datos recibidos para registro:", req.body);
        const user = await userService.registerUser(req.body);

        res.cookie('userData', JSON.stringify(user), {
            httpOnly: false,
            maxAge: 3600000 
        });

        res.status(201).json({ message: "Registrado y sesión iniciada", user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        console.log("Datos recibidos para login:", req.body);
        const user = await userService.loginUser(req.body);

        res.cookie('userData', JSON.stringify(user), {
            httpOnly: false,
            maxAge: 3600000 
        });

        res.status(200).json({ message: "Sesión iniciada", user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "No autorizado" });
        }
        
        const profile = await userService.getUserProfile(userId);
        res.json({ profile });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { signup, login, getProfile };