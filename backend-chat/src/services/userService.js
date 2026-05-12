const bcrypt = require('bcryptjs');

// DB
const users = [];

const registerUser = async (userData) => {

    console.log("Registrando usuario:", userData); // Debug: Ver qué datos se están recibiendo

    const { email, password, nombre } = userData;

    if (users.find(u => u.email === email)) {
        throw new Error("El usuario ya existe");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = { id: Date.now(), email, nombre, password: hashedPassword };
    users.push(newUser);

    return { id: newUser.id, nombre: newUser.nombre, email: newUser.email };
};

module.exports = { registerUser };