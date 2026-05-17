const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authMiddleware = require('../middleware/authMiddleware');
const fs = require('fs');
const path = require('path');
// Ruta pública
router.post('/register', userController.signup);

// Ruta middleware
router.get('/me', authMiddleware, userController.getProfile);

// Leer un archivo de forma asíncrona
router.get('/io-test', (req, res) => {
    const filePath = path.join(__dirname, '..', '..', 'package.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            return res.status(500).json({ error: 'Error al leer el archivo' });
        }
        res.json({ content: data });
    });
});

// Leer un archivo de forma síncrona
router.get('/cpu-block', (req, res) => {
    const resultado = calcularFibonacci(40);
    res.send(`El resultado del cálculo intensivo es: ${resultado}`);
});

// Función auxiliar para simular trabajo de CPU
function calcularFibonacci(n) {
    if (n <= 1) return n;
    return calcularFibonacci(n - 1) + calcularFibonacci(n - 2);
}

module.exports = router;