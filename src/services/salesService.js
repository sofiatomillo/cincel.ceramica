import { ref } from 'vue';
import { supabase } from '../utils/supabase';
import { authService } from './authService';
import { ceramicsService } from './ceramicsService';

const SALES_STORAGE_KEY = 'cincel_sales_v1';

const SEED_SALES = [
  {
    id: 'CIN-892401',
    user_id: 'b560da99-dff3-4b2e-9c05-bd932c8179f5',
    customer_name: 'Martín Gómez',
    customer_email: 'martin.gomez@gmail.com',
    customer_phone: '+54 11 5521-8844',
    shipping_address: 'Calle Honduras 4820, Palermo, CABA (CP C1414)',
    total_amount: 23000,
    status: 'pendiente_confirmacion',
    payment_method: 'mercadopago',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(), // Hace 3 horas
    notes: 'Pedido recepcionado. Pendiente de revisión y confirmación por Sofía Tomillo.',
    sale_items: [
      {
        id: 'item-martin-01',
        product_id: 'vaso-termico-verde-musgo',
        product_title: 'Vaso Cerámico Verde Musgo (Pieza de Camila Torres)',
        product_image: '/assets/aistudio/adam-rasheed-BGEqCc-bQHg-unsplash_e8da9bcc.jpg',
        unit_price: 17500,
        quantity: 1,
        subtotal: 17500,
      },
    ],
  },
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
    confirmed_by: 'Sofía Tomillo',
    confirmed_at: new Date(Date.now() - 86400000).toISOString(),
    notes: 'Pedido confirmado por Sofía Tomillo. Embalaje protegido con plástico burbuja y caja reforzada.',
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
          parsed.unshift(SEED_SALES[1]);
          updated = true;
        }
        const hasMartin = parsed.some(
          (s) => (s.customer_email || '').toLowerCase() === 'martin.gomez@gmail.com'
        );
        if (!hasMartin) {
          parsed.unshift(SEED_SALES[0]);
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
      status: 'pendiente_confirmacion', // Llega a la bandeja de recepción y confirmación del administrador
      payment_method: paymentMethod,
      notes: 'Nuevo pedido recepcionado en tienda online. Pendiente de confirmación por Sofía Tomillo.',
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
          status: 'pendiente_confirmacion',
          payment_method: newSale.payment_method,
          notes: newSale.notes,
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

  // Confirmar pedido por el administrador (Sofía Tomillo) y guardar en Supabase
  async confirmOrder(saleId, options = {}) {
    const adminNotes = options.notes || 'Pedido revisado y confirmado por Sofía Tomillo. Embalaje listo para despacho.';
    const newStatus = options.status || 'confirmado';
    const now = new Date().toISOString();

    const sale = sales.value.find((s) => s.id === saleId);
    if (sale) {
      sale.status = newStatus;
      sale.confirmed_at = now;
      sale.confirmed_by = 'Sofía Tomillo';
      sale.notes = adminNotes;
      sale.supabase_synced = true;
      sale.supabase_last_sync = now;
      saveSalesToStorage(sales.value);
    }

    // Guardar en la base de datos de Supabase (public.sales)
    let dbSuccess = false;
    let dbError = null;
    try {
      const payload = {
        customer_name: sale?.customer_name,
        customer_email: sale?.customer_email,
        customer_phone: sale?.customer_phone,
        shipping_address: sale?.shipping_address,
        total_amount: sale?.total_amount,
        status: newStatus,
        payment_method: sale?.payment_method,
        notes: adminNotes,
      };

      const { data, error } = await supabase
        .from('sales')
        .update(payload)
        .eq('id', saleId)
        .select();

      if (!error && data && data.length > 0) {
        dbSuccess = true;
      } else {
        const { error: insErr } = await supabase
          .from('sales')
          .insert(payload);
        if (!insErr) {
          dbSuccess = true;
        } else {
          dbError = insErr;
        }
      }
    } catch (err) {
      console.warn('Error al guardar confirmación en Supabase:', err);
      dbError = err;
    }

    return {
      success: true,
      sale,
      confirmed_at: now,
      confirmed_by: 'Sofía Tomillo',
      supabase_synced: dbSuccess,
      error: dbError?.message,
    };
  },

  // Actualizar estado del pedido (ej. pasar a "en_camino" / Embalaje y Despacho)
  async updateOrderStatus(saleId, newStatus, extraNotes = '') {
    const now = new Date().toISOString();
    const sale = sales.value.find((s) => s.id === saleId);
    if (sale) {
      sale.status = newStatus;
      if (extraNotes) {
        sale.notes = extraNotes;
      }
      sale.updated_at = now;
      sale.supabase_synced = true;
      saveSalesToStorage(sales.value);
    }

    try {
      await supabase
        .from('sales')
        .update({
          status: newStatus,
          notes: sale?.notes,
        })
        .eq('id', saleId);
    } catch (err) {
      console.warn('Actualización de estado en Supabase pendiente:', err);
    }

    return sale;
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
