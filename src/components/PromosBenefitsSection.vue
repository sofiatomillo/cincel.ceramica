<template>
  <section
    :class="[
      variant === 'home'
        ? 'py-16 sm:py-20 bg-[#FAF7F2] border-t border-[#E6DFD5]'
        : 'mb-10 p-6 sm:p-8 bg-white rounded-3xl border border-[#E6DFD5] shadow-xs',
    ]"
  >
    <div :class="variant === 'home' ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' : ''">
      <!-- Encabezado de la sección -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div class="inline-flex items-center gap-2 mb-2">
            <span class="w-6 h-px bg-[#F28482]" />
            <span class="text-xs font-semibold uppercase tracking-[0.2em] text-[#F28482]">
              BENEFICIOS, OFERTAS Y PROMOS
            </span>
          </div>
          <h2 class="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1E1B18] leading-tight">
            Beneficios Exclusivos y Promociones Activas
          </h2>
          <p class="text-xs sm:text-sm text-[#6B655D] mt-1.5 max-w-2xl leading-relaxed">
            Facilidades de pago, envíos bonificados a toda la Ciudad de Buenos Aires y cupones exclusivos para usuarios registrados.
          </p>
        </div>

        <!-- Banner de cupón interactivo: Ganado por registro vs. Por registrarse -->
        <div
          v-if="hasEarnedWelcomeCoupon"
          class="shrink-0 flex items-center gap-2.5 bg-green-50/90 p-2.5 px-3.5 rounded-2xl border border-green-200 shadow-2xs"
        >
          <CheckCircle2 class="w-4 h-4 text-green-600 shrink-0" />
          <div class="text-xs">
            <span class="text-green-800 block text-[10px] uppercase font-bold tracking-wider">
              ¡Cupón ganado por registro!
            </span>
            <span class="font-mono font-bold text-[#1E1B18] tracking-wider">
              {{ welcomeCode }} (10% OFF)
            </span>
          </div>
          <button
            @click="copyCoupon(welcomeCode)"
            type="button"
            class="ml-2 px-3 py-1.5 bg-white hover:bg-green-700 text-green-800 hover:text-white border border-green-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            :title="copiedCode === welcomeCode ? 'Copiado' : 'Copiar cupón ganado'"
          >
            <Check v-if="copiedCode === welcomeCode" class="w-3.5 h-3.5 text-green-600" />
            <Copy v-else class="w-3.5 h-3.5" />
            <span>{{ copiedCode === welcomeCode ? '¡Copiado!' : 'Copiar' }}</span>
          </button>
        </div>

        <!-- Si el usuario aún no se ha registrado: llamado a ganarse el cupón -->
        <div
          v-else
          class="shrink-0 flex items-center gap-2.5 bg-gradient-to-r from-amber-50 via-rose-50/70 to-amber-50 p-2.5 px-3.5 rounded-2xl border border-amber-200/90 shadow-2xs"
        >
          <Gift class="w-4 h-4 text-[#F28482] shrink-0" />
          <div class="text-xs">
            <span class="text-[#8D857B] block text-[10px] uppercase font-bold tracking-wider">
              Premio de bienvenida
            </span>
            <span class="font-semibold text-[#1E1B18]">
              Gana 10% OFF al registrarte
            </span>
          </div>
          <button
            @click="openRegisterToWin"
            type="button"
            class="ml-2 px-3.5 py-1.5 bg-[#F28482] hover:bg-[#E06F6D] text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap active:scale-95"
            title="Crear cuenta para desbloquear el cupón de bienvenida"
          >
            <Gift class="w-3.5 h-3.5" />
            <span>Registrarme y Ganar</span>
          </button>
        </div>
      </div>

      <!-- Grid de 4 Beneficios y Ofertas -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Tarjeta 1: Envíos Gratis -->
        <article class="p-6 bg-white rounded-2xl border border-[#E6DFD5] hover:border-[#D5CDC2] transition-all flex flex-col justify-between shadow-2xs group">
          <div>
            <div class="w-11 h-11 rounded-xl bg-[#FAF7F2] text-[#1E1B18] flex items-center justify-center mb-4 group-hover:bg-[#1E1B18] group-hover:text-white transition-colors border border-[#E6DFD5]">
              <Truck class="w-5 h-5 text-[#F28482]" />
            </div>
            <div class="text-[11px] font-bold text-[#8D857B] uppercase tracking-wider mb-1">
              Logística Cuidada
            </div>
            <h3 class="font-serif text-lg font-semibold text-[#1E1B18] mb-2 leading-snug">
              Envío Gratis a CABA desde $80.000
            </h3>
            <p class="text-xs text-[#6B655D] leading-relaxed mb-4">
              Despachamos cada pieza con embalaje reforzado anti-roturas. Bonificado en compras superiores a $80.000 o retiro gratis en nuestro taller de Palermo / San Telmo.
            </p>
          </div>

          <div class="pt-4 border-t border-[#E6DFD5]/80 flex items-center justify-between">
            <span class="text-[11px] font-medium text-[#8D857B]">Todo CABA · Taller</span>
            <button
              @click="openCart"
              type="button"
              class="text-xs font-semibold text-[#F28482] hover:text-[#E06F6D] inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Ver cesta</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </article>

        <!-- Tarjeta 2: Promo Tazas -->
        <article class="p-6 bg-white rounded-2xl border border-[#E6DFD5] hover:border-[#D5CDC2] transition-all flex flex-col justify-between shadow-2xs group">
          <div>
            <div class="w-11 h-11 rounded-xl bg-[#FAF7F2] text-[#1E1B18] flex items-center justify-center mb-4 group-hover:bg-[#1E1B18] group-hover:text-white transition-colors border border-[#E6DFD5]">
              <Coffee class="w-5 h-5 text-[#F28482]" />
            </div>
            <div class="text-[11px] font-bold text-[#F28482] uppercase tracking-wider mb-1">
              Promo de Temporada
            </div>
            <h3 class="font-serif text-lg font-semibold text-[#1E1B18] mb-2 leading-snug">
              15% OFF en la 2da Taza Artesanal
            </h3>
            <p class="text-xs text-[#6B655D] leading-relaxed mb-4">
              Llevando 2 o más tazas (incluyendo la Taza Café Terrosa y toda la colección de gres), aplicas un 15% de descuento en la segunda unidad para armar tu set.
            </p>
          </div>

          <div class="pt-4 border-t border-[#E6DFD5]/80 flex items-center justify-between">
            <span class="text-[11px] font-medium text-[#8D857B]">Categoría Tazas</span>
            <button
              @click="handleSelectMugs"
              type="button"
              class="text-xs font-semibold text-[#F28482] hover:text-[#E06F6D] inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Ver Tazas</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </article>

        <!-- Tarjeta 3: Cuotas y Transferencia -->
        <article class="p-6 bg-white rounded-2xl border border-[#E6DFD5] hover:border-[#D5CDC2] transition-all flex flex-col justify-between shadow-2xs group">
          <div>
            <div class="w-11 h-11 rounded-xl bg-[#FAF7F2] text-[#1E1B18] flex items-center justify-center mb-4 group-hover:bg-[#1E1B18] group-hover:text-white transition-colors border border-[#E6DFD5]">
              <CreditCard class="w-5 h-5 text-[#F28482]" />
            </div>
            <div class="text-[11px] font-bold text-[#8D857B] uppercase tracking-wider mb-1">
              Financiación
            </div>
            <h3 class="font-serif text-lg font-semibold text-[#1E1B18] mb-2 leading-snug">
              3 Cuotas Sin Interés o 10% OFF
            </h3>
            <p class="text-xs text-[#6B655D] leading-relaxed mb-4">
              Aboná con todas las tarjetas mediante Mercado Pago en hasta 3 cuotas fijas, o recibí un 10% de descuento inmediato pagando por transferencia bancaria.
            </p>
          </div>

          <div class="pt-4 border-t border-[#E6DFD5]/80 flex items-center justify-between">
            <span class="text-[11px] font-medium text-[#8D857B]">Mercado Pago · Bancos</span>
            <button
              @click="openCart"
              type="button"
              class="text-xs font-semibold text-[#F28482] hover:text-[#E06F6D] inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Medios de pago</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </article>

        <!-- Tarjeta 4: Garantía y Botón de Arrepentimiento -->
        <article class="p-6 bg-white rounded-2xl border border-[#E6DFD5] hover:border-[#D5CDC2] transition-all flex flex-col justify-between shadow-2xs group">
          <div>
            <div class="w-11 h-11 rounded-xl bg-[#FAF7F2] text-[#1E1B18] flex items-center justify-center mb-4 group-hover:bg-[#1E1B18] group-hover:text-white transition-colors border border-[#E6DFD5]">
              <ShieldCheck class="w-5 h-5 text-[#F28482]" />
            </div>
            <div class="text-[11px] font-bold text-[#8D857B] uppercase tracking-wider mb-1">
              Compra Segura
            </div>
            <h3 class="font-serif text-lg font-semibold text-[#1E1B18] mb-2 leading-snug">
              Garantía & Botón de Arrepentimiento
            </h3>
            <p class="text-xs text-[#6B655D] leading-relaxed mb-4">
              Compromiso total con la calidad del barro. Cuentas con derecho de revocación y Botón de Arrepentimiento activo durante el embalaje (Ley 24.240 y Res. 424/2020).
            </p>
          </div>

          <div class="pt-4 border-t border-[#E6DFD5]/80 flex items-center justify-between">
            <span class="text-[11px] font-medium text-[#8D857B]">10 Días · Reintegro 100%</span>
            <button
              @click="openOrders"
              type="button"
              class="text-xs font-semibold text-[#F28482] hover:text-[#E06F6D] inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Mis Pedidos</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </article>
      </div>

      <!-- Tira promocional con lógica de registro para ganar el cupón -->
      <div class="mt-8 p-5 sm:p-6 bg-gradient-to-r from-[#1E1B18] via-[#2A2622] to-[#1E1B18] text-white rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <!-- Caso 1: Usuario ya registrado que ha ganado el cupón -->
        <div v-if="hasEarnedWelcomeCoupon" class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center shrink-0 border border-green-500/30">
            <Gift class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-950/60 px-2 py-0.5 rounded border border-green-500/30">
                Beneficio Desbloqueado
              </span>
              <span class="text-xs text-[#D5CDC2]">Por registrarte en Cincel</span>
            </div>
            <h4 class="font-serif text-base sm:text-lg font-semibold leading-tight mt-0.5">
              ¡Tienes disponible tu cupón de bienvenida del 10% OFF!
            </h4>
            <p class="text-xs text-[#D5CDC2] mt-0.5">
              Aplica el código <strong class="text-white font-mono bg-white/15 px-1.5 py-0.5 rounded">{{ welcomeCode }}</strong> en tu cesta y suma envío bonificado a partir de $80.000 en CABA.
            </p>
          </div>
        </div>

        <!-- Caso 2: Usuario aún no registrado (debe registrarse para ganarlo) -->
        <div v-else class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-[#F28482]/20 text-[#F28482] flex items-center justify-center shrink-0 border border-[#F28482]/30">
            <Gift class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-[#F28482] bg-rose-950/60 px-2 py-0.5 rounded border border-[#F28482]/30">
                Exclusivo Nuevos Registros
              </span>
              <span class="text-xs text-[#D5CDC2]">Crear cuenta gratis</span>
            </div>
            <h4 class="font-serif text-base sm:text-lg font-semibold leading-tight mt-0.5">
              ¿Primera vez aquí? Regístrate y gana tu cupón del 10% OFF
            </h4>
            <p class="text-xs text-[#D5CDC2] mt-0.5">
              Crea tu cuenta de cliente por primera vez para desbloquear el cupón de bienvenida <strong class="text-white font-mono bg-white/15 px-1.5 py-0.5 rounded">{{ welcomeCode }}</strong> para tu compra.
            </p>
          </div>
        </div>

        <!-- Botones de Acción según estado de registro -->
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <!-- Si ya lo ganó: copiar código -->
          <template v-if="hasEarnedWelcomeCoupon">
            <button
              @click="copyCoupon(welcomeCode)"
              type="button"
              class="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <Check v-if="copiedCode === welcomeCode" class="w-4 h-4 text-green-400" />
              <Copy v-else class="w-4 h-4 text-[#F28482]" />
              <span>{{ copiedCode === welcomeCode ? 'Cupón Copiado' : 'Copiar Código' }}</span>
            </button>

            <button
              @click="openCart"
              type="button"
              class="px-5 py-2.5 bg-[#F28482] hover:bg-[#E06F6D] text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
            >
              <span>Aplicar en Cesta</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </button>
          </template>

          <!-- Si aún no se registró: botón para registrarse y ganarlo -->
          <template v-else>
            <button
              @click="openRegisterToWin"
              type="button"
              class="px-5 py-2.5 bg-[#F28482] hover:bg-[#E06F6D] text-white text-xs font-semibold rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer shadow-md hover:scale-102 active:scale-95 whitespace-nowrap"
            >
              <Gift class="w-4 h-4" />
              <span>Registrarme y Ganar 10%</span>
            </button>

            <router-link
              v-if="variant === 'home'"
              to="/catalogo"
              class="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
            >
              <span>Ver Catálogo</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </router-link>
            <button
              v-else
              @click="handleSelectMugs"
              type="button"
              class="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
            >
              <span>Ver Tazas</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </button>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import {
  Truck,
  Coffee,
  CreditCard,
  ShieldCheck,
  Gift,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-vue-next';
import { cartService } from '../services/cartService';
import { customerOrdersService } from '../services/customerOrdersService';
import { authService } from '../services/authService';
import { couponService, WELCOME_COUPON_CODE } from '../services/couponService';

export default {
  name: 'PromosBenefitsSection',
  components: {
    Truck,
    Coffee,
    CreditCard,
    ShieldCheck,
    Gift,
    CheckCircle2,
    Copy,
    Check,
    ArrowRight,
  },
  props: {
    variant: {
      type: String,
      default: 'home', // 'home' | 'catalog'
    },
  },
  emits: ['selectCategory'],
  data() {
    return {
      welcomeCode: WELCOME_COUPON_CODE,
      copiedCode: null,
      copyTimeout: null,
      authService,
      couponService,
    };
  },
  computed: {
    isLoggedIn() {
      return Boolean(authService.user.value);
    },
    hasEarnedWelcomeCoupon() {
      return Boolean(couponService.isWelcomeCouponUnlocked.value);
    },
  },
  methods: {
    async copyCoupon(code) {
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(code);
        }
        this.copiedCode = code;
        if (this.copyTimeout) clearTimeout(this.copyTimeout);
        this.copyTimeout = setTimeout(() => {
          this.copiedCode = null;
        }, 3000);
      } catch (err) {
        console.warn('No se pudo copiar el código al portapapeles:', err);
      }
    },
    openRegisterToWin() {
      // Abre el modal de autenticación directamente en el modo Registro para que el usuario gane su cupón
      authService.openAuthModal('customer', true);
    },
    openCart() {
      cartService.isCartOpen = true;
    },
    openOrders() {
      customerOrdersService.open();
    },
    handleSelectMugs() {
      if (this.variant === 'catalog') {
        this.$emit('selectCategory', 'tazas');
      } else {
        this.$router.push('/catalogo?cat=tazas');
      }
    },
  },
  beforeUnmount() {
    if (this.copyTimeout) clearTimeout(this.copyTimeout);
  },
};
</script>
