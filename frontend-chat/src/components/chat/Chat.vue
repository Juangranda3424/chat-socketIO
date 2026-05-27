<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4 flex items-center justify-center"
  >
    <div
      class="w-full max-w-6xl h-[92vh] bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl overflow-hidden flex"
    >
      <!-- Panel lateral de grupos -->
      <div class="w-64 border-r border-slate-200 bg-white/50 backdrop-blur-md flex flex-col">
        <div class="p-4 border-b border-slate-200">
          <h2 class="text-lg font-bold text-slate-800 m-0">Mis Grupos</h2>
        </div>
        <div class="flex-1 overflow-y-auto p-2 space-y-2">
          <div
            v-for="group in groups"
            :key="group.id"
            @click="selectGroup(group)"
            class="p-3 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md border-2"
            :class="selectedGroup?.id === group.id
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-600 shadow-lg scale-105'
              : 'bg-white/70 text-slate-700 border-transparent hover:border-blue-200'"
          >
            <div class="font-semibold text-sm">{{ group.nombre }}</div>
            <div class="text-xs opacity-75 mt-1">{{ group.descripcion || 'Sin descripción' }}</div>
          </div>
        </div>
        <div class="p-4 border-t border-slate-200">
          <Button
            icon="pi pi-plus"
            label="Crear Grupo"
            @click="showCreateGroupDialog = true"
            class="w-full"
            size="small"
          />
        </div>
      </div>

      <!-- Área principal de chat -->
      <div class="flex-1 flex flex-col h-full">
        <div
          class="px-6 py-4 border-b border-slate-200 bg-white/70 backdrop-blur-md flex items-center justify-between flex-shrink-0"
        >
          <div class="flex items-center gap-4">
            <Avatar
              icon="pi pi-comments"
              shape="circle"
              size="large"
              class="bg-primary shadow-lg"
            />
            <div>
              <h1 class="text-xl font-bold text-slate-800 m-0">
                {{ selectedGroup ? selectedGroup.nombre : 'Chat Comunitario' }}
              </h1>
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
            <Button
              icon="pi pi-sign-out"
              @click="logout"
              severity="danger"
              text
              rounded
              v-tooltip="'Cerrar sesión'"
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
      </div>

      <!-- Área de escritura -->
      <div
        class="p-4 border-t border-slate-200 bg-white/80 backdrop-blur-md flex-shrink-0"
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

    <!-- Dialog para crear grupo -->
    <Dialog v-model:visible="showCreateGroupDialog" modal header="Crear Nuevo Grupo" :style="{ width: '400px' }">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label for="groupName" class="font-medium">Nombre del grupo</label>
          <InputText
            id="groupName"
            v-model="newGroupName"
            placeholder="Ej: Equipo de trabajo"
            class="w-full"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label for="groupDescription" class="font-medium">Descripción (opcional)</label>
          <InputText
            id="groupDescription"
            v-model="newGroupDescription"
            placeholder="Descripción del grupo"
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" @click="showCreateGroupDialog = false" severity="secondary" />
        <Button label="Crear" @click="createGroup" :disabled="!newGroupName.trim()" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { io } from 'socket.io-client'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'
import { groupService } from '@/services/groupService'
import { messageService } from '@/services/messageService'

import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import Dialog from 'primevue/dialog'

const router = useRouter()

const message = ref('')
const messages = ref([])
const chatWindow = ref(null)
const currentUser = ref(null)
const groups = ref([])
const selectedGroup = ref(null)
const showCreateGroupDialog = ref(false)
const newGroupName = ref('')
const newGroupDescription = ref('')

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

// Cargar grupos del usuario
const loadGroups = async () => {
  try {
    const data = await groupService.getGroups()
    groups.value = data.groups || []
    
    // Seleccionar el primer grupo por defecto si existe
    if (groups.value.length > 0 && !selectedGroup.value) {
      selectGroup(groups.value[0])
    }
  } catch (error) {
    console.error('Error al cargar grupos:', error)
  }
}

// Seleccionar un grupo y unirse al room
const selectGroup = async (group) => {
  if (selectedGroup.value?.id === group.id) return
  
  // Salir del room anterior si existe
  if (selectedGroup.value && socket) {
    socket.emit('leave group', selectedGroup.value.id)
  }
  
  selectedGroup.value = group
  messages.value = [] // Limpiar mensajes del grupo anterior
  
  // Unirse al nuevo room
  if (socket) {
    socket.emit('join group', group.id)
  }
  
  // Cargar mensajes del grupo
  try {
    const data = await messageService.getMessagesByGroup(group.id)
    messages.value = data.messages || []
    scrollToBottom()
  } catch (error) {
    console.error('Error al cargar mensajes:', error)
  }
}

// Crear un nuevo grupo
const createGroup = async () => {
  if (!newGroupName.value.trim()) return
  
  try {
    const data = await groupService.createGroup({
      nombre: newGroupName.value,
      descripcion: newGroupDescription.value
    })
    
    showCreateGroupDialog.value = false
    newGroupName.value = ''
    newGroupDescription.value = ''
    
    // Recargar grupos
    await loadGroups()
  } catch (error) {
    console.error('Error al crear grupo:', error)
  }
}

// Función que avisa al servidor que estoy escribiendo
function handleTyping() {
  if (!socket) return;

  // Emitimos el evento con el groupId
  socket.emit('typing', { 
    user: currentUser.value.nombre,
    groupId: selectedGroup.value?.id
  });

  // Si ya había un temporizador, lo borramos
  clearTimeout(typingTimeout);

  // Configuramos uno nuevo: si pasan 2 segundos sin tocar nada, avisamos que paramos
  typingTimeout = setTimeout(() => {
    socket.emit('stopTyping', { 
      user: currentUser.value.nombre,
      groupId: selectedGroup.value?.id
    });
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
      // Solo agregar mensajes del grupo seleccionado
      if (!selectedGroup.value || msg.grupo_id === selectedGroup.value.id) {
        messages.value.push({
          ...msg,
          createdAt: msg.createdAt || new Date()
        })

        scrollToBottom()
      }
    })

    // Escuchar a otros usuarios escribiendo
    socket.on('typing', (data) => {
        if (!selectedGroup.value || data.groupId === selectedGroup.value.id) {
            typingUser.value = data.user;
        }
    });

    // Escuchar cuando otros dejan de escribir
    socket.on('stopTyping', (data) => {
        if (!selectedGroup.value || data.groupId === selectedGroup.value.id) {
            typingUser.value = null;
        }
    });

    // Cargar grupos
    loadGroups()

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

  if (!text || !socket || !currentUser.value || !selectedGroup.value) return

  socket.emit('chat message', {
    user: currentUser.value.nombre,
    text,
    grupo_id: selectedGroup.value.id,
    createdAt: new Date()
  })

  message.value = ''
}


function sendMessageAlert() {
  const text = `ALERTA IMPORTANTE: ${message.value.trim()}`

  if (!text || !socket || !currentUser.value || !selectedGroup.value) return

  socket.emit('alert', {
    user: currentUser.value.nombre,
    text,
    grupo_id: selectedGroup.value.id,
    createdAt: new Date()
  })

  message.value = ''
}


function sendMessageAlertInfo() {
  const text = `ALERTA INFORMATIVA: ${message.value.trim()}`

  if (!text || !socket || !currentUser.value || !selectedGroup.value) return

  socket.emit('alert', {
    user: currentUser.value.nombre,
    text,
    grupo_id: selectedGroup.value.id,
    createdAt: new Date()
  })

  message.value = ''
}

function logout() {
  Cookies.remove('userData')
  router.push({ name: 'login' })
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