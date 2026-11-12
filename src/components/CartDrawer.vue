<template>
  <Transition name="drawer-fade">
    <div
      v-if="cartService.isCartOpen"
      role="dialog"
      aria-modal="true"
      class="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs"
      @click="cartService.isCartOpen = false"
    >
      <div
        class="relative w-full max-w-md h-full bg-[#FAF7F2] text-[#2D2A26] shadow-2xl flex flex-col justify-between overflow-hidden border-l border-[#E6DFD5] drawer-panel"
        @click.stop
      >
      <!-- Header del carrito -->
      <div class="px-6 py-5 bg-white border-b border-[#E6DFD5] flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <ShoppingBag class="w-5 h-5 text-[#F28482]" />
          <h3 class="font-serif text-xl font-semibold text-[#1E1B18]">
            Cesta de Compra
          </h3>
          <span class="text-xs bg-[#F3EFEA] text-[#6B655D] font-mono px-2 py-0.5 rounded-full font-semibold">
            {{ cartTotalItems }}
          </span>
        </div>

        <button
          @click="cartService.isCartOpen = false"
          class="p-1.5 text-[#6B655D] hover:text-[#1E1B18] rounded-lg hover:bg-[#F3EFEA] transition-colors cursor-pointer"
          aria-label="Cerrar carrito"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Barra de progreso de envío gratis -->
      <div v-if="cartSubtotal > 0 && !orderCompleted" class="px-6 py-2.5 bg-[#F3EFEA] border-b border-[#E6DFD5] text-xs">
        <div v-if="remainingForFreeShipping > 0" class="flex items-center gap-2 text-[#6B655D]">
          <Truck class="w-4 h-4 text-[#F28482] shrink-0" />
          <span>
            Añade <strong>{{ cartService.formatARS(remainingForFreeShipping) }}</strong> más para conseguir <strong>Envío Gratis</strong>
          </span>
        </div>
        <div v-else class="flex items-center gap-2 text-[#2E7D32]">
          <Truck class="w-4 h-4 text-[#2E7D32] shrink-0" />
          <span><strong>¡Envío estándar gratuito aplicado!</strong></span>
        </div>
      </div>

      <!-- Cuerpo / Lista de productos o Checkout -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <!-- Confirmación de pedido -->
        <div v-if="orderCompleted" class="py-8 text-center space-y-4">
          <div class="w-14 h-14 bg-[#E8F5E9] text-[#2E7D32] rounded-full flex items-center justify-center mx-auto">
            <Check class="w-7 h-7" />
          </div>
          <h4 class="font-serif text-2xl font-semibold text-[#1E1B18]">
            ¡Pedido realizado con éxito!
          </h4>
          <p class="text-xs text-[#6B655D] max-w-xs mx-auto">
            Hemos recibido tu compra correctamente, <strong>{{ customer.name }}</strong>. Te enviamos la confirmación a <strong>{{ customer.email || 'tu email' }}</strong>.
          </p>
          <div class="p-3 bg-white border border-[#E6DFD5] rounded-xl text-xs font-mono text-[#1E1B18]">
            Número de pedido: <strong>{{ orderNumber }}</strong>
          </div>

          <div class="space-y-2 pt-2">
            <button
              @click="viewMyOrders"
              type="button"
              class="w-full py-3 bg-[#F28482] hover:bg-[#E06F6D] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Package class="w-4 h-4" />
              <span>Ver Mis Pedidos y Seguimiento</span>
            </button>
            <button
              @click="handleFinish"
              type="button"
              class="w-full py-2.5 bg-white border border-[#E6DFD5] hover:bg-[#FAF7F2] text-[#1E1B18] text-xs font-medium rounded-xl transition-colors cursor-pointer"
            >
              Volver a la tienda
            </button>
          </div>
        </div>

        <!-- Formulario de Checkout -->
        <form v-else-if="isCheckingOut" @submit.prevent="handleCheckoutSubmit" class="space-y-4 text-xs">
          <div class="flex items-center justify-between pb-2 border-b border-[#E6DFD5]">
            <span class="font-semibold text-sm text-[#1E1B18]">Datos de entrega</span>
            <button
              type="button"
              @click="isCheckingOut = false"
              class="text-[#F28482] hover:underline cursor-pointer"
            >
              Volver a la cesta
            </button>
          </div>

          <!-- Banner de Cliente Identificado -->
          <div v-if="isLoggedInCustomer" class="p-3 bg-[#FAF7F2] border border-amber-200/80 rounded-xl text-xs flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-full bg-[#1E1B18] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {{ userInitial }}
              </div>
              <div class="leading-tight">
                <span class="font-semibold text-[#1E1B18] block">{{ customer.name }}</span>
                <span class="text-[10px] text-[#6B655D]">{{ customer.email }}</span>
              </div>
            </div>
            <span class="text-[10px] font-semibold bg-[#2E7D32]/10 text-[#2E7D32] px-2 py-0.5 rounded-full shrink-0">
              ✓ Cliente lista
            </span>
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-[#6B655D] mb-1">
              Nombre y apellidos *
            </label>
            <input
              type="text"
              required
              v-model="customer.name"
              placeholder="Ej. Laura Russo"
              class="w-full px-3 py-2 bg-white border border-[#E6DFD5] rounded-lg focus:outline-none focus:border-[#F28482]"
            />
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-[#6B655D] mb-1">
              Correo electrónico *
            </label>
            <input
              type="email"
              required
              v-model="customer.email"
              placeholder="tu@correo.com"
              class="w-full px-3 py-2 bg-white border border-[#E6DFD5] rounded-lg focus:outline-none focus:border-[#F28482]"
            />
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-[#6B655D] mb-1">
              Dirección de envío completa *
            </label>
            <input
              type="text"
              required
              v-model="customer.address"
              placeholder="Calle, número, piso / dpto"
              class="w-full px-3 py-2 bg-white border border-[#E6DFD5] rounded-lg focus:outline-none focus:border-[#F28482]"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-semibold text-[#6B655D] mb-1">
                Ciudad / Localidad *
              </label>
              <input
                type="text"
                required
                v-model="customer.city"
                placeholder="CABA / Buenos Aires"
                class="w-full px-3 py-2 bg-white border border-[#E6DFD5] rounded-lg focus:outline-none focus:border-[#F28482]"
              />
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-[#6B655D] mb-1">
                Código Postal *
              </label>
              <input
                type="text"
                required
                v-model="customer.postalCode"
                placeholder="C1414"
                class="w-full px-3 py-2 bg-white border border-[#E6DFD5] rounded-lg focus:outline-none focus:border-[#F28482]"
              />
            </div>
          </div>

          <div class="pt-2">
            <label class="block text-[11px] font-semibold text-[#6B655D] mb-1.5">
              Método de pago seguro
            </label>
            <div class="space-y-2">
              <label class="flex items-center gap-2 p-2.5 bg-white border border-[#E6DFD5] rounded-lg cursor-pointer hover:border-[#D5CDC2]">
                <input
                  type="radio"
                  name="payment"
                  value="mercadopago"
                  v-model="customer.paymentMethod"
                  class="accent-[#F28482]"
                />
                <span class="font-medium text-[#1E1B18]">Mercado Pago / Transferencia</span>
              </label>
              <label class="flex items-center gap-2 p-2.5 bg-white border border-[#E6DFD5] rounded-lg cursor-pointer hover:border-[#D5CDC2]">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  v-model="customer.paymentMethod"
                  class="accent-[#F28482]"
                />
                <span class="font-medium text-[#1E1B18]">Tarjeta de crédito / débito</span>
              </label>
            </div>
          </div>

          <div class="p-3 bg-white border border-[#E6DFD5] rounded-xl space-y-1 pt-2">
            <div class="flex justify-between text-xs text-[#6B655D]">
              <span>Subtotal piezas</span>
              <span>{{ cartService.formatARS(cartSubtotal) }}</span>
            </div>
            <div class="flex justify-between text-xs text-[#6B655D]">
              <span>Gastos de envío</span>
              <span>{{ shippingCost === 0 ? 'Gratis' : cartService.formatARS(shippingCost) }}</span>
            </div>
            <div class="flex justify-between text-sm font-semibold text-[#1E1B18] pt-1 border-t border-[#E6DFD5]">
              <span>Total a pagar</span>
              <span>{{ cartService.formatARS(total) }}</span>
            </div>
          </div>

          <button
            type="submit"
            class="w-full py-3.5 bg-[#F28482] hover:bg-[#E06F6D] text-white font-medium text-sm rounded-xl shadow-sm transition-all hover:shadow-md cursor-pointer"
          >
            Confirmar y pagar ({{ cartService.formatARS(total) }})
          </button>
        </form>

        <!-- Carrito vacío -->
        <div v-else-if="cartService.cart.length === 0" class="py-16 text-center space-y-4">
          <div class="w-14 h-14 bg-[#F3EFEA] text-[#8D857B] rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag class="w-6 h-6" />
          </div>
          <div>
            <h4 class="font-serif text-xl font-semibold text-[#1E1B18]">
              Tu cesta está vacía
            </h4>
            <p class="text-xs text-[#6B655D] mt-1 max-w-xs mx-auto">
              Aún no has añadido ninguna pieza de cerámica artesanal a tu pedido.
            </p>
          </div>
          <router-link
            to="/catalogo"
            @click="cartService.isCartOpen = false"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E1B18] hover:bg-[#38342E] text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Ir a la página de catálogo
            <ArrowRight class="w-3.5 h-3.5" />
          </router-link>
        </div>

        <!-- Lista de productos en el carrito -->
        <div v-else class="space-y-3">
          <div
            v-for="item in cartService.cart"
            :key="item.piece.id"
            class="p-3.5 bg-white rounded-xl border border-[#E6DFD5] flex gap-3 items-center shadow-2xs"
          >
            <img
              :src="cartService.resolveImage(item.piece.fileName, item.piece.imageSrc)"
              :alt="item.piece.title"
              class="w-16 h-16 rounded-lg object-cover bg-[#F3EFEA] border border-[#E6DFD5] shrink-0"
            />
            <div class="flex-1 min-w-0">
              <span class="text-[10px] font-semibold text-[#F28482] tracking-wider uppercase block truncate">
                {{ item.piece.categoryLabel }}
              </span>
              <h4 class="font-medium text-xs text-[#1E1B18] truncate">
                {{ item.piece.title }}
              </h4>
              <p class="text-xs font-semibold text-[#1E1B18] mt-0.5">
                {{ item.piece.price }}
              </p>

              <div class="flex items-center gap-2 mt-2">
                <div class="inline-flex items-center border border-[#E6DFD5] rounded-md bg-[#FAF7F2]">
                  <button
                    @click="cartService.updateQty(item.piece.id, -1)"
                    class="px-2 py-0.5 text-xs text-[#6B655D] hover:text-[#1E1B18] hover:bg-white rounded-l-md transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span class="px-2 py-0.5 text-xs font-semibold text-[#1E1B18]">
                    {{ item.quantity }}
                  </span>
                  <button
                    @click="cartService.updateQty(item.piece.id, 1)"
                    class="px-2 py-0.5 text-xs text-[#6B655D] hover:text-[#1E1B18] hover:bg-white rounded-r-md transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  @click="cartService.removeFromCart(item.piece.id)"
                  class="text-[#8D857B] hover:text-red-500 p-1 transition-colors ml-auto cursor-pointer"
                  title="Eliminar de la cesta"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer del carrito -->
      <div v-if="!orderCompleted && !isCheckingOut && cartService.cart.length > 0" class="p-6 bg-white border-t border-[#E6DFD5] space-y-3">
        <!-- Bloque de Cupón de Bienvenida -->
        <div class="py-2.5 border-y border-[#E6DFD5] space-y-2">
          <!-- Si ya está aplicado -->
          <div v-if="appliedCoupon" class="flex items-center justify-between p-2.5 bg-green-50 rounded-xl border border-green-200 text-xs">
            <div class="flex items-center gap-2 text-green-900 font-medium">
              <Tag class="w-3.5 h-3.5 text-green-600 shrink-0" />
              <span>Cupón <strong>{{ appliedCoupon }}</strong> (10% OFF)</span>
            </div>
            <button
              @click="removeCoupon"
              type="button"
              class="text-[#8D857B] hover:text-rose-600 p-1 cursor-pointer transition-colors"
              title="Quitar cupón"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Si aún no se aplicó -->
          <div v-else class="space-y-1.5">
            <div class="flex gap-2">
              <input
                v-model="couponInput"
                type="text"
                placeholder="Ingresar cupón (ej. TALLER10)"
                class="flex-1 px-3 py-1.5 text-xs uppercase bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                @keyup.enter="applyCouponCode"
              />
              <button
                @click="applyCouponCode"
                type="button"
                class="px-3.5 py-1.5 bg-[#1E1B18] hover:bg-[#38342E] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Aplicar
              </button>
            </div>

            <!-- Mensaje de estado o invitación a registrarse para ganar el cupón -->
            <div v-if="couponMessage" class="text-[11px] leading-snug" :class="couponError ? 'text-rose-600' : 'text-green-700'">
              <p>{{ couponMessage }}</p>
              <button
                v-if="couponError && !isLoggedInCustomer"
                @click="openRegisterForCoupon"
                type="button"
                class="text-xs font-semibold text-[#F28482] underline hover:text-[#E06F6D] mt-1 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Crear cuenta gratis para ganarlo</span>
                <ArrowRight class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        <div class="space-y-1.5 text-xs">
          <div class="flex justify-between text-[#6B655D]">
            <span>Subtotal</span>
            <span class="font-medium text-[#1E1B18]">{{ cartService.formatARS(cartSubtotal) }}</span>
          </div>
          <div v-if="discountAmount > 0" class="flex justify-between text-[#2E7D32]">
            <span>Descuento ({{ appliedCoupon }})</span>
            <span class="font-semibold">- {{ cartService.formatARS(discountAmount) }}</span>
          </div>
          <div class="flex justify-between text-[#6B655D]">
            <span>Envío</span>
            <span class="font-medium text-[#1E1B18]">
              {{ shippingCost === 0 ? 'Gratis' : cartService.formatARS(shippingCost) }}
            </span>
          </div>
          <div class="flex justify-between text-sm font-semibold text-[#1E1B18] pt-2 border-t border-[#E6DFD5]">
            <span>Total estimado</span>
            <span>{{ cartService.formatARS(total) }}</span>
          </div>
        </div>

        <button
          @click="isCheckingOut = true"
          class="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-[#F28482] hover:bg-[#E06F6D] text-white font-medium text-xs rounded-xl shadow-sm transition-all hover:gap-3 cursor-pointer"
        >
          <span>Tramitar pedido</span>
          <ArrowRight class="w-4 h-4" />
        </button>

        <div class="flex items-center justify-center gap-2 text-[10px] text-[#8D857B] pt-1">
          <ShieldCheck class="w-3.5 h-3.5 text-[#2E7D32]" />
          <span>Garantía de embalaje anti-rotura y devolución 14 días</span>
        </div>
      </div>
    </div>
  </div>
</Transition>
</template>

<script>
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, Check, Package, Tag } from 'lucide-vue-next';
import { cartService } from '../services/cartService';
import { salesService } from '../services/salesService';
import { authService } from '../services/authService';
import { customerOrdersService } from '../services/customerOrdersService';
import { couponService } from '../services/couponService';

export default {
  name: 'CartDrawer',
  components: {
    X,
    Trash2,
    ShoppingBag,
    ArrowRight,
    ShieldCheck,
    Truck,
    Check,
    Package,
    Tag,
  },
  data() {
    return {
      cartService,
      authService,
      customerOrdersService,
      couponService,
      couponInput: '',
      couponMessage: '',
      couponError: false,
      isCheckingOut: false,
      orderCompleted: false,
      orderNumber: '',
      customer: {
        name: '',
        email: '',
        address: '',
        city: '',
        postalCode: '',
        paymentMethod: 'mercadopago',
      },
      freeShippingThreshold: 80000,
    };
  },
  // Propiedades computadas requeridas
  computed: {
    cartTotalItems() {
      const t = cartService.totalItems;
      return typeof t === 'number' ? t : (t?.value || 0);
    },
    cartSubtotal() {
      const s = cartService.subtotal;
      return typeof s === 'number' ? s : (s?.value || 0);
    },
    shippingCost() {
      const sub = this.cartSubtotal;
      return sub >= this.freeShippingThreshold || sub === 0 ? 0 : 5500;
    },
    discountAmount() {
      return couponService.calculateDiscount(this.cartSubtotal);
    },
    appliedCoupon() {
      return couponService.appliedCoupon.value;
    },
    total() {
      return Math.max(0, this.cartSubtotal - this.discountAmount + this.shippingCost);
    },
    remainingForFreeShipping() {
      return Math.max(0, this.freeShippingThreshold - this.cartSubtotal);
    },
    isLoggedInCustomer() {
      return authService.isCustomer.value;
    },
    userInitial() {
      const name = this.customer.name || 'L';
      return name.charAt(0).toUpperCase();
    },
  },
  watch: {
    'cartService.isCartOpen'(isOpen) {
      if (isOpen) {
        this.prefillCustomerData();
      }
    },
    isCheckingOut(isCheckout) {
      if (isCheckout) {
        this.prefillCustomerData();
      }
    },
    'authService.user.value'() {
      this.prefillCustomerData();
    },
  },
  created() {
    this.prefillCustomerData();
  },
  mounted() {
    this.prefillCustomerData();
  },
  methods: {
    prefillCustomerData() {
      const u = authService.user.value;
      if (u) {
        this.customer.name =
          u.user_metadata?.full_name ||
          u.user_metadata?.name ||
          authService.profile.value?.full_name ||
          (u.email ? u.email.split('@')[0] : '');
        this.customer.email = u.email || '';
        this.customer.address =
          u.user_metadata?.address ||
          authService.profile.value?.address ||
          '';
        this.customer.city =
          u.user_metadata?.city ||
          authService.profile.value?.city ||
          'CABA';
        this.customer.postalCode =
          u.user_metadata?.postalCode ||
          authService.profile.value?.postalCode ||
          '';
      }
    },
    async handleCheckoutSubmit() {
      this.orderNumber = `CIN-${Math.floor(100000 + Math.random() * 900000)}`;
      
      // Registrar la venta en Supabase y persistencia local
      await salesService.recordSale(
        this.customer,
        cartService.cart,
        this.total,
        this.customer.paymentMethod || 'mercadopago'
      );

      this.orderCompleted = true;
    },
    viewMyOrders() {
      this.handleFinish();
      customerOrdersService.open();
    },
    handleFinish() {
      cartService.clearCart();
      couponService.removeCoupon();
      this.couponMessage = '';
      this.couponError = false;
      this.orderCompleted = false;
      this.isCheckingOut = false;
      cartService.isCartOpen = false;
    },
    applyCouponCode() {
      this.couponMessage = '';
      this.couponError = false;
      const res = couponService.applyCoupon(this.couponInput);
      if (!res.success) {
        this.couponError = true;
        this.couponMessage = res.error;
      } else {
        this.couponError = false;
        this.couponMessage = res.message;
        this.couponInput = '';
      }
    },
    removeCoupon() {
      couponService.removeCoupon();
      this.couponMessage = '';
      this.couponError = false;
    },
    openRegisterForCoupon() {
      cartService.isCartOpen = false;
      authService.openAuthModal('customer', true);
    },
  },
};
</script>

<style scoped>
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-fade-enter-active .drawer-panel,
.drawer-fade-leave-active .drawer-panel {
  transition: transform 0.3s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-fade-enter-from .drawer-panel,
.drawer-fade-leave-to .drawer-panel {
  transform: translateX(100%);
}
</style>
