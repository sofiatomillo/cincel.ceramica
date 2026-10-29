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
        <span class="font-semibold text-[#1E1B18]">Panel de Ventas & Pedidos (Supabase)</span>
      </nav>

      <!-- Cabecera -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div class="inline-flex items-center gap-2 mb-2">
            <span class="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
            <span class="text-xs font-semibold uppercase tracking-wider text-[#2E7D32]">
              BASE DE DATOS · VENTAS Y PEDIDOS
            </span>
          </div>
          <h1 class="font-serif text-3xl sm:text-4xl font-semibold text-[#1E1B18]">
            Historial de Ventas
          </h1>
          <p class="text-xs sm:text-sm text-[#6B655D] mt-1">
            Registro sincronizado con la tabla <code>public.sales</code> y <code>public.sale_items</code> en Supabase.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="refreshSales"
            :disabled="salesService.loading.value"
            class="px-4 py-2.5 bg-white border border-[#E6DFD5] hover:border-[#1E1B18] text-[#1E1B18] rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
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

      <!-- Tarjetas de Estadísticas -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div class="p-6 bg-white rounded-2xl border border-[#E6DFD5] shadow-xs">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-[#8D857B] uppercase tracking-wider">Ventas Totales</span>
            <ShoppingBag class="w-4 h-4 text-[#F28482]" />
          </div>
          <p class="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18]">
            {{ totalSalesCount }}
          </p>
        </div>

        <div class="p-6 bg-white rounded-2xl border border-[#E6DFD5] shadow-xs">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-[#8D857B] uppercase tracking-wider">Monto Recaudado</span>
            <DollarSign class="w-4 h-4 text-[#2E7D32]" />
          </div>
          <p class="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18]">
            {{ formattedTotalRevenue }}
          </p>
        </div>

        <div class="p-6 bg-white rounded-2xl border border-[#E6DFD5] shadow-xs">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-[#8D857B] uppercase tracking-wider">Piezas Vendidas</span>
            <PackageCheck class="w-4 h-4 text-[#4285F4]" />
          </div>
          <p class="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18]">
            {{ totalPiecesSold }}
          </p>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-if="salesList.length === 0" class="p-12 bg-white rounded-3xl border border-[#E6DFD5] text-center space-y-4 shadow-sm">
        <ShoppingBag class="w-12 h-12 text-[#8D857B] mx-auto" />
        <h3 class="font-serif text-xl font-semibold text-[#1E1B18]">
          No hay ventas registradas todavía
        </h3>
        <p class="text-xs text-[#6B655D] max-w-md mx-auto">
          Cuando los clientes finalicen compras a través de la cesta de compras, los pedidos se guardarán automáticamente en la base de datos de Supabase.
        </p>
        <router-link
          to="/catalogo"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E1B18] text-white text-xs font-semibold rounded-xl hover:bg-[#38342E] transition-colors"
        >
          Explorar catálogo
        </router-link>
      </div>

      <!-- Listado de Ventas -->
      <div v-else class="space-y-4">
        <div
          v-for="sale in salesList"
          :key="sale.id"
          class="p-6 bg-white rounded-2xl border border-[#E6DFD5] shadow-xs hover:border-[#D5CDC2] transition-colors"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E6DFD5]">
            <div class="flex items-center gap-3">
              <span class="font-mono text-xs font-bold text-[#1E1B18] bg-[#FAF7F2] px-3 py-1 rounded-lg border border-[#E6DFD5]">
                {{ sale.id }}
              </span>
              <span class="text-xs font-medium text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full">
                {{ sale.status || 'Completado' }}
              </span>
            </div>

            <div class="text-xs text-[#8D857B] flex items-center gap-1.5">
              <Calendar class="w-3.5 h-3.5" />
              <span>{{ formatDate(sale.created_at) }}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4">
            <!-- Datos del Cliente -->
            <div class="md:col-span-5 space-y-1.5 text-xs text-[#6B655D]">
              <p class="font-semibold text-sm text-[#1E1B18]">
                {{ sale.customer_name }}
              </p>
              <p class="flex items-center gap-1.5">
                <Mail class="w-3.5 h-3.5 text-[#8D857B]" />
                <span>{{ sale.customer_email }}</span>
              </p>
              <p v-if="sale.customer_phone" class="flex items-center gap-1.5">
                <Phone class="w-3.5 h-3.5 text-[#8D857B]" />
                <span>{{ sale.customer_phone }}</span>
              </p>
              <p v-if="sale.shipping_address" class="flex items-start gap-1.5 pt-1">
                <MapPin class="w-3.5 h-3.5 text-[#8D857B] shrink-0 mt-0.5" />
                <span>{{ sale.shipping_address }}</span>
              </p>
            </div>

            <!-- Items Vendidos -->
            <div class="md:col-span-7 space-y-2.5">
              <span class="text-[10px] font-semibold uppercase tracking-wider text-[#8D857B] block">
                Artículos adquiridos
              </span>
              <div
                v-for="item in (sale.sale_items || [])"
                :key="item.id"
                class="flex items-center justify-between p-2.5 bg-[#FAF7F2] rounded-xl text-xs"
              >
                <div class="flex items-center gap-3">
                  <img
                    v-if="item.product_image"
                    :src="item.product_image"
                    :alt="item.product_title"
                    class="w-10 h-10 object-cover rounded-lg bg-white"
                  />
                  <div>
                    <span class="font-medium text-[#1E1B18] block">{{ item.product_title }}</span>
                    <span class="text-[11px] text-[#8D857B]">
                      {{ item.quantity }} × {{ formatARS(item.unit_price) }}
                    </span>
                  </div>
                </div>
                <span class="font-semibold text-[#1E1B18]">
                  {{ formatARS(item.subtotal || item.unit_price * item.quantity) }}
                </span>
              </div>

              <!-- Total de la venta -->
              <div class="flex items-center justify-between pt-2 text-sm font-semibold text-[#1E1B18]">
                <span>Total de la orden:</span>
                <span class="font-serif text-lg text-[#F28482]">
                  {{ formatARS(sale.total_amount) }}
                </span>
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
    SqlExportModal,
  },
  data() {
    return {
      salesService,
      authService,
      isSqlModalOpen: false,
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
    totalRevenue() {
      return this.salesList.reduce((acc, s) => acc + Number(s.total_amount || 0), 0);
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
  },
  created() {
    salesService.fetchSales();
  },
  methods: {
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
    async refreshSales() {
      await salesService.fetchSales();
    },
  },
};
</script>
