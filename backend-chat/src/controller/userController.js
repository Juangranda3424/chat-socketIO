const userService = require('../services/userService');

const signup = async (req, res) => {
    try {
        console.log("Datos recibidos para registro:", req.body); // Debug: Ver qué datos se están recibiendo
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

const getProfile = (req, res) => {
    res.json({ profile: req.user });
};

module.exports = { signup, getProfile };