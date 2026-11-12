<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
        @click.self="close"
      >
        <div
          class="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E6DFD5] flex flex-col max-h-[90vh] overflow-hidden animate-fade-in"
        >
          <!-- Cabecera del Modal -->
          <div class="px-6 py-5 border-b border-[#E6DFD5] flex items-center justify-between bg-[#FAF7F2]">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-[#1E1B18] text-white flex items-center justify-center shadow-xs">
                <Package class="w-5 h-5 text-[#F28482]" />
              </div>
              <div>
                <h2 class="font-serif text-xl sm:text-2xl font-semibold text-[#1E1B18] leading-tight">
                  Mis Compras y Pedidos
                </h2>
                <p class="text-xs text-[#6B655D]">
                  Seguimiento de piezas de <strong>{{ customerName }}</strong><span v-if="customerEmail"> ({{ customerEmail }})</span>
                </p>
              </div>
            </div>

            <button
              @click="close"
              type="button"
              class="w-9 h-9 rounded-full bg-white hover:bg-[#F3EFEA] border border-[#E6DFD5] flex items-center justify-center text-[#8D857B] hover:text-[#1E1B18] transition-colors cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Contenido scrollable -->
          <div class="overflow-y-auto p-6 space-y-6 flex-1 bg-white">
            <!-- Estado vacío si el cliente no tiene compras -->
            <div
              v-if="orders.length === 0"
              class="text-center py-12 px-4 rounded-2xl border border-dashed border-[#E6DFD5] bg-[#FAF7F2]"
            >
              <ShoppingBag class="w-12 h-12 text-[#8D857B] mx-auto mb-3" />
              <h3 class="font-serif text-lg font-semibold text-[#1E1B18] mb-1">
                Aún no tienes compras realizadas
              </h3>
              <p class="text-xs text-[#6B655D] max-w-sm mx-auto mb-5">
                ¡Explora nuestro catálogo de piezas de gres y porcelana hechas a mano en CABA y realiza tu primer pedido!
              </p>
              <button
                @click="goToCatalog"
                type="button"
                class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F28482] hover:bg-[#E06F6D] text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                <span>Ver Catálogo de Piezas</span>
                <ArrowRight class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Listado de órdenes del cliente -->
            <div v-else class="space-y-5">
              <article
                v-for="order in orders"
                :key="order.id"
                class="rounded-2xl border border-[#E6DFD5] bg-[#FAF7F2]/60 overflow-hidden shadow-2xs hover:border-[#D5CDC2] transition-colors"
              >
                <!-- Barra superior de la orden -->
                <div class="px-5 py-3.5 bg-[#FAF7F2] border-b border-[#E6DFD5] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-[#1E1B18]">
                      Pedido #{{ order.id }}
                    </span>
                    <span class="text-[#8D857B]">•</span>
                    <span class="text-[#6B655D]">
                      {{ formatDate(order.created_at) }}
                    </span>
                  </div>

                  <div class="flex items-center gap-2">
                    <span
                      class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                      :class="getStatusBadgeClass(order.status)"
                    >
                      {{ getStatusText(order.status) }}
                    </span>
                    <span class="font-serif font-bold text-sm text-[#1E1B18]">
                      {{ formatARS(order.total_amount) }}
                    </span>
                  </div>
                </div>

                <!-- Detalle de la entrega y seguimiento -->
                <div class="p-5 space-y-4">
                  <!-- Si el pedido fue cancelado por arrepentimiento -->
                  <div
                    v-if="order.status === 'cancelado'"
                    class="bg-rose-50/80 p-4 rounded-xl border border-rose-200/90 text-xs"
                  >
                    <div class="flex items-start gap-3">
                      <div class="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-300">
                        <RotateCcw class="w-4 h-4" />
                      </div>
                      <div class="space-y-1 flex-1">
                        <div class="flex flex-wrap items-center justify-between gap-2">
                          <span class="font-bold text-rose-900 text-sm">
                            Pedido cancelado por arrepentimiento
                          </span>
                          <span class="px-2.5 py-0.5 bg-white border border-rose-300 text-rose-800 rounded-md font-mono text-[11px] font-bold">
                            Cód. Trámite: {{ order.cancellation_code || ('ARR-' + order.id) }}
                          </span>
                        </div>
                        <p class="text-rose-800 text-[11px] leading-relaxed">
                          Conforme al derecho de revocación (Art. 34 Ley 24.240 y Res. 424/2020), la compra fue cancelada. Se tramitó la restitución del stock y se gestionará el reintegro total por <strong>{{ formatARS(order.total_amount) }}</strong> a {{ order.customer_email }}.
                        </p>
                        <div class="pt-1 flex flex-wrap items-center gap-3 text-[10px] text-rose-700/90">
                          <span v-if="order.cancelled_at">
                            Cancelado el {{ formatDate(order.cancelled_at) }}
                          </span>
                          <span>•</span>
                          <span>Motivo: {{ order.cancellation_reason || 'Arrepentimiento de compra' }}</span>
                          <span>•</span>
                          <span class="font-semibold text-rose-800">Reintegro: En procesamiento</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Línea de seguimiento de estado para pedidos activos -->
                  <div v-else class="bg-white p-3.5 rounded-xl border border-[#E6DFD5]/80">
                    <p class="text-[10px] uppercase font-bold tracking-wider text-[#8D857B] mb-2.5">
                      Estado del envío a CABA
                    </p>
                    <div class="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div class="flex flex-col items-center">
                        <div class="w-6 h-6 rounded-full bg-[#2E7D32] text-white flex items-center justify-center mb-1">
                          <Check class="w-3 h-3" />
                        </div>
                        <span class="font-semibold text-[#1E1B18]">Pago confirmado</span>
                      </div>
                      <div class="flex flex-col items-center">
                        <div class="w-6 h-6 rounded-full bg-[#F28482] text-white flex items-center justify-center mb-1 animate-pulse">
                          <Truck class="w-3 h-3" />
                        </div>
                        <span class="font-semibold text-[#F28482]">Embalaje y despacho</span>
                      </div>
                      <div class="flex flex-col items-center">
                        <div class="w-6 h-6 rounded-full bg-[#FAF7F2] border border-[#D5CDC2] text-[#8D857B] flex items-center justify-center mb-1">
                          <MapPin class="w-3 h-3" />
                        </div>
                        <span class="text-[#8D857B]">Entrega en destino</span>
                      </div>
                    </div>
                  </div>

                  <!-- Información de destino -->
                  <div class="flex items-start gap-2 text-xs text-[#5C564E] bg-white/70 p-3 rounded-xl border border-[#E6DFD5]/60">
                    <MapPin class="w-4 h-4 text-[#F28482] shrink-0 mt-0.5" />
                    <div>
                      <span class="font-semibold text-[#1E1B18]">Dirección de entrega:</span>
                      <p class="text-[#6B655D] mt-0.5">
                        {{ order.shipping_address || 'Av. Santa Fe 3420, Piso 4 B, CABA (CP C1425)' }}
                      </p>
                    </div>
                  </div>

                  <!-- Lista de productos comprados en este pedido -->
                  <div>
                    <p class="text-[11px] font-semibold uppercase tracking-wider text-[#8D857B] mb-2">
                      Piezas artesanales incluidas ({{ order.sale_items?.length || 0 }})
                    </p>
                    <div class="space-y-2">
                      <div
                        v-for="item in order.sale_items"
                        :key="item.id"
                        @click="goToPiece(item.product_id)"
                        class="flex items-center justify-between p-2.5 bg-white hover:bg-[#FAF7F2] rounded-xl border border-[#E6DFD5]/80 hover:border-[#1E1B18]/40 gap-3 transition-colors cursor-pointer group"
                        title="Ver pieza en el catálogo"
                      >
                        <div class="flex items-center gap-3">
                          <img
                            :src="cartService.resolveImage('', item.product_image)"
                            :alt="item.product_title"
                            class="w-12 h-12 object-cover rounded-lg bg-[#FAF7F2] shrink-0 border border-[#E6DFD5] group-hover:scale-105 transition-transform"
                          />
                          <div>
                            <div class="flex items-center gap-1.5">
                              <h4 class="text-xs font-semibold text-[#1E1B18] leading-tight group-hover:text-[#F28482] transition-colors">
                                {{ item.product_title }}
                              </h4>
                              <span
                                v-if="item.product_id === 'taza-cafe-terrosa'"
                                class="text-[9px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded"
                              >
                                TAZAS
                              </span>
                            </div>
                            <p class="text-[11px] text-[#8D857B]">
                              Cantidad: {{ item.quantity }} × {{ formatARS(item.unit_price) }}
                            </p>
                          </div>
                        </div>
                        <div class="flex items-center gap-2">
                          <span class="text-xs font-serif font-bold text-[#1E1B18] shrink-0">
                            {{ formatARS(item.subtotal || item.unit_price * item.quantity) }}
                          </span>
                          <ChevronRight class="w-3.5 h-3.5 text-[#8D857B] group-hover:text-[#1E1B18] group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- BOTÓN DE ARREPENTIMIENTO (Para pedidos en estado de Embalaje y Despacho) -->
                  <div
                    v-if="canRevokeOrder(order)"
                    class="p-4 bg-gradient-to-r from-rose-50/90 via-amber-50/60 to-rose-50/40 rounded-2xl border border-rose-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                          Res. 424/2020
                        </span>
                        <span class="text-xs font-bold text-[#1E1B18] flex items-center gap-1.5">
                          <RotateCcw class="w-3.5 h-3.5 text-rose-600" />
                          Derecho de Arrepentimiento
                        </span>
                      </div>
                      <p class="text-[11px] text-[#6B655D] max-w-md leading-relaxed">
                        Este pedido está en estado de <strong>Embalaje y Despacho</strong>. Conforme a la Ley de Defensa del Consumidor, puedes revocar la compra y solicitar el reembolso total.
                      </p>
                    </div>

                    <button
                      @click="openRevokeConfirmation(order)"
                      type="button"
                      class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-900 border border-rose-300 hover:border-rose-400 font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
                    >
                      <RotateCcw class="w-4 h-4 text-rose-600" />
                      <span>Botón de arrepentimiento</span>
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <!-- Pie del modal -->
          <div class="px-6 py-4 bg-[#FAF7F2] border-t border-[#E6DFD5] flex items-center justify-between">
            <button
              @click="goToCatalog"
              type="button"
              class="inline-flex items-center gap-1.5 text-xs text-[#F28482] hover:underline font-semibold cursor-pointer"
            >
              <ShoppingBag class="w-3.5 h-3.5" />
              <span>Seguir explorando el catálogo</span>
            </button>

            <button
              @click="close"
              type="button"
              class="px-5 py-2 bg-[#1E1B18] hover:bg-[#38342E] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal de confirmación y trámite del Botón de Arrepentimiento -->
    <Transition name="fade">
      <div
        v-if="isRevokeModalOpen"
        class="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs"
        @click.self="closeRevokeModal"
      >
        <div class="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E6DFD5] overflow-hidden animate-fade-in">
          <!-- Pantalla de Éxito / Constancia de Trámite -->
          <div v-if="revokeSuccessData" class="p-6 sm:p-8 text-center space-y-5">
            <div class="w-14 h-14 rounded-full bg-green-100 text-[#2E7D32] flex items-center justify-center mx-auto border border-green-200 shadow-xs">
              <CheckCircle2 class="w-7 h-7" />
            </div>

            <div>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-900 border border-green-300">
                Revocación Confirmada
              </span>
              <h3 class="font-serif text-2xl font-bold text-[#1E1B18] mt-2">
                Solicitud de Arrepentimiento Registrada
              </h3>
              <p class="text-xs text-[#6B655D] mt-1 max-w-md mx-auto">
                Tu solicitud fue procesada conforme a la normativa de Defensa del Consumidor (Ley 24.240 y Res. 424/2020).
              </p>
            </div>

            <!-- Caja con el código de trámite -->
            <div class="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E6DFD5] text-left space-y-2">
              <div class="flex items-center justify-between text-xs border-b border-[#E6DFD5] pb-2">
                <span class="text-[#8D857B]">Código de trámite:</span>
                <span class="font-mono font-bold text-[#1E1B18] bg-white px-2 py-0.5 rounded border border-[#E6DFD5]">
                  #{{ revokeSuccessData.code }}
                </span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-[#8D857B]">Pedido revocado:</span>
                <span class="font-semibold text-[#1E1B18]">#{{ revokeSuccessData.orderId }}</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-[#8D857B]">Monto a reintegrar:</span>
                <span class="font-serif font-bold text-[#F28482]">{{ formatARS(revokeSuccessData.amount) }}</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-[#8D857B]">Fecha y hora:</span>
                <span class="text-[#1E1B18]">{{ formatDate(revokeSuccessData.date) }}</span>
              </div>
            </div>

            <p class="text-[11px] text-[#6B655D] leading-relaxed">
              El pedido ha quedado cancelado y las piezas artesanales regresaron al stock disponible del taller. Nos comunicaremos a <strong>{{ customerEmail }}</strong> con el comprobante de reintegro total.
            </p>

            <button
              @click="closeRevokeModal"
              type="button"
              class="w-full py-3 bg-[#1E1B18] hover:bg-[#38342E] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              Aceptar y ver pedidos actualizados
            </button>
          </div>

          <!-- Formulario de confirmación de arrepentimiento -->
          <div v-else class="p-6 sm:p-8 space-y-5">
            <!-- Cabecera -->
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
                  <RotateCcw class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-serif text-xl font-bold text-[#1E1B18] leading-tight">
                    Botón de Arrepentimiento
                  </h3>
                  <p class="text-xs text-[#6B655D]">
                    Revocación de compra · Ley 24.240 (Art. 34)
                  </p>
                </div>
              </div>

              <button
                @click="closeRevokeModal"
                type="button"
                class="w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#F3EFEA] border border-[#E6DFD5] flex items-center justify-center text-[#8D857B] hover:text-[#1E1B18] transition-colors cursor-pointer"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Resumen del pedido a cancelar -->
            <div class="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E6DFD5] text-xs space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[#8D857B]">Pedido:</span>
                <span class="font-bold text-[#1E1B18]">#{{ orderToRevoke?.id }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[#8D857B]">Estado actual:</span>
                <span class="font-semibold text-[#F28482]">Embalaje y despacho</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[#8D857B]">Importe a reintegrar:</span>
                <span class="font-serif font-bold text-[#1E1B18]">{{ formatARS(orderToRevoke?.total_amount) }}</span>
              </div>
            </div>

            <!-- Selección de motivo -->
            <div class="space-y-2">
              <label class="block text-xs font-semibold text-[#1E1B18]">
                Motivo de la revocación (opcional):
              </label>
              <select
                v-model="revokeReason"
                class="w-full px-3 py-2 text-xs bg-white border border-[#E6DFD5] rounded-xl text-[#1E1B18] focus:outline-none focus:border-[#1E1B18]"
              >
                <option value="Cambio de opinión">Cambio de opinión</option>
                <option value="Compré por error / me equivoqué de pieza">Compré por error / me equivoqué de pieza</option>
                <option value="Plazo de entrega estimado">Plazo de entrega estimado</option>
                <option value="Encontré otra alternativa">Encontré otra alternativa</option>
                <option value="Otro">Otro motivo</option>
              </select>

              <input
                v-if="revokeReason === 'Otro'"
                v-model="customRevokeReason"
                type="text"
                placeholder="Indica brevemente el motivo..."
                class="w-full px-3 py-2 text-xs bg-white border border-[#E6DFD5] rounded-xl text-[#1E1B18] focus:outline-none focus:border-[#1E1B18] mt-2"
              />
            </div>

            <!-- Texto legal informativo -->
            <div class="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
              <strong>Información importante:</strong> Al confirmar, tu compra será cancelada de forma inmediata, las piezas reservadas regresarán al catálogo y se emitirá el código de trámite para la devolución del 100% de tu dinero.
            </div>

            <!-- Acciones -->
            <div class="space-y-2 pt-2">
              <button
                @click="confirmRevocation"
                :disabled="isRevoking"
                type="button"
                class="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <RotateCcw v-if="!isRevoking" class="w-4 h-4" />
                <span v-if="isRevoking">Procesando cancelación...</span>
                <span v-else>Confirmar arrepentimiento y anular pedido</span>
              </button>

              <button
                @click="closeRevokeModal"
                type="button"
                class="w-full py-2.5 bg-white hover:bg-[#FAF7F2] text-[#6B655D] hover:text-[#1E1B18] text-xs font-medium rounded-xl border border-[#E6DFD5] transition-colors cursor-pointer"
              >
                Volver y conservar mi compra
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import {
  X,
  Package,
  ShoppingBag,
  Truck,
  MapPin,
  Check,
  ArrowRight,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
} from 'lucide-vue-next';
import { authService } from '../services/authService';
import { cartService } from '../services/cartService';
import { customerOrdersService } from '../services/customerOrdersService';
import { salesService } from '../services/salesService';

export default {
  name: 'CustomerOrdersModal',
  components: {
    X,
    Package,
    ShoppingBag,
    Truck,
    MapPin,
    Check,
    ArrowRight,
    ChevronRight,
    RotateCcw,
    CheckCircle2,
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close'],
  data() {
    return {
      authService,
      cartService,
      customerOrdersService,
      salesService,
      handleKeyDown: null,
      isRevokeModalOpen: false,
      orderToRevoke: null,
      revokeReason: 'Cambio de opinión',
      customRevokeReason: '',
      isRevoking: false,
      revokeSuccessData: null,
    };
  },
  computed: {
    isModalOpen() {
      return Boolean(this.isOpen || customerOrdersService.isOpen.value);
    },
    orders() {
      return customerOrdersService.customerOrders.value || [];
    },
    customerName() {
      return (
        authService.user.value?.user_metadata?.full_name ||
        authService.profile.value?.full_name ||
        'Cliente'
      );
    },
    customerEmail() {
      return authService.user.value?.email || '';
    },
  },
  mounted() {
    this.handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (this.isRevokeModalOpen) {
          this.closeRevokeModal();
        } else if (this.isModalOpen) {
          this.close();
        }
      }
    };
    window.addEventListener('keydown', this.handleKeyDown);
  },
  beforeUnmount() {
    if (this.handleKeyDown) {
      window.removeEventListener('keydown', this.handleKeyDown);
    }
  },
  methods: {
    close() {
      this.$emit('close');
      customerOrdersService.close();
    },
    isPackagingOrDispatch(status) {
      return status === 'en_camino' || status === 'completado' || status === 'embalaje' || !status;
    },
    canRevokeOrder(order) {
      if (!order) return false;
      if (order.status === 'cancelado' || order.status === 'entregado') return false;
      return this.isPackagingOrDispatch(order.status);
    },
    openRevokeConfirmation(order) {
      this.orderToRevoke = order;
      this.revokeReason = 'Cambio de opinión';
      this.customRevokeReason = '';
      this.revokeSuccessData = null;
      this.isRevokeModalOpen = true;
    },
    closeRevokeModal() {
      this.isRevokeModalOpen = false;
      this.orderToRevoke = null;
      this.revokeSuccessData = null;
      this.isRevoking = false;
    },
    async confirmRevocation() {
      if (!this.orderToRevoke) return;
      this.isRevoking = true;
      try {
        const fullReason =
          this.revokeReason === 'Otro' && this.customRevokeReason.trim()
            ? `Otro: ${this.customRevokeReason.trim()}`
            : this.revokeReason;

        const res = await salesService.cancelSale(this.orderToRevoke.id, fullReason);
        this.revokeSuccessData = {
          code: res.cancellation_code,
          date: res.cancelled_at,
          orderId: this.orderToRevoke.id,
          amount: this.orderToRevoke.total_amount,
        };
      } catch (err) {
        console.error('Error al revocar pedido:', err);
      } finally {
        this.isRevoking = false;
      }
    },
    goToPiece(productId) {
      this.close();
      if (productId) {
        this.$router.push(`/piezas/${productId}`);
      } else {
        this.$router.push('/catalogo');
      }
    },
    goToCatalog() {
      this.close();
      this.$router.push('/catalogo');
    },
    formatARS(val) {
      return cartService.formatARS(val || 0);
    },
    formatDate(dateStr) {
      if (!dateStr) return 'Reciente';
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-AR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch {
        return dateStr;
      }
    },
    getStatusText(status) {
      if (status === 'cancelado') return 'Cancelado (Arrepentimiento)';
      if (status === 'en_camino' || status === 'completado') return 'Embalaje y despacho';
      if (status === 'entregado') return 'Entregado en destino';
      return 'En preparación';
    },
    getStatusBadgeClass(status) {
      if (status === 'cancelado') {
        return 'bg-rose-100 text-rose-800 border border-rose-300';
      }
      if (status === 'en_camino' || status === 'completado') {
        return 'bg-amber-100 text-amber-900 border border-amber-300';
      }
      if (status === 'entregado') {
        return 'bg-green-100 text-green-900 border border-green-300';
      }
      return 'bg-blue-50 text-blue-800 border border-blue-200';
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
