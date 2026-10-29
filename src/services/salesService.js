import { ref } from 'vue';
import { supabase } from '../utils/supabase';
import { authService } from './authService';
import { ceramicsService } from './ceramicsService';

const SALES_STORAGE_KEY = 'cincel_sales_v1';

function loadSalesFromStorage() {
  try {
    const raw = localStorage.getItem(SALES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error al cargar ventas locales:', err);
  }
  return [];
}

function saveSalesToStorage(list) {
  try {
    localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Error al guardar ventas locales:', err);
  }
}

const sales = ref(loadSalesFromStorage());
const loading = ref(false);

export const salesService = {
  sales,
  loading,

  async fetchSales() {
    loading.value = true;
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (*)
        `)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        sales.value = data;
        saveSalesToStorage(data);
        return data;
      }
    } catch (err) {
      console.warn('Supabase sales fetch falló (usando almacenamiento local):', err);
    } finally {
      loading.value = false;
    }
    return sales.value;
  },

  async recordSale(customerData, cartItems, totalAmount, paymentMethod = 'transferencia_o_tarjeta') {
    const saleId = `sale-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const newSale = {
      id: saleId,
      user_id: authService.user.value?.id || null,
      customer_name: customerData.name || 'Cliente',
      customer_email: customerData.email || 'cliente@ejemplo.com',
      customer_phone: customerData.phone || '',
      shipping_address: `${customerData.address || ''}, ${customerData.city || ''} (CP ${customerData.postalCode || ''})`,
      total_amount: totalAmount,
      status: 'completado',
      payment_method: paymentMethod,
      created_at: new Date().toISOString(),
      sale_items: cartItems.map((item) => ({
        id: `item-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        product_id: item.piece.id,
        product_title: item.piece.title,
        product_image: item.piece.imageSrc,
        unit_price: item.piece.priceNumber,
        quantity: item.quantity,
        subtotal: item.piece.priceNumber * item.quantity,
      })),
    };

    // Actualizar reactividad local y LocalStorage
    sales.value.unshift(newSale);
    saveSalesToStorage(sales.value);

    // Descontar stock localmente
    cartItems.forEach((ci) => {
      const p = ceramicsService.getById(ci.piece.id);
      if (p) {
        const newStock = Math.max(0, (p.stockCount || 0) - ci.quantity);
        ceramicsService.update(p.id, {
          stockCount: newStock,
          inStock: newStock > 0,
        });
      }
    });

    // Intentar sincronizar con Supabase
    try {
      const { data: dbSale, error: saleErr } = await supabase
        .from('sales')
        .insert({
          user_id: authService.user.value?.id || null,
          customer_name: newSale.customer_name,
          customer_email: newSale.customer_email,
          customer_phone: newSale.customer_phone,
          shipping_address: newSale.shipping_address,
          total_amount: newSale.total_amount,
          status: 'completado',
          payment_method: newSale.payment_method,
        })
        .select()
        .single();

      if (!saleErr && dbSale) {
        // Insertar items de la venta
        const itemsToInsert = cartItems.map((item) => ({
          sale_id: dbSale.id,
          product_id: item.piece.id,
          product_title: item.piece.title,
          product_image: item.piece.imageSrc,
          unit_price: item.piece.priceNumber,
          quantity: item.quantity,
          subtotal: item.piece.priceNumber * item.quantity,
        }));

        await supabase.from('sale_items').insert(itemsToInsert);
      }
    } catch (err) {
      console.warn('Venta registrada localmente. Sincronización Supabase pendiente:', err);
    }

    return newSale;
  },
};
