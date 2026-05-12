<template>
  <div
    class="min-h-screen flex items-center justify-center bg-surface-100 dark:bg-surface-900 p-4"
  >
    <Card class="w-full max-w-md shadow-2 border-round-2xl">
      <!-- Título -->
      <template #title>
        <div class="text-center">
          <i
            class="pi pi-user-plus text-4xl text-primary mb-3"
            style="display: block"
          ></i>
          <h2 class="text-2xl font-bold m-0">Registro de Usuario</h2>
          <p class="text-color-secondary mt-2 mb-0">
            Crea tu cuenta para ingresar al chat en tiempo real
          </p>
        </div>
      </template>

      <!-- Contenido -->
      <template #content>
        <div class="flex flex-col gap-3">
          <!-- Nombre -->
          <div class="flex flex-col gap-1">
            <label for="nombre" class="font-medium">Nombre completo</label>
            <InputText
              id="nombre"
              v-model.trim="form.nombre"
              placeholder="Ingrese su nombre"
              class="w-full"
              :disabled="loading"
              @keyup.enter="onRegister"
            />
          </div>

          <!-- Correo -->
          <div class="flex flex-col gap-1">
            <label for="email" class="font-medium">Correo electrónico</label>
            <InputText
              id="email"
              v-model.trim="form.email"
              type="email"
              placeholder="ejemplo@correo.com"
              class="w-full"
              :disabled="loading"
              @keyup.enter="onRegister"
            />
          </div>

          <!-- Contraseña -->
          <div class="flex flex-col gap-1">
            <label for="password" class="font-medium">Contraseña</label>
            <Password
              id="password"
              v-model="form.password"
              placeholder="Ingrese su contraseña"
              :feedback="true"
              toggleMask
              class="w-full"
              inputClass="w-full"
              :disabled="loading"
              @keyup.enter="onRegister"
            />
          </div>

          <!-- Mensaje de error -->
          <Message v-if="errorMsg" severity="error" :closable="false">
            {{ errorMsg }}
          </Message>

          <!-- Botón -->
          <Button
            label="Registrarse e Ingresar al Chat"
            icon="pi pi-comments"
            class="w-full mt-2"
            :loading="loading"
            :disabled="!isFormValid"
            @click="onRegister"
          />

          <!-- Texto adicional -->
          <small class="text-center text-color-secondary mt-2">
            Al registrarte podrás acceder al chat en tiempo real.
          </small>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/authService'

import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'

const router = useRouter()

const loading = ref(false)
const errorMsg = ref('')

const form = ref({
  nombre: '',
  email: '',
  password: ''
})

// Validación básica del formulario
const isFormValid = computed(() => {
  return (
    form.value.nombre.trim().length >= 3 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email) &&
    form.value.password.length >= 6
  )
})

async function onRegister() {
  // Evitar envío si el formulario no es válido
  if (!isFormValid.value) {
    errorMsg.value =
      'Complete todos los campos correctamente. La contraseña debe tener al menos 6 caracteres.'
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    const data = await authService.register(form.value)

    console.log('Usuario registrado:', data.user)

    // Redirigir al chat
    await router.push({ name: 'chat' })
  } catch (err) {
    errorMsg.value =
      err?.response?.data?.message ||
      err?.message ||
      'Error al intentar registrarse'
  } finally {
    loading.value = false
  }
}
</script>