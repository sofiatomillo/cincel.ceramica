import { ref } from 'vue';
import { supabase } from '../utils/supabase';
import { authService } from './authService';
import { ceramicsService } from './ceramicsService';

const SALES_STORAGE_KEY = 'cincel_sales_v1';

const SEED_SALES = [
  {
    id: 'CIN-749102',
    user_id: 'customer-laura-russo',
    customer_name: 'Laura Russo',
    customer_email: 'laura.r@gmail.com',
    customer_phone: '+54 11 4821-9988',
    shipping_address: 'Av. Santa Fe 3420, Piso 4 B, CABA (CP C1425)',
    total_amount: 32000,
    status: 'en_camino',
    payment_method: 'mercadopago',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    sale_items: [
      {
        id: 'item-laura-01',
        product_id: 'taza-cafe-terrosa',
        product_title: 'Taza Café Terrosa',
        product_image: '/assets/aistudio/annie-spratt-n42ogaQn32o-unsplash_c2e62d5a.jpg',
        unit_price: 18000,
        quantity: 1,
        subtotal: 18000,
      },
      {
        id: 'item-laura-02',
        product_id: 'plato-hondo-chamota',
        product_title: 'Plato Hondo Chamota',
        product_image: '/assets/aistudio/cindy-bartillon-THtfRdrK0nI-unsplash_056b3615.jpg',
        unit_price: 14000,
        quantity: 1,
        subtotal: 14000,
      },
    ],
  },
];

function loadSalesFromStorage() {
  try {
    const raw = localStorage.getItem(SALES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        let updated = false;
        parsed.forEach((sale) => {
          if (Array.isArray(sale.sale_items)) {
            sale.sale_items.forEach((item) => {
              if (item.product_id === 'taza-cafe-terrosa' && item.product_image !== '/assets/aistudio/annie-spratt-n42ogaQn32o-unsplash_c2e62d5a.jpg') {
                item.product_image = '/assets/aistudio/annie-spratt-n42ogaQn32o-unsplash_c2e62d5a.jpg';
                updated = true;
              }
            });
          }
        });
        const hasLaura = parsed.some(
          (s) => (s.customer_email || '').toLowerCase() === 'laura.r@gmail.com'
        );
        if (!hasLaura) {
          parsed.unshift(...SEED_SALES);
          updated = true;
        }
        if (updated) {
          saveSalesToStorage(parsed);
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error al cargar ventas locales:', err);
  }
  saveSalesToStorage(SEED_SALES);
  return [...SEED_SALES];
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

  async cancelSale(saleId, reason = 'Arrepentimiento de compra') {
    const rawId = String(saleId).replace(/^sale-/, '').replace(/^CIN-/, '');
    const code = `ARR-${rawId}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const sale = sales.value.find((s) => s.id === saleId);
    if (sale) {
      sale.status = 'cancelado';
      sale.cancellation_code = code;
      sale.cancelled_at = now;
      sale.cancellation_reason = reason;

      // Devolver stock en ceramicsService
      if (Array.isArray(sale.sale_items)) {
        sale.sale_items.forEach((item) => {
          if (item.product_id) {
            const piece = ceramicsService.getById(item.product_id);
            if (piece) {
              const restoredStock = (piece.stockCount || 0) + (Number(item.quantity) || 1);
              ceramicsService.update(piece.id, {
                stockCount: restoredStock,
                inStock: restoredStock > 0,
              });
            }
          }
        });
      }

      saveSalesToStorage(sales.value);
    }

    // Intentar actualizar en Supabase si existe
    try {
      await supabase
        .from('sales')
        .update({
          status: 'cancelado',
        })
        .eq('id', saleId);
    } catch (err) {
      console.warn('Actualización de cancelación en Supabase falló (actualizado localmente):', err);
    }

    return {
      success: true,
      cancellation_code: code,
      cancelled_at: now,
      sale,
    };
  },
};
