# Configuración de Supabase

Este proyecto ahora está integrado con Supabase para autenticación, gestión de grupos y mensajes.

## Pasos de Configuración

### 1. Crear un proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Espera a que el proyecto se inicialice (puede tomar unos minutos)

### 2. Crear las tablas en Supabase

En el dashboard de Supabase, ve al SQL Editor y ejecuta los siguientes scripts:

#### Tabla `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger para crear perfil automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'nombre', 'Usuario')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

#### Tabla `grupos`
```sql
CREATE TABLE grupos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  creador_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### Tabla `grupo_miembros`
```sql
CREATE TABLE grupo_miembros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grupo_id UUID REFERENCES grupos(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(grupo_id, usuario_id)
);
```

#### Tabla `mensajes`
```sql
CREATE TABLE mensajes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grupo_id UUID REFERENCES grupos(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  tipo TEXT DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 3. Configurar las variables de entorno

#### Backend
Crea un archivo `.env` en `backend-chat/`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

Obtén estos valores desde:
- Project Settings → API → Project URL
- Project Settings → API → anon public key

#### Frontend
Crea un archivo `.env` en `frontend-chat/`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Habilitar Row Level Security (RLS) - Opcional pero recomendado

```sql
-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE grupo_miembros ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Políticas para grupos
CREATE POLICY "Users can view groups they are members of" ON grupos
  FOR SELECT USING (
    id IN (SELECT grupo_id FROM grupo_miembros WHERE usuario_id = auth.uid())
  );

CREATE POLICY "Users can create groups" ON grupos
  FOR INSERT WITH CHECK (creador_id = auth.uid());

-- Políticas para grupo_miembros
CREATE POLICY "Users can view group memberships" ON grupo_miembros
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Users can add themselves to groups" ON grupo_miembros
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

-- Políticas para mensajes
CREATE POLICY "Users can view messages in their groups" ON mensajes
  FOR SELECT USING (
    grupo_id IN (SELECT grupo_id FROM grupo_miembros WHERE usuario_id = auth.uid())
  );

CREATE POLICY "Users can create messages in their groups" ON mensajes
  FOR INSERT WITH CHECK (
    usuario_id = auth.uid() AND
    grupo_id IN (SELECT grupo_id FROM grupo_miembros WHERE usuario_id = auth.uid())
  );
```

## Cambios Realizados

### Backend
- ✅ Instalación de `@supabase/supabase-js`
- ✅ Configuración de Supabase en `src/config/supabase.js`
- ✅ Servicio de autenticación con Supabase (login/register) en `src/services/userService.js`
- ✅ Servicio de grupos en `src/services/groupService.js`
- ✅ Servicio de mensajes en `src/services/messageService.js`
- ✅ Controlador de usuarios actualizado en `src/controller/userController.js`
- ✅ Nuevo controlador de grupos en `src/controller/groupController.js`
- ✅ Nuevo controlador de mensajes en `src/controller/messageController.js`
- ✅ Rutas actualizadas en `src/routes/router.js`
- ✅ RealTimeServer modificado para soportar broadcast por grupos usando rooms

### Frontend
- ✅ Instalación de `@supabase/supabase-js`
- ✅ Configuración de Supabase en `src/services/supabase.js`
- ✅ AuthService actualizado con función login
- ✅ Servicio de grupos en `src/services/groupService.js`
- ✅ Servicio de mensajes en `src/services/messageService.js`
- ✅ Chat.vue modificado para soportar selección de grupos
- ✅ Nuevo componente Login.vue
- ✅ Nueva página LoginPage.vue
- ✅ Router actualizado con ruta de login

## Funcionalidades Implementadas

1. **Autenticación con Supabase**
   - Registro de usuarios
   - Login de usuarios
   - Sesión mantenida en cookies

2. **Gestión de Grupos**
   - Crear grupos
   - Ver grupos del usuario
   - Unirse a grupos
   - Ver miembros de un grupo
   - Eliminar grupos

3. **Mensajes en Tiempo Real**
   - Enviar mensajes a grupos específicos
   - Recibir mensajes en tiempo real usando Socket.IO
   - Broadcast de eventos por grupos (rooms)
   - Indicador de "escribiendo"

4. **Interfaz de Usuario**
   - Panel lateral con lista de grupos
   - Selección de grupo activo
   - Diálogo para crear nuevos grupos
   - Página de login separada
   - Página de registro

## Ejecutar el Proyecto

### Backend
```bash
cd backend-chat
npm install
npm start
```

### Frontend
```bash
cd frontend-chat
npm install
npm run dev
```

## Notas Importantes

- Asegúrate de configurar las variables de entorno antes de ejecutar el proyecto
- El backend debe estar corriendo en el puerto 3000
- El frontend debe estar corriendo en el puerto 5173
- Socket.IO está configurado para trabajar con CORS desde localhost:5173
