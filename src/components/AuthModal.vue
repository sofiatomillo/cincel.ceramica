<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 min-h-screen"
        @click.self="$emit('close')"
      >
        <div
          class="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-[#E6DFD5] relative m-auto animate-scale-in max-h-[92vh] flex flex-col z-[10000]"
        >
          <!-- Botón Cerrar -->
          <button
            @click="$emit('close')"
            class="absolute top-4 right-4 p-2 text-[#8D857B] hover:text-[#1E1B18] rounded-xl hover:bg-[#FAF7F2] transition-colors cursor-pointer z-10"
            aria-label="Cerrar ventana"
          >
            <X class="w-5 h-5" />
          </button>

          <!-- Selector de Modo: Administrador o Cliente -->
          <div class="grid grid-cols-2 gap-1 p-1 bg-[#FAF7F2] rounded-2xl border border-[#E6DFD5] mb-4 shrink-0">
            <button
              type="button"
              @click="setRole('customer')"
              class="py-2 px-3 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              :class="currentRole === 'customer' ? 'bg-white text-[#1E1B18] shadow-xs' : 'text-[#8D857B] hover:text-[#1E1B18]'"
            >
              <User class="w-3.5 h-3.5" />
              <span>Cliente</span>
            </button>
            <button
              type="button"
              @click="setRole('admin')"
              class="py-2 px-3 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              :class="currentRole === 'admin' ? 'bg-[#F28482] text-white shadow-xs' : 'text-[#8D857B] hover:text-[#1E1B18]'"
            >
              <Shield class="w-3.5 h-3.5" />
              <span>Administrador</span>
              <span
                class="text-[9px] px-1.5 py-0.2 rounded-md font-bold"
                :class="currentRole === 'admin' ? 'bg-white/20 text-white' : 'bg-[#F28482]/10 text-[#F28482]'"
              >
                Admin
              </span>
            </button>
          </div>

          <!-- Contenedor scrollable interior -->
          <div class="overflow-y-auto pr-1 -mr-1 flex-1">
            <!-- Cabecera dinámica según Rol -->
            <div class="text-center mb-4 pt-0.5">
              <div
                class="w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-2xs transition-colors"
                :class="currentRole === 'admin' ? 'bg-amber-100 text-[#F28482] border border-amber-200' : 'bg-[#FAF7F2] text-[#1E1B18] border border-[#E6DFD5]'"
              >
                <Shield v-if="currentRole === 'admin'" class="w-5 h-5 text-[#F28482]" />
                <Lock v-else class="w-5 h-5 text-[#8D857B]" />
              </div>
              <h2 class="font-serif text-xl sm:text-2xl font-semibold text-[#1E1B18]">
                {{ currentRole === 'admin' ? 'Acceso de Administrador' : (isRegistering ? 'Crear Cuenta de Cliente' : 'Acceso de Cliente') }}
              </h2>
              <p class="text-[11px] text-[#6B655D] mt-0.5 max-w-xs mx-auto">
                {{ currentRole === 'admin' 
                  ? 'Panel exclusivo para Sofia.Tomillo@gmail.com con control de piezas y ventas' 
                  : 'Inicia sesión para gestionar tus compras, cesta y seguimiento de pedidos' }}
              </p>
            </div>

            <!-- Alertas de Error o Info -->
            <div v-if="errorMessage" class="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600">
              <AlertCircle class="w-4 h-4 shrink-0" />
              <span>{{ errorMessage }}</span>
            </div>

            <div v-if="successMessage" class="mb-3 p-2.5 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-xs text-green-700">
              <CheckCircle2 class="w-4 h-4 shrink-0" />
              <span>{{ successMessage }}</span>
            </div>

            <!-- BLOQUE DE ADMINISTRADOR DESTACADO (si currentRole === 'admin') -->
            <div v-if="currentRole === 'admin'" class="mb-4">
              <div class="p-3.5 bg-gradient-to-br from-[#FAF7F2] to-amber-50/50 rounded-2xl border border-amber-200/90 shadow-2xs flex flex-col gap-2.5">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Shield class="w-3.5 h-3.5 text-[#F28482]" />
                    Acceso Rápido Administrador
                  </span>
                  <span class="text-[9px] bg-[#F28482] text-white font-semibold px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                </div>
                <p class="text-[11px] text-[#6B655D] leading-snug">
                  Entra con permisos totales de modificación y eliminación para la cuenta <strong>Sofia.Tomillo@gmail.com</strong>.
                </p>
                <button
                  type="button"
                  @click="handleAdminQuickLogin"
                  class="w-full py-2.5 bg-[#F28482] hover:bg-[#E06F6D] text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <Shield class="w-4 h-4" />
                  <span>Entrar como Sofia.Tomillo (Admin)</span>
                </button>
              </div>

              <div class="relative flex items-center justify-center my-3.5">
                <div class="border-t border-[#E6DFD5] w-full" />
                <span class="bg-white px-3 text-[10px] uppercase tracking-wider text-[#8D857B] shrink-0 font-medium">
                  o ingresar con Google / Clave
                </span>
                <div class="border-t border-[#E6DFD5] w-full" />
              </div>
            </div>

            <!-- Botón Principal: Continuar con Google -->
            <button
              @click="handleGoogleLogin"
              :disabled="isLoading"
              class="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white border border-[#D5CDC2] hover:border-[#1E1B18] hover:bg-[#FAF7F2] rounded-xl text-xs font-semibold text-[#1E1B18] transition-all shadow-xs cursor-pointer mb-3.5"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{{ currentRole === 'admin' ? 'Continuar con Google (Sofia.Tomillo)' : 'Continuar con Google' }}</span>
            </button>

            <!-- Divisor -->
            <div class="relative flex items-center justify-center mb-3.5">
              <div class="border-t border-[#E6DFD5] w-full" />
              <span class="bg-white px-3 text-[10px] uppercase tracking-wider text-[#8D857B] shrink-0 font-medium">
                o con correo electrónico
              </span>
              <div class="border-t border-[#E6DFD5] w-full" />
            </div>

            <!-- Formulario Email / Contraseña -->
            <form @submit.prevent="handleEmailSubmit" class="space-y-3">
              <div v-if="isRegistering && currentRole === 'customer'">
                <label class="block text-[10px] font-semibold text-[#1E1B18] uppercase tracking-wider mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  v-model="fullName"
                  placeholder="Ej. Camila González"
                  class="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                />
              </div>

              <div>
                <label class="block text-[10px] font-semibold text-[#1E1B18] uppercase tracking-wider mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  v-model="email"
                  :placeholder="currentRole === 'admin' ? 'Sofia.Tomillo@gmail.com' : 'tu@correo.com'"
                  class="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                />
              </div>

              <div>
                <label class="block text-[10px] font-semibold text-[#1E1B18] uppercase tracking-wider mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  minlength="6"
                  v-model="password"
                  placeholder="Mínimo 6 caracteres"
                  class="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                />
              </div>

              <button
                type="submit"
                :disabled="isLoading"
                class="w-full py-2.5 bg-[#1E1B18] hover:bg-[#38342E] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-sm mt-1 flex items-center justify-center gap-2"
              >
                <span v-if="isLoading" class="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{{ isRegistering && currentRole === 'customer' ? 'Crear mi cuenta' : 'Entrar a mi cuenta' }}</span>
              </button>
            </form>

            <!-- Toggle Login / Register (solo en modo Cliente) -->
            <div v-if="currentRole === 'customer'" class="mt-3 text-center">
              <button
                type="button"
                @click="isRegistering = !isRegistering; errorMessage = ''; successMessage = ''"
                class="text-xs text-[#F28482] hover:underline font-medium cursor-pointer"
              >
                {{ isRegistering ? '¿Ya tienes cuenta? Inicia sesión aquí' : '¿Aún no tienes cuenta? Regístrate' }}
              </button>
            </div>

            <!-- Pie de modal: Ayuda para alternar rol -->
            <div class="mt-4 pt-3 border-t border-[#E6DFD5] text-center">
              <button
                v-if="currentRole === 'customer'"
                type="button"
                @click="setRole('admin')"
                class="text-[11px] text-[#8D857B] hover:text-[#F28482] transition-colors cursor-pointer inline-flex items-center gap-1 font-medium"
              >
                <Shield class="w-3.5 h-3.5" />
                <span>¿Eres administrador? Ingresar como Sofia.Tomillo</span>
              </button>
              <button
                v-else
                type="button"
                @click="setRole('customer')"
                class="text-[11px] text-[#8D857B] hover:text-[#1E1B18] transition-colors cursor-pointer inline-flex items-center gap-1 font-medium"
              >
                <User class="w-3.5 h-3.5" />
                <span>¿Eres cliente? Ingresar con tu cuenta de compras</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { X, Lock, AlertCircle, CheckCircle2, Shield, User } from 'lucide-vue-next';
