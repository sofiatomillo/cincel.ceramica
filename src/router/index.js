import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import CatalogView from '../views/CatalogView.vue';
import DetailView from '../views/DetailView.vue';
import PieceFormView from '../views/PieceFormView.vue';
import AboutView from '../views/AboutView.vue';
import SalesView from '../views/SalesView.vue';
import { authService } from '../services/authService';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/catalogo',
    name: 'Catalog',
    component: CatalogView,
  },
  {
    path: '/piezas/:id',
    name: 'Detail',
    component: DetailView,
    props: true,
  },
  {
    path: '/piezas/nueva',
    name: 'CreatePiece',
    component: PieceFormView,
  },
  {
    path: '/piezas/editar/:id',
    name: 'EditPiece',
    component: PieceFormView,
    props: true,
  },
  {
    path: '/acerca-de',
    name: 'About',
    component: AboutView,
  },
  {
    path: '/ventas',
    name: 'Sales',
    component: SalesView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    if (to.hash) {
      return new Promise((resolve) => {
        setTimeout(() => {
          try {
            const id = to.hash.replace('#', '');
            const el = document.getElementById(id) || document.querySelector(to.hash);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
              resolve(false);
              return;
            }
          } catch (e) {
            console.warn('Error resolviendo hash de scroll:', e);
          }
          resolve({ top: 0, behavior: 'smooth' });
        }, 150);
      });
    }
    return { top: 0, behavior: 'smooth' };
  },
});

// Guardia de navegación: Proteger rutas exclusivas de administración
router.beforeEach((to, from, next) => {
  const adminRoutes = ['CreatePiece', 'EditPiece', 'Sales'];
  if (adminRoutes.includes(to.name)) {
    // Si la autenticación aún está cargando o es admin, permitir; sino redirigir al catálogo
    if (!authService.isAdmin.value) {
      next({ path: '/catalogo' });
      return;
    }
  }
  next();
});

export default router;
