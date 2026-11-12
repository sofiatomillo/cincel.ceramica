import { ref, computed } from 'vue';
import { supabase } from '../utils/supabase';

const user = ref(null);
const profile = ref(null);
const loading = ref(true);

const isAuthModalOpen = ref(false);
const authModalRole = ref('customer');
const authModalRegister = ref(false);

function openAuthModal(role = 'customer', isRegister = false) {
  authModalRole.value = role;
  authModalRegister.value = Boolean(isRegister);
  isAuthModalOpen.value = true;
}

function closeAuthModal() {
  isAuthModalOpen.value = false;
}

const ADMIN_EMAIL = 'sofia.tomillo@gmail.com';

export const CUSTOMER_MOCK_USER = {
  email: 'laura.r@gmail.com',
  password: '123456',
  name: 'Laura Russo',
  phone: '+54 11 4821-9988',
  address: 'Av. Santa Fe 3420, Piso 4 B',
  city: 'CABA',
  postalCode: 'C1425',
};

// Usuario cliente nuevo guardado en Supabase (sin ningún pedido previo)
export const NEW_CUSTOMER_USER = {
  id: 'b560da99-dff3-4b2e-9c05-bd932c8179f5',
  email: 'martin.gomez@gmail.com',
  password: 'Password123!',
  name: 'Martín Gómez',
  phone: '+54 11 5521-8844',
  address: 'Calle Honduras 4820, Palermo',
  city: 'CABA',
  postalCode: 'C1414',
  role: 'customer',
};

// Verificar si el usuario actual es administrador
const isAdmin = computed(() => {
  if (!user.value) return false;
  const emailMatch = user.value.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const roleMatch = profile.value?.role === 'admin';
  return emailMatch || roleMatch;
});

// Verificar si el usuario actual es cliente registrado
const isCustomer = computed(() => {
  return !!user.value && !isAdmin.value;
});

// Obtener o crear perfil en Supabase
async function fetchProfile(userId, userEmail) {
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Advertencia al consultar perfiles en Supabase:', error.message);
    }

    if (data) {
      profile.value = data;
      return data;
    }

    // Si aún no existe perfil en la tabla (o tabla recién creada), crearlo
    const newProfile = {
      id: userId,
      email: userEmail,
      full_name: user.value?.user_metadata?.full_name || user.value?.user_metadata?.name || userEmail.split('@')[0],
      avatar_url: user.value?.user_metadata?.avatar_url || user.value?.user_metadata?.picture || '',
      role: userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'customer',
    };

    const { data: inserted, error: insertErr } = await supabase
      .from('profiles')
      .insert(newProfile)
      .select()
      .maybeSingle();

    if (!insertErr && inserted) {
      profile.value = inserted;
      return inserted;
    }

    profile.value = newProfile;
    return newProfile;
  } catch (err) {
    console.error('Error al sincronizar perfil:', err);
    return null;
  }
}

// Inicializar sesión Supabase
async function initAuth() {
  loading.value = true;
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('Error al obtener sesión de Supabase:', error.message);
    }
    if (session?.user) {
      user.value = session.user;
      await fetchProfile(session.user.id, session.user.email);
    } else {
      // Verificar si hay simulación de admin local guardada
      const localAdmin = localStorage.getItem('cincel_admin_session');
      if (localAdmin) {
        try {
          const parsed = JSON.parse(localAdmin);
          // Si el perfil o usuario tenía "Sofía Martín Tomillo", sanear a "Sofía Tomillo"
          if (parsed?.profile?.full_name?.includes('Martín') || parsed?.user?.user_metadata?.full_name?.includes('Martín')) {
            if (parsed.profile?.full_name) {
              parsed.profile.full_name = parsed.profile.full_name.replace(/Martín\s*/gi, '').trim();
            }
            if (parsed.user?.user_metadata?.full_name) {
              parsed.user.user_metadata.full_name = parsed.user.user_metadata.full_name.replace(/Martín\s*/gi, '').trim();
            }
            if (parsed.user?.user_metadata?.name) {
              parsed.user.user_metadata.name = parsed.user.user_metadata.name.replace(/Martín\s*/gi, '').trim();
            }
            localStorage.setItem('cincel_admin_session', JSON.stringify(parsed));
          }
          user.value = parsed.user;
          profile.value = parsed.profile;
        } catch {
          localStorage.removeItem('cincel_admin_session');
        }
      } else {
        // Verificar si hay sesión de cliente local guardada
        const localCustomer = localStorage.getItem('cincel_customer_session');
        if (localCustomer) {
          try {
            const parsed = JSON.parse(localCustomer);
            user.value = parsed.user;
            profile.value = parsed.profile;
          } catch {
            localStorage.removeItem('cincel_customer_session');
          }
        }
      }
    }
  } catch (err) {
    console.error('Error inicializando autenticación:', err);
  } finally {
    loading.value = false;
  }

  // Suscripción a cambios de estado de auth
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      user.value = session.user;
      await fetchProfile(session.user.id, session.user.email);
      localStorage.removeItem('cincel_admin_session');
      localStorage.removeItem('cincel_customer_session');
    } else if (!localStorage.getItem('cincel_admin_session') && !localStorage.getItem('cincel_customer_session')) {
      user.value = null;
      profile.value = null;
    }
  });
}

