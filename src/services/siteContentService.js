import { ref } from 'vue';
import { supabase } from '../utils/supabase';

const STORAGE_KEY = 'cincel_site_content_v2';

export const GALLERY_PRESET_IMAGES = [
  { name: 'Taller y Vasijas (Hero)', url: '/banner.jpg', preview: '/banner.jpg' },
  { name: 'Mesa de Té y Hojas (Servicios)', url: '/banner..jpg', preview: '/banner..jpg' },
  { name: 'Bodegón Sobre Madera (Estudio)', url: '/banner (1).jpg', preview: '/banner (1).jpg' },
  { name: 'Cuenco y Esmalte Natural', url: '/cuenco.jpg', preview: '/cuenco.jpg' },
  { name: 'Jarrón de Cerámica Blanca', url: '/jarron (2).jpg', preview: '/jarron (2).jpg' },
  { name: 'Jarrón Orgánico Terracota', url: '/jarron (3).jpg', preview: '/jarron (3).jpg' },
  { name: 'Plato Rústico Botánico', url: '/plato (1).jpg', preview: '/plato (1).jpg' },
  { name: 'Plato Hondo Esmaltado', url: '/plato (4).jpg', preview: '/plato (4).jpg' },
];

export const DEFAULT_SITE_CONTENT = {
  hero: {
    eyebrow: 'PIEZAS ÚNICAS HECHAS A MANO',
    title: 'Formas simples.\nEspacios con carácter.',
    description:
      'Diseñamos y elaboramos piezas cerámicas contemporáneas con técnicas tradicionales de torno y modelado manual. Cada objeto es una celebración de la textura, el color y la imperfección natural del barro.',
    imageSrc: '/banner.jpg',
    imageAlt: 'Colección de tarros y vasijas de cerámica artesanal Cincel ordenadas por tonalidades',
    buttonCatalogText: 'Ver catálogo completo',
    buttonWorkshopText: 'Conocer el taller',
    stat1Number: '100%',
    stat1Label: 'Torno manual',
    stat2Number: '1260 °C',
    stat2Label: 'Gres vitrificado',
    stat3Number: '0% Plomo',
    stat3Label: 'Apto alimentos',
  },
  services: {
    eyebrow: 'SERVICIOS A MEDIDA',
    title: 'Cerámica pensada para cada ocasión',
    description:
      'Más allá de nuestra colección habitual, ofrecemos un acompañamiento integral para dar vida a piezas que dialogan con tus espacios y momentos cotidianos.',
    imageSrc: '/banner..jpg',
    imageAlt: 'Servicio de mesa artesanal con detalles botánicos pintados a mano',
    imageCaption: 'Servicio de mesa artesanal con detalles botánicos pintados a mano',
    items: [
      {
        id: 'orientacion',
        number: '01',
        title: 'Orientación para elegir',
        description:
          'Te asesoramos para encontrar las piezas que mejor dialogan con la luz, los tonos de madera y la arquitectura de tus espacios.',
        details: 'Asesoría presencial u online · Muestrario de acabados · Paletas personalizadas',
      },
      {
        id: 'mesa',
        number: '02',
        title: 'Selecciones para tu mesa',
        description:
          'Diseñamos composiciones a juego o juegos desparejados armónicos para cenas, eventos y listas de boda personalizadas.',
        details: 'Juegos de 4 a 12 comensales · Grabado de iniciales · Empaque de regalo sostenible',
      },
      {
        id: 'proyectos',
        number: '03',
        title: 'Cerámica para proyectos',
        description:
          'Colaboramos estrechamente con arquitectos, interioristas y restaurantes para producir vajillas exclusivas y piezas de gran formato.',
        details: 'Tiradas a medida · Resistencia hostelería (1260 °C) · Ensayos de laboratorio',
      },
    ],
  },
  empresa: {
    eyebrow: 'SOBRE NOSOTROS',
    title: 'Artesanía contemporánea con alma de barro',
    lead:
      'En Cincel Cerámica creemos en el valor del tiempo lento y la nobleza del trabajo manual. Cada una de nuestras piezas se tornea y esmalta individualmente en nuestro taller.',
    paragraph:
      'Nuestra búsqueda se centra en el equilibrio entre lo utilitario y lo escultórico, creando objetos que acompañan el día a día con serenidad y belleza táctil.',
    imageSrc: '/banner (1).jpg',
    imageAlt: 'Vasijas cerámicas artesanales sobre mesa redonda de madera acanalada',
  },
  aboutPage: {
    eyebrow: 'EL ESTUDIO & NUESTRA FILOSOFÍA',
    title: 'Artesanía contemporánea con alma de barro y tiempo lento',
    description:
      'Fundado en 2020 en Palermo Soho, Cincel Cerámica nació de la necesidad de volver a conectar con lo tangible. Creemos que los objetos cotidianos deben guardar memoria humana, textura y emoción en lugar de perfección industrial en serie.',
    imageSrc: '/banner (1).jpg',
    imageAlt: 'Vasijas de Cincel sobre mesa de madera acanalada',
  },
  footer: {
    brandDescription:
      'Formas simples. Espacios con carácter. Cerámica contemporánea y piezas utilitarias elaboradas a mano en torno artesanal, celebrando la textura natural del barro y la belleza de lo imperfecto.',
    address: 'Gorriti 4825, Palermo Soho · CABA, Argentina',
    contactLine: 'hola@cincelceramica.com.ar · +54 11 4832-6540',
    email: 'hola@cincelceramica.com.ar',
    phone: '+54 11 4832-6540',
    copyright: '© 2026 Cincel Cerámica. Todos los derechos reservados.',
    bottomNote: 'Piezas artesanales horneadas a alta temperatura con esmaltes minerales únicos.',
  },
};

