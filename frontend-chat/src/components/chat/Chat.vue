<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4 flex items-center justify-center"
  >
    <div
      class="w-full max-w-6xl h-[92vh] bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
    >
      <div
        class="px-6 py-4 border-b border-slate-200 bg-white/70 backdrop-blur-md flex items-center justify-between"
      >
        <div class="flex items-center gap-4">
          <Avatar
            icon="pi pi-comments"
            shape="circle"
            size="large"
            class="bg-primary shadow-lg"
          />
          <div>
            <h1 class="text-xl font-bold text-slate-800 m-0">Chat Comunitario</h1>
            <p class="text-sm text-emerald-500 font-medium m-0">
              ● Conectados en tiempo real
            </p>
                    <!-- INDICADOR DE ESCRIBIENDO -->
        <div v-if="typingUser" class="text-xs text-slate-500 italic animate-pulse ml-2 pb-2">
          {{ typingUser }} está escribiendo...
        </div>
          </div>
          
        </div>

        <div
          v-if="currentUser"
          class="flex items-center gap-3 bg-slate-100 px-3 py-2 rounded-full"
        >
          <span class="hidden sm:block font-semibold text-slate-700">
            {{ currentUser.nombre }}
          </span>
          <Avatar
            :label="currentUser.nombre.charAt(0).toUpperCase()"
            shape="circle"
            class="bg-blue-500"
          />
        </div>
      </div>

      <div
        ref="chatWindow"
        class="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-gradient-to-b from-slate-50 to-white custom-scrollbar"
      >
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="flex animate-fade-in"
          :class="
            msg.user === currentUser?.nombre
              ? 'justify-end'
              : 'justify-start'
          "
        >
          <div class="max-w-[75%]">
            <div
              v-if="msg.user !== currentUser?.nombre"
              class="text-xs font-semibold text-slate-500 mb-1 ml-2"
            >
              {{ msg.user }}
            </div>

            <div
              class="px-4 py-3 rounded-3xl shadow-md transition-all duration-200 hover:shadow-lg"
              :class="[
                msg.text?.toLowerCase().includes('alerta importante')
                  ? 'bg-red-500 text-white text-center font-bold '
                  : msg.text?.toLowerCase().includes('alerta informativa')
                    ? 'bg-yellow-500 text-gray-800 text-center font-bold '
                    : msg.user === currentUser?.nombre
                      ? 'bg-primary rounded-br-md'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-md'
              ]"
            >
            <img 
              src="../../assets/alert.png" 
              alt="Alerta" 
              class="w-50 h-50 mx-auto block"
              v-if="msg.text?.toLowerCase().includes('alerta importante')"
            >    
            <img 
              src="../../assets/info.png" 
              alt="Alerta" 
              class="w-50 h-50 mx-auto block"
              v-if="msg.text?.toLowerCase().includes('alerta informativa')"
            >               
            <p class="m-0 leading-relaxed break-words">
                {{ msg.text }}  
              </p>
            </div>

            <!-- Hora -->
            <div
              class="text-[11px] text-slate-400 mt-1 px-2"
              :class="
                msg.user === currentUser?.nombre
                  ? 'text-right'
                  : 'text-left'
              "
            >
              {{ formatTime(msg.createdAt || new Date()) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Área de escritura -->
      <div
        class="p-4 border-t border-slate-200 bg-white/80 backdrop-blur-md"
      >
        <div class="flex items-center gap-3">
          <div class="flex-1">
            <InputText
              v-model="message"
              @input="handleTyping"
              @keyup.enter="sendMessage"
              placeholder="Escribe un mensaje..."
              class="w-full rounded-full"
            />
          </div>

          <Button
            icon="pi pi-send"
            @click="sendMessage"
            :disabled="!message.trim()"
            class="p-button-rounded shadow-lg"
            size="large"
          />
          
          <!-- Boton de alerta  -->
          <Button
            icon="pi pi-exclamation-triangle"
            @click="sendMessageAlert"
            :disabled="!message.trim()"
            class="p-button-rounded shadow-lg"
            size="large"
            severity="danger"
          />
          <Button
            icon="pi pi-info-circle"
            @click=" sendMessageAlertInfo"
            :disabled="!message.trim()"
            class="p-button-rounded shadow-lg"
            size="large"
            severity="warn"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { io } from 'socket.io-client'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'

import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'

const router = useRouter()

const message = ref('')
const messages = ref([])
const chatWindow = ref(null)
const currentUser = ref(null)

const typingUser = ref(null); // Para guardar el nombre del que escribe
let typingTimeout = null;

let socket = null

const scrollToBottom = async () => {
  await nextTick()

  if (chatWindow.value) {
    chatWindow.value.scrollTo({
      top: chatWindow.value.scrollHeight,
      behavior: 'smooth'
    })
  }
}

// Función que avisa al servidor que estoy escribiendo
function handleTyping() {
  if (!socket) return;

  // Emitimos el evento
  socket.emit('typing', { user: currentUser.value.nombre });

  // Si ya había un temporizador, lo borramos
  clearTimeout(typingTimeout);

  // Configuramos uno nuevo: si pasan 2 segundos sin tocar nada, avisamos que paramos
  typingTimeout = setTimeout(() => {
    socket.emit('stopTyping', { user: currentUser.value.nombre });
  }, 2000);
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  const cookieData = Cookies.get('userData')

  if (!cookieData) {
    router.push({ name: 'register' })
    return
  }

  try {
    currentUser.value = JSON.parse(cookieData)

    console.log('Usuario actual:', currentUser.value) 
    
    socket = io('http://localhost:3000', {
      withCredentials: true
    })

    socket.on('chat message', (msg) => {
      messages.value.push({
        ...msg,
        createdAt: msg.createdAt || new Date()
      })

      scrollToBottom()
    })

    scrollToBottom()

    // Escuchar a otros usuarios escribiendo
    socket.on('typing', (data) => {
        typingUser.value = data.user;
    });

    // Escuchar cuando otros dejan de escribir
    socket.on('stopTyping', () => {
        typingUser.value = null;
    });

  } catch (error) {
    router.push({ name: 'register' })
  }
  
})

onUnmounted(() => {
  if (socket) {
    socket.disconnect()
  }
})

function sendMessage() {
  const text = message.value.trim()

  if (!text || !socket || !currentUser.value) return

  socket.emit('chat message', {
    user: currentUser.value.nombre,
    text,
    createdAt: new Date()
  })

  message.value = ''
}


function sendMessageAlert() {
  const text = `ALERTA IMPORTANTE: ${message.value.trim()}`

  if (!text || !socket || !currentUser.value) return

  socket.emit('alert', {
    user: currentUser.value.nombre,
    text,
    createdAt: new Date()
  })

  message.value = ''
}


function sendMessageAlertInfo() {
  const text = `ALERTA INFORMATIVA: ${message.value.trim()}`

  if (!text || !socket || !currentUser.value) return

  socket.emit('alert', {
    user: currentUser.value.nombre,
    text,
    createdAt: new Date()
  })

  message.value = ''
}


</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.animate-fade-in {
  animation: fadeInUp 0.25s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>