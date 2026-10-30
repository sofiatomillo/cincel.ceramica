import { ref, computed } from 'vue';
import { supabase } from '../utils/supabase';

const user = ref(null);
const profile = ref(null);
const loading = ref(true);

const ADMIN_EMAIL = 'sofia.tomillo@gmail.com';

// Verificar si el usuario actual es administrador
const isAdmin = computed(() => {
  if (!user.value) return false;
  const emailMatch = user.value.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const roleMatch = profile.value?.role === 'admin';
  return emailMatch || roleMatch;
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
    } else if (!localStorage.getItem('cincel_admin_session')) {
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
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    user.value = data.user;
    await fetchProfile(data.user.id, data.user.email);
    return { success: true, user: data.user };
  } catch (err) {
    console.error('Error al iniciar sesión con correo:', err);
    return { success: false, error: err.message };
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
    }
    return { success: true, user: data.user };
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
  return { success: true };
}

// Cerrar sesión
async function signOut() {
  try {
    localStorage.removeItem('cincel_admin_session');
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
  ADMIN_EMAIL,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  loginAsAdminMock,
  signOut,
};