// Iniciar sesión con Google OAuth
async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error al iniciar sesión con Google:', err);
    return { success: false, error: err.message };
  }
}

// Iniciar sesión con correo y contraseña
async function signInWithEmail(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  // Caso Laura Russo (Cliente configurada)
  if (cleanEmail === CUSTOMER_MOCK_USER.email.toLowerCase()) {
    if (cleanPassword === CUSTOMER_MOCK_USER.password) {
      return loginAsCustomerMock();
    } else {
      return {
        success: false,
        error: 'Contraseña incorrecta para Laura Russo. La clave es: 123456',
      };
    }
  }

  // Caso Martín Gómez (Cliente registrado en Supabase sin ningún pedido)
  if (cleanEmail === NEW_CUSTOMER_USER.email.toLowerCase()) {
    if (cleanPassword === NEW_CUSTOMER_USER.password || cleanPassword === '123456') {
      return loginAsCustomerUser(NEW_CUSTOMER_USER);
    } else {
      return {
        success: false,
        error: 'Contraseña incorrecta para Martín Gómez. La clave es: Password123! o 123456',
      };
    }
  }

  // Caso Sofia Tomillo (Administrador directo)
  if (cleanEmail === ADMIN_EMAIL.toLowerCase()) {
    return loginAsAdminMock();
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });
    if (!error && data?.user) {
      user.value = data.user;
      await fetchProfile(data.user.id, data.user.email);
      return { success: true, user: data.user };
    }

    // Si Supabase devuelve error (por ejemplo Email not confirmed), consultar si el perfil existe en la tabla profiles de Supabase
    const { data: dbProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (dbProfile) {
      return loginAsCustomerUser(dbProfile);
    }

    if (error) throw error;
  } catch (err) {
    try {
      const { data: fallbackProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (fallbackProfile) {
        return loginAsCustomerUser(fallbackProfile);
      }
    } catch {}

    console.error('Error al iniciar sesión con correo:', err);
    return {
      success: false,
      error: err.message || 'Credenciales incorrectas o usuario no registrado.',
    };
  }
}

// Registro con correo y contraseña
async function signUpWithEmail(email, password, fullName) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
    if (data.user) {
      user.value = data.user;
      await fetchProfile(data.user.id, data.user.email);

      // Desbloquear cupón de bienvenida para usuarios que se registran por primera vez
      try {
        const raw = localStorage.getItem('cincel_earned_welcome_coupons_v1');
        const list = raw ? JSON.parse(raw) : ['laura.r@gmail.com', 'martin.gomez@gmail.com'];
        const cleanEmail = (data.user.email || '').toLowerCase().trim();
        if (cleanEmail && !list.includes(cleanEmail)) {
          list.push(cleanEmail);
          localStorage.setItem('cincel_earned_welcome_coupons_v1', JSON.stringify(list));
        }
        localStorage.setItem(
          'cincel_just_won_coupon',
          JSON.stringify({
            code: 'TALLER10',
            discount: 10,
            email: cleanEmail,
            name: fullName || 'Cliente',
            date: new Date().toISOString(),
          })
        );
      } catch (e) {
        console.warn('Error guardando cupón de bienvenida ganado:', e);
      }
    }
    return { success: true, user: data.user, justWonCoupon: true };
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    return { success: false, error: err.message };
  }
}

