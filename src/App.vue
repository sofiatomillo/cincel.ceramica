<template>
  <div class="min-h-screen bg-[#FAF7F2] text-[#2D2A26] flex flex-col font-sans selection:bg-[#f6b1b7] selection:text-[#292623]">
    <Navbar />

    <main class="flex-1">
      <router-view />
    </main>

    <Footer />

    <!-- Modales Globales -->
    <PieceModal />
    <CartDrawer />

    <!-- Botón flotante para abrir cesta si hay productos -->
    <div v-if="totalCartItems > 0" class="fixed bottom-6 right-6 z-40">
      <button
        @click="cartService.isCartOpen = true"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F28482] hover:bg-[#E06F6D] text-white text-xs sm:text-sm font-medium rounded-full shadow-xl transition-all hover:scale-105 cursor-pointer"
      >
        <ShoppingBag class="w-4 h-4" />
        <span>Ver Cesta ({{ totalCartItems }})</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { ShoppingBag } from 'lucide-vue-next';
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
import PieceModal from './components/PieceModal.vue';
import CartDrawer from './components/CartDrawer.vue';
import { cartService } from './services/cartService';

const totalCartItems = computed(() => {
  const t = cartService.totalItems;
  return typeof t === 'number' ? t : (t?.value || 0);
});

function handleDragOver(e) {
  e.preventDefault();
}

function handleDrop(e) {
  e.preventDefault();
  if (!e.dataTransfer?.files) return;

  const files = Array.from(e.dataTransfer.files);
  files.forEach((file) => {
    const url = URL.createObjectURL(file);
    cartService.setDroppedImage(file.name, url);
  });
}

onMounted(() => {
  window.addEventListener('dragover', handleDragOver);
  window.addEventListener('drop', handleDrop);
});

onUnmounted(() => {
  window.removeEventListener('dragover', handleDragOver);
  window.removeEventListener('drop', handleDrop);
});
</script>
