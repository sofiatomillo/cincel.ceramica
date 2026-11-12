import { ref, computed } from 'vue';
import { salesService } from './salesService';
import { authService } from './authService';

const isOpen = ref(false);

const customerOrders = computed(() => {
  const currentEmail = (authService.user.value?.email || '').toLowerCase().trim();
  const currentId = authService.user.value?.id;
  const allSales = salesService.sales.value || [];

  // Si no hay usuario logueado, no mostrar pedidos de terceros
  if (!currentEmail && !currentId) {
    return [];
  }

  return allSales.filter((sale) => {
    const saleEmail = (sale.customer_email || '').toLowerCase().trim();
    const saleUserId = sale.user_id;
    return (
      (currentEmail && saleEmail === currentEmail) ||
      (currentId && saleUserId === currentId)
    );
  });
});

export const customerOrdersService = {
  isOpen,
  customerOrders,
  open() {
    isOpen.value = true;
  },
  close() {
    isOpen.value = false;
  },
  toggle() {
    isOpen.value = !isOpen.value;
  },
};
