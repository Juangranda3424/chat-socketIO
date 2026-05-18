const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { calcularFibonacci } = require('../services/simulateService');
const fs = require('fs');
const path = require('path');
// Ruta pública
router.post('/register', userController.signup);

// Ruta middleware
router.get('/me', authMiddleware, userController.getProfile);

// Define una ruta GET en Express accesible desde:
// http://localhost:3000/io-test
router.get('/io-test', (req, res) => {

    // Construye la ruta absoluta al archivo package.json.
    // __dirname: carpeta actual del archivo donde está este código.
    // '..', '..': sube dos niveles en la estructura de carpetas.
    // 'package.json': archivo que se desea leer.
    const filePath = path.join(__dirname, '..', '..', 'package.json');

    // Lee el archivo de manera asíncrona (no bloquea el event loop de Node.js).
    // 'utf8' indica que el contenido se interpretará como texto.
    fs.readFile(filePath, 'utf8', (err, data) => {

        // Si ocurre un error (por ejemplo, el archivo no existe o no hay permisos)
        if (err) {

            // Muestra el error en la consola del servidor.
            console.error('Error al leer el archivo:', err);

            // Devuelve al cliente una respuesta HTTP 500 (Internal Server Error)
            // con un mensaje en formato JSON.
            return res.status(500).json({
                error: 'Error al leer el archivo'
            });
        }

        // Si la lectura fue exitosa, envía al cliente el contenido del archivo
        // dentro de un objeto JSON.
        // Ejemplo de respuesta:
        // {
        //   "content": "{ ... contenido de package.json ... }"
        // }
        res.json({
            content: data
        });
    });
});

// Define una ruta GET en Express accesible desde:
// http://localhost:3000/cpu-block
router.get('/cpu-block', (req, res) => {

    // Llama a la función calcularFibonacci(40).
    // Esta función realiza un cálculo intensivo de CPU, especialmente si
    // está implementada de forma recursiva.
    //
    // Ejemplo:
    // function calcularFibonacci(n) {
    //     if (n <= 1) return n;
    //     return calcularFibonacci(n - 1) + calcularFibonacci(n - 2);
    // }
    //
    // Calcular Fibonacci de 40 requiere miles de llamadas recursivas y puede
    // tardar varios segundos dependiendo del hardware.
    const resultado = calcularFibonacci(40);

    // Envía al cliente una respuesta en texto plano con el resultado obtenido.
    // Ejemplo de respuesta:
    // "El resultado del cálculo intensivo es: 102334155"
    res.send(`El resultado del cálculo intensivo es: ${resultado}`);
});


module.exports = router;