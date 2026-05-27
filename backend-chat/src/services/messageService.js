const supabase = require('../config/supabase');

const createMessage = async (messageData) => {
    console.log("Creando mensaje:", messageData);

    const { grupo_id, usuario_id, texto, tipo } = messageData;

    const { data, error } = await supabase
        .from('mensajes')
        .insert([
            {
                grupo_id,
                usuario_id,
                texto,
                tipo: tipo || 'normal',
            }
        ])
        .select(`
            *,
            profiles (id, nombre, email)
        `)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return {
        id: data.id,
        grupo_id: data.grupo_id,
        user: data.profiles.nombre,
        text: data.texto,
        tipo: data.tipo,
        createdAt: data.created_at,
        usuario_id: data.usuario_id
    };
};

const getMessagesByGroup = async (groupId) => {
    const { data, error } = await supabase
        .from('mensajes')
        .select(`
            *,
            profiles (id, nombre, email)
        `)
        .eq('grupo_id', groupId)
        .order('created_at', { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return data.map(msg => ({
        id: msg.id,
        grupo_id: msg.grupo_id,
        user: msg.profiles?.nombre || 'Usuario desconocido',
        text: msg.texto,
        tipo: msg.tipo,
        createdAt: msg.created_at,
        usuario_id: msg.usuario_id
    }));
};

const deleteMessage = async (messageId, userId) => {
    // Verificar que el usuario es el creador del mensaje
    const { data: message } = await supabase
        .from('mensajes')
        .select('*')
        .eq('id', messageId)
        .single();

    if (message.usuario_id !== userId) {
        throw new Error("No tienes permiso para eliminar este mensaje");
    }

    const { error } = await supabase
        .from('mensajes')
        .delete()
        .eq('id', messageId);

    if (error) {
        throw new Error(error.message);
    }

    return { message: "Mensaje eliminado exitosamente" };
};

module.exports = {
    createMessage,
    getMessagesByGroup,
    deleteMessage
};