import { authService } from '../services/authService';

export default {
  name: 'AuthModal',
  components: {
    X,
    Lock,
    AlertCircle,
    CheckCircle2,
    Shield,
    User,
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    initialRole: {
      type: String,
      default: 'customer',
    },
  },
  emits: ['close', 'loginSuccess'],
  data() {
    return {
      authService,
      currentRole: this.initialRole || 'customer',
      isRegistering: false,
      fullName: '',
      email: '',
      password: '',
      isLoading: false,
      errorMessage: '',
      successMessage: '',
    };
  },
  watch: {
    initialRole(newVal) {
      if (newVal) {
        this.currentRole = newVal;
        if (newVal === 'admin') {
          this.email = 'Sofia.Tomillo@gmail.com';
        }
      }
    },
    isOpen(newVal) {
      if (newVal) {
        this.currentRole = this.initialRole || 'customer';
        this.errorMessage = '';
        this.successMessage = '';
        if (this.currentRole === 'admin') {
          this.email = 'Sofia.Tomillo@gmail.com';
        } else {
          this.email = '';
        }
      }
    },
  },
  methods: {
    setRole(role) {
      this.currentRole = role;
      this.errorMessage = '';
      this.successMessage = '';
      if (role === 'admin') {
        this.email = 'Sofia.Tomillo@gmail.com';
        this.isRegistering = false;
      } else {
        this.email = '';
      }
    },

    async handleGoogleLogin() {
      this.isLoading = true;
      this.errorMessage = '';
      const res = await authService.signInWithGoogle();
      this.isLoading = false;
      if (!res.success) {
        this.errorMessage = res.error || 'Error al conectar con Google Auth de Supabase.';
      } else {
        this.$emit('loginSuccess');
        this.$emit('close');
      }
    },

    async handleEmailSubmit() {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      if (this.isRegistering && this.currentRole === 'customer') {
        const res = await authService.signUpWithEmail(this.email, this.password, this.fullName);
        this.isLoading = false;
        if (!res.success) {
          this.errorMessage = res.error || 'No se pudo completar el registro.';
        } else {
          this.successMessage = '¡Cuenta creada! Ya has iniciado sesión.';
          setTimeout(() => {
            this.$emit('loginSuccess');
            this.$emit('close');
          }, 800);
        }
      } else {
        const res = await authService.signInWithEmail(this.email, this.password);
        this.isLoading = false;
        if (!res.success) {
          this.errorMessage = res.error || 'Credenciales incorrectas o correo no registrado.';
        } else {
          this.$emit('loginSuccess');
          this.$emit('close');
        }
      }
    },

    handleAdminQuickLogin() {
      authService.loginAsAdminMock();
      this.successMessage = 'Sesión iniciada como Sofia.Tomillo@gmail.com (Administrador)';
      setTimeout(() => {
        this.$emit('loginSuccess');
        this.$emit('close');
      }, 500);
    },
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
