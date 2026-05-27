<template>
  <div
    class="min-h-screen flex items-center justify-center bg-surface-100 dark:bg-surface-900 p-4"
  >
    <Card class="w-full max-w-md shadow-2 border-round-2xl">
      <!-- Título -->
      <template #title>
        <div class="text-center">
          <i
            class="pi pi-sign-in text-4xl text-primary mb-3"
            style="display: block"
          ></i>
          <h2 class="text-2xl font-bold m-0">Iniciar Sesión</h2>
          <p class="text-color-secondary mt-2 mb-0">
            Ingresa tus credenciales para acceder al chat
          </p>
        </div>
      </template>

      <!-- Contenido -->
      <template #content>
        <div class="flex flex-col gap-3">
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
              @keyup.enter="onLogin"
            />
          </div>

          <!-- Contraseña -->
          <div class="flex flex-col gap-1">
            <label for="password" class="font-medium">Contraseña</label>
            <Password
              id="password"
              v-model="form.password"
              placeholder="Ingrese su contraseña"
              toggleMask
              class="w-full"
              inputClass="w-full"
              :disabled="loading"
              @keyup.enter="onLogin"
            />
          </div>

          <!-- Mensaje de error -->
          <Message v-if="errorMsg" severity="error" :closable="false">
            {{ errorMsg }}
          </Message>

          <!-- Botón -->
          <Button
            label="Ingresar al Chat"
            icon="pi pi-comments"
            class="w-full mt-2"
            :loading="loading"
            :disabled="!isFormValid"
            @click="onLogin"
          />

          <!-- Texto adicional -->
          <small class="text-center text-color-secondary mt-2">
            ¿No tienes cuenta? 
            <a @click="goToRegister" class="text-primary cursor-pointer font-semibold">Regístrate aquí</a>
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
  email: '',
  password: ''
})

// Validación básica del formulario
const isFormValid = computed(() => {
  return (
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email) &&
    form.value.password.length >= 6
  )
})

async function onLogin() {
  // Evitar envío si el formulario no es válido
  if (!isFormValid.value) {
    errorMsg.value =
      'Complete todos los campos correctamente. La contraseña debe tener al menos 6 caracteres.'
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    const data = await authService.login(form.value)

    console.log('Usuario logueado:', data.user)

    // Redirigir al chat
    await router.push({ name: 'chat' })
  } catch (err) {
    errorMsg.value =
      err?.response?.data?.message ||
      err?.message ||
      'Error al intentar iniciar sesión'
  } finally {
    loading.value = false
  }
}

function goToRegister() {
  router.push({ name: 'register' })
}
</script>
