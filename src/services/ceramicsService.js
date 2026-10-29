import { ref } from 'vue';
import { INITIAL_CERAMIC_PIECES } from '../data/ceramicsData';

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
        // Asegurar que si hay registros antiguos en euros, se migren a pesos
        const hasEuros = parsed.some((p) => (p.price && p.price.includes('€')) || (p.priceNumber && p.priceNumber < 1000));
        if (!hasEuros) {
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
    }
  } catch (err) {
    console.error('Error al leer de localStorage:', err);
  }
  // Semilla inicial con los 16 elementos en pesos argentinos y fotos actualizadas
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

export const ceramicsService = {
  pieces,

  getAll() {
    return pieces.value;
  },

  getById(id) {
    return pieces.value.find((p) => p.id === id) || null;
  },

  create(newPieceData) {
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
    return piece;
  },

  update(id, updatedFields) {
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
    return updated;
  },

  delete(id) {
    const beforeCount = pieces.value.length;
    pieces.value = pieces.value.filter((p) => p.id !== id);
    saveToStorage(pieces.value);
    return pieces.value.length < beforeCount;
  },

  resetToDefaults() {
    pieces.value = [...INITIAL_CERAMIC_PIECES];
    saveToStorage(INITIAL_CERAMIC_PIECES);
    return pieces.value;
  },
};
