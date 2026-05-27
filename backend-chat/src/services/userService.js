const supabase = require('../config/supabase');

const registerUser = async (userData) => {
    console.log("Registrando usuario:", userData);

    const { email, password, nombre } = userData;

    // Registrar usuario en Supabase Auth con metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                nombre: nombre
            }
        }
    });

    if (authError) {
        throw new Error(authError.message);
    }

    // El trigger creará automáticamente el perfil en la tabla profiles
    // Esperar un momento para que el trigger se ejecute
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
        id: authData.user.id,
        nombre: nombre,
        email: email,
        access_token: authData.session?.access_token
    };
};

const loginUser = async (userData) => {
    console.log("Login usuario:", userData);

    const { email, password } = userData;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (authError) {
        throw new Error(authError.message);
    }

    // Obtener perfil del usuario
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

    if (profileError) {
        throw new Error(profileError.message);
    }

    return { 
        id: authData.user.id, 
        nombre: profileData.nombre, 
        email: email,
        access_token: authData.session.access_token
    };
};

const getUserProfile = async (userId) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

module.exports = { registerUser, loginUser, getUserProfile };