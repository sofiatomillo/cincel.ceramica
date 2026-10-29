<template>
  <div class="p-4 sm:p-5 bg-white rounded-2xl border border-[#E6DFD5] shadow-xs mb-10 space-y-4">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <!-- Filtro por Categorías -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="$emit('update:activeCategory', cat.id)"
          :class="[
            'px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer',
            activeCategory === cat.id
              ? 'bg-[#1E1B18] text-white shadow-xs'
              : 'bg-[#FAF7F2] text-[#6B655D] hover:bg-[#E6DFD5] hover:text-[#1E1B18]'
          ]"
        >
          {{ cat.label }} ({{ cat.count }})
        </button>
      </div>

      <!-- Búsqueda y Ordenación -->
      <div class="flex items-center gap-3 flex-wrap">
        <!-- Buscador por texto -->
        <div class="relative flex-1 sm:w-64">
          <Search class="w-3.5 h-3.5 text-[#8D857B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
            placeholder="Buscar por texto, material..."
            class="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
          />
          <button
            v-if="searchQuery"
            @click="$emit('update:searchQuery', '')"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8D857B] hover:text-[#1E1B18] cursor-pointer"
            aria-label="Limpiar búsqueda"
          >
            ✕
          </button>
        </div>

        <!-- Criterio de Ordenamiento (Nombre, Fecha, Precio, Categoría) -->
        <div class="flex items-center gap-2">
          <SlidersHorizontal class="w-3.5 h-3.5 text-[#8D857B]" />
          <select
            :value="sortBy"
            @change="$emit('update:sortBy', $event.target.value)"
            class="px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482] cursor-pointer"
          >
            <option value="fecha-desc">Fecha: Más recientes</option>
            <option value="fecha-asc">Fecha: Más antiguos</option>
            <option value="nombre-asc">Nombre: A → Z</option>
            <option value="nombre-desc">Nombre: Z → A</option>
            <option value="precio-asc">Precio: Menor a Mayor</option>
            <option value="precio-desc">Precio: Mayor a Menor</option>
            <option value="categoria">Categoría</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Barra inferior de estado y reseteo -->
    <div class="flex items-center justify-between text-xs text-[#8D857B] pt-2 border-t border-[#FAF7F2] flex-wrap gap-2">
      <span>
        {{ statusMessage }}
      </span>

      <div class="flex items-center gap-4">
        <span class="flex items-center gap-1.5 text-[#2E7D32]">
          <span class="w-2 h-2 rounded-full bg-[#2E7D32]" />
          Persistencia activa
        </span>

        <button
          v-if="hasActiveFilters"
          @click="$emit('resetFilters')"
          class="text-[#F28482] hover:underline cursor-pointer text-[11px]"
        >
          Limpiar filtros
        </button>

        <button
          @click="$emit('resetDatabase')"
          class="text-[#8D857B] hover:text-[#1E1B18] underline cursor-pointer text-[11px]"
          title="Restablecer los 16 registros iniciales"
        >
          Restablecer 16 piezas originales
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Search, SlidersHorizontal } from 'lucide-vue-next';

export default {
  name: 'Buscador',
  components: {
    Search,
    SlidersHorizontal,
  },
  props: {
    searchQuery: {
      type: String,
      default: '',
    },
    activeCategory: {
      type: String,
      default: 'todas',
    },
    categories: {
      type: Array,
      default: () => [],
    },
    sortBy: {
      type: String,
      default: 'fecha-desc',
    },
    filteredCount: {
      type: Number,
      required: true,
    },
    totalCount: {
      type: Number,
      required: true,
    },
  },
  emits: [
    'update:searchQuery',
    'update:activeCategory',
    'update:sortBy',
    'resetFilters',
    'resetDatabase',
  ],
  // Propiedades computadas
  computed: {
    hasActiveFilters() {
      return this.activeCategory !== 'todas' || this.searchQuery.trim().length > 0;
    },
    statusMessage() {
      return `Mostrando ${this.filteredCount} de ${this.totalCount} registros en LocalStorage`;
    },
  },
  // Hooks del ciclo de vida
  created() {
    // Hook created ejecutado
  },
  mounted() {
    // Hook mounted ejecutado
  },
};
</script>
