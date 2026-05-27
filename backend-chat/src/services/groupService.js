const supabase = require('../config/supabase');

const createGroup = async (groupData) => {
    console.log("Creando grupo:", groupData);

    const { nombre, descripcion, creador_id } = groupData;

    const { data, error } = await supabase
        .from('grupos')
        .insert([
            {
                nombre,
                descripcion,
                creador_id,
            }
        ])
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    // Agregar al creador como miembro del grupo
    await addMemberToGroup(data.id, creador_id);

    return data;
};

const getGroups = async (userId) => {
    const { data, error } = await supabase
        .from('grupo_miembros')
        .select(`
            grupos (*)
        `)
        .eq('usuario_id', userId);

    if (error) {
        throw new Error(error.message);
    }

    return data.map(item => item.grupos);
};

const getGroupById = async (groupId) => {
    const { data, error } = await supabase
        .from('grupos')
        .select('*')
        .eq('id', groupId)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

const addMemberToGroup = async (groupId, userId) => {
    const { data, error } = await supabase
        .from('grupo_miembros')
        .insert([
            {
                grupo_id: groupId,
                usuario_id: userId,
            }
        ])
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

const getGroupMembers = async (groupId) => {
    const { data, error } = await supabase
        .from('grupo_miembros')
        .select(`
            usuario_id,
            profiles (id, nombre, email)
        `)
        .eq('grupo_id', groupId);

    if (error) {
        throw new Error(error.message);
    }

    return data.map(item => item.profiles);
};

const deleteGroup = async (groupId, userId) => {
    // Verificar que el usuario es el creador
    const { data: group } = await getGroupById(groupId);
    
    if (group.creador_id !== userId) {
        throw new Error("No tienes permiso para eliminar este grupo");
    }

    const { error } = await supabase
        .from('grupos')
        .delete()
        .eq('id', groupId);

    if (error) {
        throw new Error(error.message);
    }

    return { message: "Grupo eliminado exitosamente" };
};

module.exports = {
    createGroup,
    getGroups,
    getGroupById,
    addMemberToGroup,
    getGroupMembers,
    deleteGroup
};
