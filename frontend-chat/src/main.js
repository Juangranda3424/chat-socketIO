import { createApp } from 'vue';
import App from './App.vue';
import router from '@/router/router.js';
import '@/css/general.css'
import 'primeicons/primeicons.css'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';

createApp(App)
.use(router)
.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.my-app-dark',
        }
    }
})

.mount('#app')