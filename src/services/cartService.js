import { reactive, computed } from 'vue';

const CART_STORAGE_KEY = 'cincel_cart_v1';

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error cargando carrito:', e);
  }
  return [];
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error('Error guardando carrito:', e);
  }
}

const state = reactive({
  cart: loadCart(),
  isCartOpen: false,
  selectedPiece: null,
  droppedImages: {},
});

export const cartService = {
  state,

  get cart() {
    return state.cart;
  },

  get isCartOpen() {
    return state.isCartOpen;
  },

  set isCartOpen(val) {
    state.isCartOpen = val;
  },

  get selectedPiece() {
    return state.selectedPiece;
  },

  set selectedPiece(piece) {
    state.selectedPiece = piece;
  },

  get droppedImages() {
    return state.droppedImages;
  },

  setDroppedImage(fileName, url) {
    state.droppedImages[fileName.toLowerCase()] = url;
  },

  resolveImage(fileName, defaultSrc) {
    if (fileName && state.droppedImages[fileName.toLowerCase()]) {
      return state.droppedImages[fileName.toLowerCase()];
    }
    return defaultSrc || '/assets/aistudio/jarron__4__f484adc2.jpg';
  },

  addToCart(piece, quantity = 1) {
    const existing = state.cart.find((item) => item.piece.id === piece.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      state.cart.push({ piece, quantity });
    }
    saveCart(state.cart);
    state.isCartOpen = true;
  },

  updateQty(pieceId, delta) {
    const item = state.cart.find((i) => i.piece.id === pieceId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeFromCart(pieceId);
    } else {
      saveCart(state.cart);
    }
  },

  removeFromCart(pieceId) {
    state.cart = state.cart.filter((item) => item.piece.id !== pieceId);
    saveCart(state.cart);
  },

  clearCart() {
    state.cart = [];
    saveCart(state.cart);
  },

  openPieceModal(piece) {
    state.selectedPiece = piece;
  },

  closePieceModal() {
    state.selectedPiece = null;
  },

  totalItems: computed(() =>
    state.cart.reduce((total, item) => total + item.quantity, 0)
  ),

  subtotal: computed(() =>
    state.cart.reduce((total, item) => total + item.piece.priceNumber * item.quantity, 0)
  ),

  formatARS(num) {
    const val = Math.round(Number(num) || 0);
    return `$ ${val.toLocaleString('es-AR')}`;
  },
};
