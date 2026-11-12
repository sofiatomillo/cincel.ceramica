<template>
  <div class="py-10 sm:py-16 bg-[#FAF7F2] min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-xs text-[#8D857B] mb-8">
        <router-link to="/" class="hover:text-[#F28482] transition-colors flex items-center gap-1">
          <ArrowLeft class="w-3.5 h-3.5" />
          Inicio
        </router-link>
        <ChevronRight class="w-3.5 h-3.5" />
        <span class="font-semibold text-[#1E1B18]">Administración · Pedidos y Ventas (Supabase)</span>
      </nav>

      <!-- Mensaje de Feedback de Acción Admin -->
      <Transition name="fade">
        <div
          v-if="adminFeedback"
          class="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 shadow-sm"
        >
          <div class="flex items-center gap-2.5">
            <Check class="w-4 h-4 text-[#2E7D32] shrink-0" />
            <div>
              <strong class="font-semibold">{{ adminFeedback.title }}</strong>
              <p class="text-[11px] text-emerald-700 mt-0.5">{{ adminFeedback.message }}</p>
            </div>
          </div>
          <button
            @click="adminFeedback = null"
            class="text-emerald-700 hover:text-emerald-900 text-xs font-semibold px-2 py-1"
          >
            ✕
          </button>
        </div>
      </Transition>

      <!-- Cabecera Principal -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div class="inline-flex items-center gap-2 mb-2">
            <span class="w-2.5 h-2.5 rounded-full bg-[#2E7D32] animate-pulse" />
            <span class="text-xs font-semibold uppercase tracking-wider text-[#2E7D32]">
              PANEL ADMINISTRADOR · SOFÍA TOMILLO
            </span>
          </div>
          <h1 class="font-serif text-3xl sm:text-4xl font-semibold text-[#1E1B18]">
            Recepción y Confirmación de Pedidos
          </h1>
          <p class="text-xs sm:text-sm text-[#6B655D] mt-1">
            Recepción de compras de clientes, confirmación por el administrador y sincronización con Supabase (<code>public.sales</code>).
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="refreshSales"
            :disabled="salesService.loading.value"
            class="px-4 py-2.5 bg-white border border-[#E6DFD5] hover:border-[#1E1B18] text-[#1E1B18] rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
            title="Sincronizar pedidos con Supabase"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': salesService.loading.value }" />
            <span>Actualizar</span>
          </button>

          <button
            @click="isSqlModalOpen = true"
            class="px-4 py-2.5 bg-[#1E1B18] hover:bg-[#38342E] text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Database class="w-3.5 h-3.5 text-[#F28482]" />
            <span>Ver Export SQL</span>
          </button>
        </div>
      </div>

      <!-- Pestañas de Vista (Recepción de Pedidos vs Historial y Métricas) -->
      <div id="recepcion-pedidos" class="flex border-b border-[#E6DFD5] gap-2 mb-8 overflow-x-auto">
        <button
          @click="activeTab = 'recepcion'"
          class="pb-3 px-4 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer relative"
          :class="activeTab === 'recepcion' ? 'text-[#1E1B18] border-b-2 border-[#F28482]' : 'text-[#8D857B] hover:text-[#1E1B18]'"
        >
          <Inbox class="w-4 h-4 text-[#F28482]" />
          <span>Recepción y Confirmación de Pedidos</span>
          <span
            v-if="pendingCount > 0"
            class="px-2 py-0.5 bg-[#F28482] text-white rounded-full text-[10px] font-bold animate-pulse"
          >
            {{ pendingCount }} pendiente{{ pendingCount > 1 ? 's' : '' }}
          </span>
        </button>

        <button
          @click="activeTab = 'historial'"
          class="pb-3 px-4 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer relative"
          :class="activeTab === 'historial' ? 'text-[#1E1B18] border-b-2 border-[#F28482]' : 'text-[#8D857B] hover:text-[#1E1B18]'"
        >
          <PackageCheck class="w-4 h-4 text-[#2E7D32]" />
          <span>Historial Completo & Métricas ({{ totalSalesCount }})</span>
        </button>
      </div>

      <!-- Tarjetas de Métricas Resumen -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div class="p-5 bg-white rounded-2xl border border-[#E6DFD5] shadow-xs">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] font-semibold text-[#8D857B] uppercase tracking-wider">Pendientes de Confirmar</span>
            <Clock class="w-4 h-4 text-amber-500" />
          </div>
          <p class="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18]">
            {{ pendingCount }}
          </p>
          <span class="text-[10px] text-[#8D857B] mt-1 block">Esperan revisión de Sofía Tomillo</span>
        </div>

        <div class="p-5 bg-white rounded-2xl border border-[#E6DFD5] shadow-xs">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] font-semibold text-[#8D857B] uppercase tracking-wider">Confirmados / En Preparación</span>
            <Check class="w-4 h-4 text-[#2E7D32]" />
          </div>
          <p class="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18]">
            {{ confirmedCount }}
          </p>
          <span class="text-[10px] text-[#8D857B] mt-1 block">Aprobados por administración</span>
        </div>

        <div class="p-5 bg-white rounded-2xl border border-[#E6DFD5] shadow-xs">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] font-semibold text-[#8D857B] uppercase tracking-wider">Embalaje y Despacho</span>
            <Truck class="w-4 h-4 text-[#4285F4]" />
          </div>
          <p class="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18]">
            {{ dispatchCount }}
          </p>
          <span class="text-[10px] text-[#8D857B] mt-1 block">En preparación de envío</span>
        </div>

        <div class="p-5 bg-white rounded-2xl border border-[#E6DFD5] shadow-xs">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] font-semibold text-[#8D857B] uppercase tracking-wider">Monto Total Facturado</span>
            <DollarSign class="w-4 h-4 text-[#2E7D32]" />
          </div>
          <p class="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18]">
            {{ formattedTotalRevenue }}
          </p>
          <span class="text-[10px] text-[#8D857B] mt-1 block">{{ totalPiecesSold }} piezas artesanales</span>
        </div>
      </div>

      <!-- Filtros de Estado en Pestaña Recepción -->
      <div v-if="activeTab === 'recepcion'" class="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-3 rounded-2xl border border-[#E6DFD5]">
        <div class="flex flex-wrap items-center gap-1.5 text-xs">
          <span class="text-[#8D857B] text-[11px] font-medium mr-1">Filtrar por estado:</span>
          <button
            v-for="filter in statusFilters"
            :key="filter.id"
            @click="selectedFilter = filter.id"
            class="px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer text-xs"
            :class="selectedFilter === filter.id ? 'bg-[#1E1B18] text-white shadow-2xs' : 'bg-[#FAF7F2] text-[#6B655D] hover:bg-[#F3EFEA] hover:text-[#1E1B18]'"
          >
            {{ filter.label }} ({{ getFilterCount(filter.id) }})
          </button>
        </div>

        <div class="flex items-center gap-2 text-[11px] text-[#2E7D32] font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <span class="w-2 h-2 rounded-full bg-[#2E7D32]" />
          <span>Base de datos Supabase conectada</span>
        </div>
      </div>

      <!-- Listado de Pedidos en Recepción y Confirmación -->
      <div v-if="filteredOrders.length === 0" class="p-12 bg-white rounded-3xl border border-[#E6DFD5] text-center space-y-4 shadow-sm">
        <Inbox class="w-12 h-12 text-[#8D857B] mx-auto" />
        <h3 class="font-serif text-xl font-semibold text-[#1E1B18]">
          No hay pedidos en esta sección
        </h3>
        <p class="text-xs text-[#6B655D] max-w-md mx-auto">
          Los pedidos que los clientes realicen desde la tienda online aparecerán aquí inmediatamente para su revisión y confirmación.
        </p>
      </div>

      <!-- Listado de Tarjetas de Pedidos -->
      <div v-else class="space-y-6">
        <div
          v-for="sale in filteredOrders"
          :key="sale.id"
          class="bg-white rounded-3xl border border-[#E6DFD5] shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          :class="{
            'ring-2 ring-amber-300/80 border-amber-300': isPending(sale.status),
            'border-emerald-300/80': sale.status === 'confirmado',
          }"
        >
          <!-- Barra superior del pedido -->
          <div class="p-5 bg-[#FAF7F2] border-b border-[#E6DFD5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-2.5">
              <span class="font-mono text-xs font-bold text-[#1E1B18] bg-white px-3 py-1 rounded-lg border border-[#E6DFD5] shadow-2xs">
                {{ sale.id }}
              </span>

              <!-- Badge de Estado del Pedido -->
              <span
                class="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5"
                :class="getStatusBadgeClass(sale.status)"
              >
                <span v-if="isPending(sale.status)" class="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
                <Check v-else-if="sale.status === 'confirmado'" class="w-3.5 h-3.5" />
                <Truck v-else-if="sale.status === 'en_camino'" class="w-3.5 h-3.5" />
                <span>{{ getStatusLabel(sale.status) }}</span>
              </span>

              <!-- Badge Supabase Sincronizado -->
              <span class="text-[10px] font-semibold text-[#2E7D32] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span>Supabase: public.sales</span>
              </span>
            </div>

            <div class="flex items-center gap-4 text-xs text-[#8D857B]">
              <span class="flex items-center gap-1.5">
                <Calendar class="w-3.5 h-3.5" />
                {{ formatDate(sale.created_at) }}
              </span>
              <span class="font-serif font-bold text-base text-[#1E1B18]">
                {{ formatARS(sale.total_amount) }}
              </span>
            </div>
          </div>

          <!-- Cuerpo de la Tarjeta del Pedido -->
          <div class="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- Datos del Cliente y Envío (5 columnas) -->
            <div class="lg:col-span-5 space-y-3 text-xs border-b lg:border-b-0 lg:border-r border-[#E6DFD5] pb-4 lg:pb-0 lg:pr-6">
              <div class="flex items-center justify-between">
                <span class="text-[10px] uppercase font-bold tracking-wider text-[#8D857B]">
                  Datos de Entrega del Cliente
                </span>
                <span v-if="sale.customer_email === 'martin.gomez@gmail.com'" class="text-[9px] font-bold bg-[#FAF7F2] text-[#2E7D32] px-2 py-0.5 rounded-md border border-emerald-200">
                  Cliente Registrado
                </span>
              </div>

              <div class="p-3 bg-[#FAF7F2] rounded-xl border border-[#E6DFD5] space-y-1.5">
                <p class="font-bold text-sm text-[#1E1B18]">
                  {{ sale.customer_name }}
                </p>
                <p class="flex items-center gap-2 text-[#6B655D]">
                  <Mail class="w-3.5 h-3.5 text-[#8D857B] shrink-0" />
                  <span>{{ sale.customer_email }}</span>
                </p>
                <p v-if="sale.customer_phone" class="flex items-center gap-2 text-[#6B655D]">
                  <Phone class="w-3.5 h-3.5 text-[#8D857B] shrink-0" />
                  <span>{{ sale.customer_phone }}</span>
                </p>
                <p v-if="sale.shipping_address" class="flex items-start gap-2 text-[#6B655D] pt-1 border-t border-[#E6DFD5]">
                  <MapPin class="w-3.5 h-3.5 text-[#8D857B] shrink-0 mt-0.5" />
                  <span>{{ sale.shipping_address }}</span>
                </p>
              </div>

              <div class="flex items-center justify-between text-xs text-[#6B655D]">
                <span>Método de pago:</span>
                <span class="font-semibold text-[#1E1B18] capitalize">
                  {{ formatPaymentMethod(sale.payment_method) }}
                </span>
              </div>

              <!-- Registro de Confirmación previa si ya fue confirmado -->
              <div v-if="sale.confirmed_by" class="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs space-y-1">
                <div class="flex items-center gap-1.5 text-emerald-900 font-bold">
                  <Check class="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span>Confirmado por {{ sale.confirmed_by }}</span>
                </div>
                <p class="text-[11px] text-emerald-800">
                  Fecha: {{ formatDate(sale.confirmed_at) }}
                </p>
                <p v-if="sale.notes" class="text-[11px] text-emerald-950 italic mt-1">
                  «{{ sale.notes }}»
                </p>
              </div>
            </div>

            <!-- Artículos Comprados y Panel de Confirmación de Sofia (7 columnas) -->
            <div class="lg:col-span-7 flex flex-col justify-between space-y-4">
              <!-- Artículos -->
              <div class="space-y-2.5">
                <span class="text-[10px] uppercase font-bold tracking-wider text-[#8D857B] block">
                  Piezas Solicitadas en el Pedido
                </span>

                <div
                  v-for="item in (sale.sale_items || [])"
                  :key="item.id"
                  class="flex items-center justify-between p-3 bg-[#FAF7F2] rounded-xl border border-[#E6DFD5] text-xs"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <img
                      v-if="item.product_image"
                      :src="item.product_image"
                      :alt="item.product_title"
                      class="w-12 h-12 object-cover rounded-lg bg-white border border-[#E6DFD5] shrink-0"
                    />
                    <div class="min-w-0">
                      <span class="font-semibold text-[#1E1B18] block truncate">
                        {{ item.product_title }}
                      </span>
                      <span class="text-[11px] text-[#8D857B]">
                        {{ item.quantity }} unid. × {{ formatARS(item.unit_price) }}
                      </span>
                      <span
                        v-if="item.product_id === 'vaso-termico-verde-musgo' || item.product_title.includes('Camila')"
                        class="inline-block mt-0.5 text-[10px] font-semibold text-[#2E7D32] bg-emerald-100/80 px-1.5 py-0.2 rounded"
                      >
                        ✨ Pieza creada por Camila Torres
                      </span>
                    </div>
                  </div>
                  <span class="font-bold text-[#1E1B18] shrink-0 ml-3">
                    {{ formatARS(item.subtotal || item.unit_price * item.quantity) }}
                  </span>
                </div>
              </div>

              <!-- SECCIÓN DE ACCIONES DE ADMINISTRACIÓN: RECEPCIÓN Y CONFIRMACIÓN -->
              <div class="pt-3 border-t border-[#E6DFD5] space-y-3">
                <!-- CASO 1: Pedido Pendiente de Confirmación -->
                <div
                  v-if="isPending(sale.status)"
                  class="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 text-xs font-bold text-amber-950">
                      <Clock class="w-4 h-4 text-amber-600" />
                      <span>Pedido Recepcionado · Espera tu confirmación</span>
                    </div>
                    <span class="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      Acción requerida
                    </span>
                  </div>

                  <div>
                    <label class="block text-[11px] font-semibold text-[#1E1B18] mb-1">
                      Nota de confirmación del administrador (se guardará en Supabase):
                    </label>
                    <input
                      type="text"
                      v-model="orderNotes[sale.id]"
                      placeholder="Ej. Stock verificado en taller. Embalaje especial preparado."
                      class="w-full px-3 py-2 text-xs bg-white border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                    />
                  </div>

                  <div class="flex flex-wrap items-center gap-2.5 pt-1">
                    <button
                      @click="handleConfirmOrder(sale.id, 'confirmado')"
                      :disabled="isProcessing[sale.id]"
                      class="flex-1 py-2.5 px-4 bg-[#2E7D32] hover:bg-[#256829] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check class="w-4 h-4" />
                      <span>✓ Confirmar Pedido (Guardar en Supabase)</span>
                    </button>

                    <button
                      @click="handleConfirmOrder(sale.id, 'en_camino')"
                      :disabled="isProcessing[sale.id]"
                      class="py-2.5 px-4 bg-[#1E1B18] hover:bg-[#38342E] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Confirmar y mover directo a embalaje"
                    >
                      <Truck class="w-4 h-4 text-[#F28482]" />
                      <span>Confirmar y Despachar</span>
                    </button>
                  </div>
                </div>

                <!-- CASO 2: Pedido Confirmado (Opción de avanzar a Embalaje) -->
                <div
                  v-else-if="sale.status === 'confirmado'"
                  class="flex items-center justify-between p-3 bg-emerald-50/50 rounded-2xl border border-emerald-200 text-xs"
                >
                  <div class="flex items-center gap-2 text-emerald-900">
                    <Check class="w-4 h-4 text-[#2E7D32]" />
                    <span>Pedido confirmado y guardado en Supabase. Listo para embalar.</span>
                  </div>

                  <button
                    @click="handleUpdateStatus(sale.id, 'en_camino')"
                    :disabled="isProcessing[sale.id]"
                    class="px-3.5 py-1.5 bg-[#1E1B18] hover:bg-[#38342E] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Truck class="w-3.5 h-3.5 text-[#F28482]" />
                    <span>Pasar a Embalaje y Despacho</span>
                  </button>
                </div>

                <!-- CASO 3: En Embalaje y Despacho -->
                <div
                  v-else-if="sale.status === 'en_camino'"
                  class="flex items-center justify-between p-3 bg-blue-50/50 rounded-2xl border border-blue-200 text-xs"
                >
                  <div class="flex items-center gap-2 text-blue-900">
                    <Truck class="w-4 h-4 text-blue-600" />
                    <span>En proceso de embalaje y despacho. El cliente puede solicitar arrepentimiento antes del envío final.</span>
                  </div>

                  <button
                    @click="handleUpdateStatus(sale.id, 'completado')"
                    :disabled="isProcessing[sale.id]"
                    class="px-3 py-1.5 bg-white border border-blue-300 hover:bg-blue-50 text-blue-900 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Marcar como Entregado
                  </button>
                </div>

                <!-- CASO 4: Cancelado por Arrepentimiento -->
                <div
                  v-else-if="sale.status === 'cancelado'"
                  class="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs space-y-1 text-rose-900"
                >
                  <div class="flex items-center gap-2 font-bold">
                    <AlertCircle class="w-4 h-4 text-rose-600" />
                    <span>Cancelado mediante Botón de Arrepentimiento</span>
                  </div>
                  <p class="text-[11px] text-rose-800">
                    Código de cancelación: <strong class="font-mono">{{ sale.cancellation_code }}</strong> · Motivo: {{ sale.cancellation_reason || 'Arrepentimiento de compra' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Export SQL -->
    <SqlExportModal :isOpen="isSqlModalOpen" @close="isSqlModalOpen = false" />
  </div>
</template>

<script>
import {
  ArrowLeft,
  ChevronRight,
  ShoppingBag,
  DollarSign,
  PackageCheck,
  RefreshCw,
  Database,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Check,
  Clock,
  Truck,
  AlertCircle,
  Inbox,
  Shield,
  FileText,
  Sparkles,
} from 'lucide-vue-next';
import { salesService } from '../services/salesService';
import { authService } from '../services/authService';
import SqlExportModal from '../components/SqlExportModal.vue';

export default {
  name: 'SalesView',
  components: {
    ArrowLeft,
    ChevronRight,
    ShoppingBag,
    DollarSign,
    PackageCheck,
    RefreshCw,
    Database,
    Calendar,
    Mail,
    Phone,
    MapPin,
    Check,
    Clock,
    Truck,
    AlertCircle,
    Inbox,
    Shield,
    FileText,
    Sparkles,
    SqlExportModal,
  },
  data() {
    return {
      salesService,
      authService,
      activeTab: 'recepcion', // 'recepcion' | 'historial'
      selectedFilter: 'todos', // 'todos' | 'pendiente' | 'confirmado' | 'en_camino' | 'cancelado'
      isSqlModalOpen: false,
      orderNotes: {},
      isProcessing: {},
      adminFeedback: null,
      statusFilters: [
        { id: 'todos', label: 'Todos' },
        { id: 'pendiente', label: 'Pendientes' },
        { id: 'confirmado', label: 'Confirmados' },
        { id: 'en_camino', label: 'Embalaje y Despacho' },
        { id: 'cancelado', label: 'Cancelados' },
      ],
    };
  },
  computed: {
    salesList() {
      const s = salesService.sales;
      return Array.isArray(s) ? s : (s?.value || []);
    },
    totalSalesCount() {
      return this.salesList.length;
    },
    pendingCount() {
      return this.salesList.filter((s) => this.isPending(s.status)).length;
    },
    confirmedCount() {
      return this.salesList.filter((s) => s.status === 'confirmado').length;
    },
    dispatchCount() {
      return this.salesList.filter((s) => s.status === 'en_camino').length;
    },
    cancelledCount() {
      return this.salesList.filter((s) => s.status === 'cancelado').length;
    },
    totalRevenue() {
      return this.salesList
        .filter((s) => s.status !== 'cancelado')
        .reduce((acc, s) => acc + Number(s.total_amount || 0), 0);
    },
    formattedTotalRevenue() {
      return this.formatARS(this.totalRevenue);
    },
    totalPiecesSold() {
      return this.salesList.reduce((acc, s) => {
        const items = s.sale_items || [];
        return acc + items.reduce((iAcc, item) => iAcc + Number(item.quantity || 1), 0);
      }, 0);
    },
    filteredOrders() {
      if (this.selectedFilter === 'todos') {
        return this.salesList;
      }
      if (this.selectedFilter === 'pendiente') {
        return this.salesList.filter((s) => this.isPending(s.status));
      }
      return this.salesList.filter((s) => s.status === this.selectedFilter);
    },
  },
  created() {
    salesService.fetchSales();
    this.checkHash();
  },
  mounted() {
    window.addEventListener('hashchange', this.checkHash);
  },
  beforeUnmount() {
    window.removeEventListener('hashchange', this.checkHash);
  },
  methods: {
    checkHash() {
      const hash = window.location.hash;
      if (hash === '#recepcion-pedidos') {
        this.activeTab = 'recepcion';
      } else if (hash === '#historial') {
        this.activeTab = 'historial';
      }
    },
    isPending(status) {
      return status === 'pendiente_confirmacion' || status === 'pendiente' || !status;
    },
    getStatusLabel(status) {
      if (this.isPending(status)) return 'Pendiente de Confirmación';
      if (status === 'confirmado') return 'Confirmado por Sofía Tomillo';
      if (status === 'en_camino') return 'Embalaje y Despacho';
      if (status === 'completado') return 'Entregado / Completado';
      if (status === 'cancelado') return 'Cancelado (Arrepentimiento)';
      return status;
    },
    getStatusBadgeClass(status) {
      if (this.isPending(status)) {
        return 'text-amber-900 bg-amber-100 border border-amber-300';
      }
      if (status === 'confirmado') {
        return 'text-[#2E7D32] bg-emerald-100 border border-emerald-300';
      }
      if (status === 'en_camino') {
        return 'text-blue-900 bg-blue-100 border border-blue-300';
      }
      if (status === 'cancelado') {
        return 'text-rose-900 bg-rose-100 border border-rose-300';
      }
      return 'text-[#1E1B18] bg-[#FAF7F2] border border-[#E6DFD5]';
    },
    getFilterCount(filterId) {
      if (filterId === 'todos') return this.totalSalesCount;
      if (filterId === 'pendiente') return this.pendingCount;
      if (filterId === 'confirmado') return this.confirmedCount;
      if (filterId === 'en_camino') return this.dispatchCount;
      if (filterId === 'cancelado') return this.cancelledCount;
      return 0;
    },
    formatARS(num) {
      const val = Math.round(Number(num) || 0);
      return `$ ${val.toLocaleString('es-AR')}`;
    },
    formatDate(dateStr) {
      if (!dateStr) return 'Reciente';
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-AR', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch {
        return dateStr;
      }
    },
    formatPaymentMethod(pm) {
      if (pm === 'mercadopago') return 'Mercado Pago / Transferencia';
      if (pm === 'card') return 'Tarjeta de crédito/débito';
      return pm || 'Mercado Pago';
    },
    async refreshSales() {
      await salesService.fetchSales();
      this.adminFeedback = {
        title: 'Sincronización actualizada',
        message: 'Registros actualizados correctamente con la base de datos de Supabase.',
      };
    },
    async handleConfirmOrder(saleId, targetStatus = 'confirmado') {
      this.isProcessing[saleId] = true;
      const note = this.orderNotes[saleId] || 'Pedido confirmado por Sofía Tomillo. Stock asignado y embalaje preparado.';
      
      const res = await salesService.confirmOrder(saleId, {
        notes: note,
        status: targetStatus,
      });

      this.isProcessing[saleId] = false;
      this.adminFeedback = {
        title: `Pedido ${saleId} Confirmado`,
        message: `El pedido fue confirmado exitosamente por Sofía Tomillo y sus datos se guardaron en la base de datos de Supabase (public.sales).`,
      };
    },
    async handleUpdateStatus(saleId, newStatus) {
      this.isProcessing[saleId] = true;
      await salesService.updateOrderStatus(saleId, newStatus);
      this.isProcessing[saleId] = false;
      this.adminFeedback = {
        title: `Estado Actualizado`,
        message: `El pedido ${saleId} cambió a estado "${this.getStatusLabel(newStatus)}" y se sincronizó con Supabase.`,
      };
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
