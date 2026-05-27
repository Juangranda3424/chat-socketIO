const user = require('./src/services/userService');
const messageService = require('./src/services/messageService');
const supabase = require('./src/config/supabase');

module.exports = (httpServer) => {
  const { Server } = require("socket.io");
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5174"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", socket => {
    console.log('Usuario conectado:', socket.id);

    // Unirse a un grupo (room)
    socket.on("join group", (groupId) => {
        socket.join(groupId);
        console.log(`Usuario ${socket.id} se unió al grupo ${groupId}`);
    });

    // Salir de un grupo (room)
    socket.on("leave group", (groupId) => {
        socket.leave(groupId);
        console.log(`Usuario ${socket.id} salió del grupo ${groupId}`);
    });

    // Escuchar mensajes de chat en un grupo específico
    socket.on("chat message", async (msg) => {
        console.log("Mensaje recibido en grupo:", msg.grupo_id);

        try {
            // Buscar el usuario_id por nombre
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('nombre', msg.user)
                .single();

            if (!profile) {
                console.error('Usuario no encontrado:', msg.user);
                return;
            }

            // Guardar el mensaje en Supabase
            const savedMessage = await messageService.createMessage({
                grupo_id: msg.grupo_id,
                usuario_id: profile.id,
                texto: msg.text,
                tipo: 'normal'
            });

            console.log('Mensaje guardado:', savedMessage);

            // Emitir el mensaje guardado a los miembros del grupo
            io.to(msg.grupo_id).emit('chat message', savedMessage);
        } catch (error) {
            console.error('Error al guardar mensaje:', error);
            // Si hay error, emitir el mensaje original
            io.to(msg.grupo_id).emit('chat message', msg);
        }
    });

    socket.on("alert", async (msg) => {
        console.log("Alerta recibida en grupo:", msg.grupo_id);

        try {
            // Buscar el usuario_id por nombre
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('nombre', msg.user)
                .single();

            if (!profile) {
                console.error('Usuario no encontrado:', msg.user);
                return;
            }

            // Determinar el tipo de alerta
            let tipo = 'normal';
            if (msg.text.includes('ALERTA IMPORTANTE')) {
                tipo = 'alerta_importante';
            } else if (msg.text.includes('ALERTA INFORMATIVA')) {
                tipo = 'alerta_informativa';
            }

            // Guardar el mensaje en Supabase
            const savedMessage = await messageService.createMessage({
                grupo_id: msg.grupo_id,
                usuario_id: profile.id,
                texto: msg.text,
                tipo: tipo
            });

            console.log('Alerta guardada:', savedMessage);

            // Emitir el mensaje guardado a los miembros del grupo
            io.to(msg.grupo_id).emit('chat message', savedMessage);
        } catch (error) {
            console.error('Error al guardar alerta:', error);
            // Si hay error, emitir el mensaje original
            io.to(msg.grupo_id).emit('chat message', msg);
        }
    });

    // Escuchar cuando alguien se desconecta
    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });

    // Escuchar cuando alguien escribe (broadcast al grupo)
    socket.on('typing', (data) => {
        if (data.groupId) {
            socket.to(data.groupId).emit('typing', data);
        } else {
            socket.broadcast.emit('typing', data);
        }
    });

    // Escuchar cuando alguien deja de escribir (broadcast al grupo)
    socket.on('stopTyping', (data) => {
        if (data.groupId) {
            socket.to(data.groupId).emit('stopTyping', data);
        } else {
            socket.broadcast.emit('stopTyping', data);
        }
    });

  })

};