function loadStoredContent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge seguro en caso de propiedades nuevas
      return {
        hero: { ...DEFAULT_SITE_CONTENT.hero, ...(parsed.hero || {}) },
        services: { ...DEFAULT_SITE_CONTENT.services, ...(parsed.services || {}) },
        empresa: { ...DEFAULT_SITE_CONTENT.empresa, ...(parsed.empresa || {}) },
        aboutPage: { ...DEFAULT_SITE_CONTENT.aboutPage, ...(parsed.aboutPage || {}) },
        footer: { ...DEFAULT_SITE_CONTENT.footer, ...(parsed.footer || {}) },
      };
    }
  } catch (e) {
    console.error('Error al cargar contenido de localStorage:', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_SITE_CONTENT));
}

function saveToLocalStorage(content) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  } catch (e) {
    console.error('Error al guardar en localStorage:', e);
  }
}

// Estado reactivo global
const siteContent = ref(loadStoredContent());
const isEditorModalOpen = ref(false);
const activeEditorSection = ref('hero'); // 'hero' | 'services' | 'empresa' | 'aboutPage' | 'footer'

export const siteContentService = {
  content: siteContent,
  isEditorModalOpen,
  activeEditorSection,

  openEditor(section = 'hero') {
    activeEditorSection.value = section;
    isEditorModalOpen.value = true;
  },

  closeEditor() {
    isEditorModalOpen.value = false;
  },

  async updateSection(sectionKey, newSectionData) {
    if (!siteContent.value[sectionKey]) {
      siteContent.value[sectionKey] = {};
    }
    siteContent.value[sectionKey] = {
      ...siteContent.value[sectionKey],
      ...newSectionData,
    };
    saveToLocalStorage(siteContent.value);

    // Intentar sincronizar en Supabase si la tabla existe
    try {
      if (supabase) {
        await supabase
          .from('site_content')
          .upsert({
            section_key: sectionKey,
            data: siteContent.value[sectionKey],
            updated_at: new Date().toISOString(),
          }, { onConflict: 'section_key' });
      }
    } catch (err) {
      // Ignorar si la tabla aún no fue creada en Supabase
    }

    return true;
  },

  async resetSection(sectionKey) {
    if (DEFAULT_SITE_CONTENT[sectionKey]) {
      siteContent.value[sectionKey] = JSON.parse(
        JSON.stringify(DEFAULT_SITE_CONTENT[sectionKey])
      );
      saveToLocalStorage(siteContent.value);

      try {
        if (supabase) {
          await supabase
            .from('site_content')
            .upsert({
              section_key: sectionKey,
              data: siteContent.value[sectionKey],
              updated_at: new Date().toISOString(),
            }, { onConflict: 'section_key' });
        }
      } catch (err) {
        // Fallback silencioso
      }
    }
  },

  async resetAllToDefaults() {
    siteContent.value = JSON.parse(JSON.stringify(DEFAULT_SITE_CONTENT));
    saveToLocalStorage(siteContent.value);

    try {
      if (supabase) {
        for (const key of Object.keys(DEFAULT_SITE_CONTENT)) {
          await supabase
            .from('site_content')
            .upsert({
              section_key: key,
              data: DEFAULT_SITE_CONTENT[key],
              updated_at: new Date().toISOString(),
            }, { onConflict: 'section_key' });
        }
      }
    } catch (err) {
      // Fallback silencioso
    }
  },

  async fetchFromSupabase() {
    try {
      if (!supabase) return;
      const { data, error } = await supabase.from('site_content').select('*');
      if (!error && Array.isArray(data) && data.length > 0) {
        const merged = { ...siteContent.value };
        data.forEach((row) => {
          if (row.section_key && row.data) {
            merged[row.section_key] = {
              ...merged[row.section_key],
              ...row.data,
            };
          }
        });
        siteContent.value = merged;
        saveToLocalStorage(merged);
      }
    } catch (err) {
      // Usar localStorage como source of truth
    }
  },
};

// Cargar datos remotos en background si están disponibles
siteContentService.fetchFromSupabase();
