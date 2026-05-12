module.exports = (httpServer) => {
  const { Server } = require("socket.io");
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", socket => {
    console.log('Usuario conectado:', socket.id);

    // Escuchar mensajes de chat
    socket.on("chat message", msg => {
        console.log("Mensaje recibido:", msg);

        io.emit('chat message', msg);

    });

    // Escuchar cuando alguien se desconecta
    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });

    // Escuchar cuando alguien escribe
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data);
    });

    // Escuchar cuando alguien deja de escribir
    socket.on('stopTyping', (data) => {
        socket.broadcast.emit('stopTyping', data);
    });


  })

};