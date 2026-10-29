import { ref } from 'vue';
import { INITIAL_CERAMIC_PIECES } from '../data/ceramicsData';
import { supabase } from '../utils/supabase';

const STORAGE_KEY = 'cincel_ceramics_db_v9';

export function formatARS(num) {
  const val = Math.round(Number(num) || 0);
  return `$ ${val.toLocaleString('es-AR')}`;
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let updated = false;
        parsed.forEach((p) => {
          if (p.id === 'jarron-boceto-mediterraneo' && p.fileName !== 'cindy-bartillon-THtfRdrK0nI-unsplash_056b3615.jpg') {
            p.fileName = 'cindy-bartillon-THtfRdrK0nI-unsplash_056b3615.jpg';
            p.imageSrc = '/assets/aistudio/cindy-bartillon-THtfRdrK0nI-unsplash_056b3615.jpg';
            updated = true;
          }
          if (p.id === 'plato-hondo-botanico' && p.fileName !== 'tom-crew-YA2E3d7a9Wo-unsplash_dd7ed7a8.jpg') {
            p.fileName = 'tom-crew-YA2E3d7a9Wo-unsplash_dd7ed7a8.jpg';
            p.imageSrc = '/assets/aistudio/tom-crew-YA2E3d7a9Wo-unsplash_dd7ed7a8.jpg';
            updated = true;
          }
          if (p.id === 'joyero-minimalista-marfil' && p.fileName !== 'evelyn-verdin-2iIEfns94pE-unsplash_bf29834f.jpg') {
            p.fileName = 'evelyn-verdin-2iIEfns94pE-unsplash_bf29834f.jpg';
            p.imageSrc = '/assets/aistudio/evelyn-verdin-2iIEfns94pE-unsplash_bf29834f.jpg';
            updated = true;
          }
          if (p.category === 'vajilla' || p.categoryLabel === 'VAJILLA' || p.categoryLabel === 'Vajilla') {
            p.category = 'vasijas';
            p.categoryLabel = 'VASIJA';
            updated = true;
          }
          if (p.id === 'vasija-oriental-dinastia') {
            if (p.category !== 'vasijas' || p.categoryLabel !== 'VASIJA') {
              p.category = 'vasijas';
              p.categoryLabel = 'VASIJA';
              updated = true;
            }
          }
        });
        if (updated) {
          saveToStorage(parsed);
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error al leer de localStorage:', err);
  }
  // Semilla inicial
  saveToStorage(INITIAL_CERAMIC_PIECES);
  return [...INITIAL_CERAMIC_PIECES];
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error al guardar en localStorage:', err);
  }
}

// Estado reactivo global de piezas
const pieces = ref(loadFromStorage());
const isSupabaseSynced = ref(false);

// Intentar sincronizar productos desde Supabase
async function syncFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      // Normalizar campos de Supabase a la estructura de la aplicación
      const mapped = data.map((item) => ({
        id: item.id,
        category: item.category,
        categoryLabel: item.category_label || item.category.toUpperCase(),
        title: item.title,
        description: item.description,
        longDescription: item.long_description || item.description,
        fileName: item.file_name,
        imageSrc: item.image_src,
        price: item.price || formatARS(item.price_number),
        priceNumber: Number(item.price_number || 0),
        dimensions: item.dimensions || '',
        material: item.material || '',
        glaze: item.glaze || '',
        careGuide: item.care_guide || '',
        inStock: Boolean(item.in_stock),
        stockCount: Number(item.stock_count || 0),
        isPopular: Boolean(item.is_popular),
        createdAt: item.created_at,
      }));

      pieces.value = mapped;
      saveToStorage(mapped);
      isSupabaseSynced.value = true;
    }
  } catch (err) {
    console.warn('Supabase products fetch pendiente (usando base local):', err);
  }
}

// Iniciar sincronización de Supabase en segundo plano
syncFromSupabase();

export const ceramicsService = {
  pieces,
  isSupabaseSynced,
  syncFromSupabase,

  getAll() {
    return pieces.value;
  },

  getById(id) {
    return pieces.value.find((p) => p.id === id) || null;
  },

  async create(newPieceData) {
    const titleSlug = (newPieceData.title || 'pieza')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const generatedId = `${titleSlug}-${Date.now().toString(36)}`;
    const numericPrice = Number(newPieceData.priceNumber || 0);

    const piece = {
      ...newPieceData,
      id: generatedId,
      price: formatARS(numericPrice),
      priceNumber: numericPrice,
      stockCount: Number(newPieceData.stockCount || 1),
      inStock: Number(newPieceData.stockCount || 1) > 0,
      createdAt: new Date().toISOString(),
      fileName: newPieceData.fileName || 'jarron__4__f484adc2.jpg',
      imageSrc: newPieceData.imageSrc || '/assets/aistudio/jarron__4__f484adc2.jpg',
    };

    pieces.value.unshift(piece);
    saveToStorage(pieces.value);

    // Guardar en Supabase si está disponible
    try {
      await supabase.from('products').insert({
        id: piece.id,
        category: piece.category,
        category_label: piece.categoryLabel,
        title: piece.title,
        description: piece.description,
        long_description: piece.longDescription,
        file_name: piece.fileName,
        image_src: piece.imageSrc,
        price: piece.price,
        price_number: piece.priceNumber,
        dimensions: piece.dimensions,
        material: piece.material,
        glaze: piece.glaze,
        care_guide: piece.careGuide,
        in_stock: piece.inStock,
        stock_count: piece.stockCount,
        is_popular: Boolean(piece.isPopular),
        created_at: piece.createdAt,
      });
    } catch (err) {
      console.warn('Producto guardado localmente. Supabase pendiente:', err);
    }

    return piece;
  },

  async update(id, updatedFields) {
    const index = pieces.value.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const existing = pieces.value[index];
    const numericPrice = Number(updatedFields.priceNumber ?? existing.priceNumber);
    const updated = {
      ...existing,
      ...updatedFields,
      id: existing.id,
      createdAt: existing.createdAt,
      price: formatARS(numericPrice),
      priceNumber: numericPrice,
      stockCount: Number(updatedFields.stockCount ?? existing.stockCount),
      inStock: Number(updatedFields.stockCount ?? existing.stockCount) > 0,
    };

    pieces.value[index] = updated;
    saveToStorage(pieces.value);

    // Actualizar en Supabase si está disponible
    try {
      await supabase
        .from('products')
        .update({
          category: updated.category,
          category_label: updated.categoryLabel,
          title: updated.title,
          description: updated.description,
          long_description: updated.longDescription,
          file_name: updated.fileName,
          image_src: updated.imageSrc,
          price: updated.price,
          price_number: updated.priceNumber,
          dimensions: updated.dimensions,
          material: updated.material,
          glaze: updated.glaze,
          care_guide: updated.careGuide,
          in_stock: updated.inStock,
          stock_count: updated.stockCount,
          is_popular: Boolean(updated.isPopular),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    } catch (err) {
      console.warn('Producto actualizado localmente. Supabase pendiente:', err);
    }

    return updated;
  },

  async delete(id) {
    const beforeCount = pieces.value.length;
    pieces.value = pieces.value.filter((p) => p.id !== id);
    saveToStorage(pieces.value);

    // Eliminar en Supabase si está disponible
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (err) {
      console.warn('Producto eliminado localmente. Supabase pendiente:', err);
    }

    return pieces.value.length < beforeCount;
  },

  resetToDefaults() {
    pieces.value = [...INITIAL_CERAMIC_PIECES];
    saveToStorage(INITIAL_CERAMIC_PIECES);
    return pieces.value;
  },
};
