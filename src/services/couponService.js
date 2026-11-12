import { ref, computed } from 'vue';
import { authService } from './authService';

const STORAGE_KEY = 'cincel_earned_welcome_coupons_v1';
export const WELCOME_COUPON_CODE = 'TALLER10';
export const WELCOME_DISCOUNT_PERCENT = 10;

function loadEarnedCoupons() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error al cargar cupones de bienvenida:', e);
  }
  // Por defecto, usuarios creados en el sistema como Laura Russo o Martín Gómez ya lo tienen habilitado
  return ['laura.r@gmail.com', 'martin.gomez@gmail.com'];
}

function saveEarnedCoupons(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error al guardar cupones de bienvenida:', e);
  }
}

const earnedList = ref(loadEarnedCoupons());
const appliedCoupon = ref(null);
const justWonWelcomeCoupon = ref(null);

const isWelcomeCouponUnlocked = computed(() => {
  const currentEmail = (authService.user.value?.email || '').toLowerCase().trim();
  if (!currentEmail) return false;
  // Si está logueado como cliente y está en la lista de ganadores o se registró
  return earnedList.value.includes(currentEmail) || authService.isCustomer.value;
});

export const couponService = {
  WELCOME_COUPON_CODE,
  WELCOME_DISCOUNT_PERCENT,
  appliedCoupon,
  justWonWelcomeCoupon,
  isWelcomeCouponUnlocked,

  awardWelcomeCoupon(email, fullName = '') {
    const clean = (email || '').toLowerCase().trim();
    if (clean && !earnedList.value.includes(clean)) {
      earnedList.value.push(clean);
      saveEarnedCoupons(earnedList.value);
    }
    justWonWelcomeCoupon.value = {
      code: WELCOME_COUPON_CODE,
      discount: WELCOME_DISCOUNT_PERCENT,
      email: clean,
      name: fullName || 'Cliente',
      date: new Date().toISOString(),
    };
  },

  dismissWonModal() {
    justWonWelcomeCoupon.value = null;
  },

  applyCoupon(code) {
    const clean = (code || '').toUpperCase().trim();
    if (clean === WELCOME_COUPON_CODE) {
      if (!authService.user.value) {
        return {
          success: false,
          error: 'El cupón TALLER10 se otorga a quienes se registran por primera vez. ¡Crea tu cuenta gratis para usarlo!',
          requireRegister: true,
        };
      }
      appliedCoupon.value = WELCOME_COUPON_CODE;
      return {
        success: true,
        discountPercent: WELCOME_DISCOUNT_PERCENT,
        message: '¡Cupón TALLER10 aplicado! 10% de descuento en tus piezas.',
      };
    }

    return {
      success: false,
      error: 'Cupón no reconocido o no disponible.',
    };
  },

  removeCoupon() {
    appliedCoupon.value = null;
  },

  calculateDiscount(subtotal) {
    if (appliedCoupon.value === WELCOME_COUPON_CODE) {
      return Math.round((subtotal * WELCOME_DISCOUNT_PERCENT) / 100);
    }
    return 0;
  },
};