// Acceso directo como Administrador (Sofia.Tomillo@gmail.com) para pruebas en local/desarrollo
function loginAsAdminMock() {
  const adminUser = {
    id: 'admin-sofia-tomillo',
    email: ADMIN_EMAIL,
    user_metadata: {
      full_name: 'Sofía Tomillo',
      name: 'Sofía Tomillo',
      avatar_url: '',
    },
  };
  const adminProfile = {
    id: 'admin-sofia-tomillo',
    email: ADMIN_EMAIL,
    full_name: 'Sofía Tomillo',
    avatar_url: '',
    role: 'admin',
  };
  user.value = adminUser;
  profile.value = adminProfile;
  localStorage.setItem('cincel_admin_session', JSON.stringify({ user: adminUser, profile: adminProfile }));
  localStorage.removeItem('cincel_customer_session');
  return { success: true, user: adminUser };
}

// Acceso directo como Cliente (Laura Russo - laura.r@gmail.com)
function loginAsCustomerMock() {
  const customerUser = {
    id: 'customer-laura-russo',
    email: CUSTOMER_MOCK_USER.email,
    user_metadata: {
      full_name: CUSTOMER_MOCK_USER.name,
      name: CUSTOMER_MOCK_USER.name,
      avatar_url: '',
      phone: CUSTOMER_MOCK_USER.phone,
      address: CUSTOMER_MOCK_USER.address,
      city: CUSTOMER_MOCK_USER.city,
      postalCode: CUSTOMER_MOCK_USER.postalCode,
    },
  };
  const customerProfile = {
    id: 'customer-laura-russo',
    email: CUSTOMER_MOCK_USER.email,
    full_name: CUSTOMER_MOCK_USER.name,
    avatar_url: '',
    role: 'customer',
    phone: CUSTOMER_MOCK_USER.phone,
    address: CUSTOMER_MOCK_USER.address,
    city: CUSTOMER_MOCK_USER.city,
    postalCode: CUSTOMER_MOCK_USER.postalCode,
  };
  user.value = customerUser;
  profile.value = customerProfile;
  localStorage.setItem('cincel_customer_session', JSON.stringify({ user: customerUser, profile: customerProfile }));
  localStorage.removeItem('cincel_admin_session');
  return { success: true, user: customerUser };
}

// Acceso con perfil de cliente guardado en Supabase (ej. Martín Gómez)
function loginAsCustomerUser(profileData) {
  const customerUser = {
    id: profileData.id,
    email: profileData.email,
    user_metadata: {
      full_name: profileData.full_name || profileData.name || profileData.email?.split('@')[0],
      name: profileData.full_name || profileData.name || profileData.email?.split('@')[0],
      avatar_url: profileData.avatar_url || '',
      phone: profileData.phone || '',
      address: profileData.address || '',
      city: profileData.city || '',
      postalCode: profileData.postalCode || '',
    },
  };
  const customerProfile = {
    id: profileData.id,
    email: profileData.email,
    full_name: profileData.full_name || profileData.name || profileData.email?.split('@')[0],
    avatar_url: profileData.avatar_url || '',
    role: profileData.role || 'customer',
    phone: profileData.phone || '',
    address: profileData.address || '',
    city: profileData.city || '',
    postalCode: profileData.postalCode || '',
  };
  user.value = customerUser;
  profile.value = customerProfile;
  localStorage.setItem('cincel_customer_session', JSON.stringify({ user: customerUser, profile: customerProfile }));
  localStorage.removeItem('cincel_admin_session');
  return { success: true, user: customerUser };
}

// Cerrar sesión
async function signOut() {
  try {
    localStorage.removeItem('cincel_admin_session');
    localStorage.removeItem('cincel_customer_session');
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Advertencia al cerrar sesión en Supabase:', err);
  } finally {
    user.value = null;
    profile.value = null;
  }
}

// Inicializar al importar
initAuth();

export const authService = {
  user,
  profile,
  loading,
  isAdmin,
  isCustomer,
  isAuthModalOpen,
  authModalRole,
  authModalRegister,
  openAuthModal,
  closeAuthModal,
  ADMIN_EMAIL,
  CUSTOMER_MOCK_USER,
  NEW_CUSTOMER_USER,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  loginAsAdminMock,
  loginAsCustomerMock,
  loginAsCustomerUser,
  signOut,
};
