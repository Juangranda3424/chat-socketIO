import { createRouter, createWebHistory } from 'vue-router';
import Cookies from 'js-cookie';

const ChatPage = () => import('@/pages/ChatPage.vue');
const RegisterPage = () => import('@/pages/RegisterPage.vue');
const LoginPage = () => import('@/pages/LoginPage.vue');


const routes = [
    // rutas
    {
        path: "/",
        redirect: "/login"
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'notfound',
        redirect: '/login'
    },
    {
        path: '/login', 
        name: 'login',
        component: LoginPage,
        meta: { requiresAuth: false }
    },
    {
        path: '/register', 
        name: 'register',
        component: RegisterPage,
        meta: { requiresAuth: false }
    },
    {
        path: '/chat',
        name: 'chat',
        component: ChatPage,
        meta: { requiresAuth: true }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    // 1. Buscamos la cookie que definiste en tu backend como 'userData'
    const isAuthenticated = Cookies.get('userData');

    // 2. Si la ruta requiere autenticación y NO hay cookie
    if (to.meta.requiresAuth && !isAuthenticated) {
        // Redirigir a la página de login
        next({ name: 'login' });
    } 
    // 3. Si el usuario ya está autenticado e intenta ir al login o registro
    else if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
        // Redirigir directamente al chat
        next({ name: 'chat' });
    } 
    // 4. En cualquier otro caso, permitir la navegación
    else {
        next();
    }
});

export default router;