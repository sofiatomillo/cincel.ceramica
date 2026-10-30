<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 min-h-screen"
        @click.self="$emit('close')"
      >
        <div class="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl border border-[#E6DFD5] relative flex flex-col max-h-[92vh] m-auto animate-scale-in z-[10000]">
        <!-- Cabecera -->
        <div class="flex items-start justify-between pb-3 border-b border-[#E6DFD5]">
          <div>
            <div class="inline-flex items-center gap-2 mb-1">
              <span class="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
              <span class="text-xs font-semibold uppercase tracking-wider text-[#2E7D32]">
                EXPORT SQL PARA SUPABASE
              </span>
            </div>
            <h2 class="font-serif text-xl sm:text-2xl font-semibold text-[#1E1B18]">
              Script SQL de Base de Datos y Políticas RLS
            </h2>
            <p class="text-xs text-[#6B655D] mt-0.5">
              Copia este script y pégalo en el <strong>SQL Editor</strong> de tu proyecto Supabase (<code>https://nlytouuurttlpcrjzbty.supabase.co</code>) para crear las tablas de <code>profiles</code>, <code>products</code>, <code>sales</code> y <code>sale_items</code>.
            </p>
          </div>

          <button
            @click="$emit('close')"
            class="p-2 text-[#8D857B] hover:text-[#1E1B18] rounded-xl hover:bg-[#FAF7F2] transition-colors cursor-pointer shrink-0 ml-3"
            aria-label="Cerrar modal"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Instrucciones Rápidas -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-3">
          <div class="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E6DFD5] text-xs">
            <strong class="block text-[#1E1B18] mb-0.5">1. Copiar SQL</strong>
            <span class="text-[#6B655D]">Presiona el botón "Copiar SQL" a continuación.</span>
          </div>
          <div class="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E6DFD5] text-xs">
            <strong class="block text-[#1E1B18] mb-0.5">2. Abrir Supabase</strong>
            <span class="text-[#6B655D]">Ve a tu panel de Supabase → <strong>SQL Editor</strong> → <em>New Query</em>.</span>
          </div>
          <div class="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E6DFD5] text-xs">
            <strong class="block text-[#1E1B18] mb-0.5">3. Ejecutar (Run)</strong>
            <span class="text-[#6B655D]">Pega el código y pulsa <strong>Run</strong>. ¡Todo listo!</span>
          </div>
        </div>

        <!-- Visor de Código SQL -->
        <div class="flex-1 overflow-hidden flex flex-col bg-[#1E1B18] rounded-2xl border border-white/10 text-white my-2">
          <div class="px-4 py-2.5 bg-black/30 border-b border-white/10 flex items-center justify-between text-xs">
            <span class="font-mono text-[11px] text-[#A69E93]">supabase_schema.sql · PostgreSQL</span>
            <div class="flex items-center gap-2">
              <button
                @click="copySql"
                class="px-3 py-1 bg-[#F28482] hover:bg-[#E06F6D] text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Check v-if="copied" class="w-3.5 h-3.5" />
                <Copy v-else class="w-3.5 h-3.5" />
                <span>{{ copied ? '¡Copiado!' : 'Copiar SQL' }}</span>
              </button>

              <button
                @click="downloadSql"
                class="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download class="w-3.5 h-3.5" />
                <span>Descargar .sql</span>
              </button>
            </div>
          </div>

          <pre class="flex-1 p-4 overflow-y-auto text-xs font-mono leading-relaxed text-[#D5CDC2] select-all whitespace-pre-wrap">{{ sqlContent }}</pre>
        </div>

        <!-- Pie del modal -->
        <div class="pt-4 flex items-center justify-between border-t border-[#E6DFD5]">
          <span class="text-[11px] text-[#8D857B]">
            Incluye 16 piezas en pesos argentinos ($ ARS), triggers de Google Auth y reglas para Sofia.Tomillo@gmail.com
          </span>
          <button
            @click="$emit('close')"
            class="px-5 py-2.5 bg-[#1E1B18] text-white text-xs font-semibold rounded-xl hover:bg-[#38342E] transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  </Transition>
  </Teleport>
</template>

<script>
import { X, Copy, Check, Download } from 'lucide-vue-next';

export default {
  name: 'SqlExportModal',
  components: {
    X,
    Copy,
    Check,
    Download,
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close'],
  data() {
    return {
      copied: false,
      sqlContent: `-- ==============================================================================
-- CINCEL CERÁMICA - ESQUEMA SQL PARA SUPABASE (PostgreSQL + RLS + Triggers)
-- ==============================================================================
-- Proyecto: https://nlytouuurttlpcrjzbty.supabase.co
-- Administrador: Sofia.Tomillo@gmail.com
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABLA DE PERFILES (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. TABLA DE PRODUCTOS (products)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  category_label TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  file_name TEXT NOT NULL,
  image_src TEXT NOT NULL,
  price TEXT NOT NULL,
  price_number NUMERIC NOT NULL DEFAULT 0,
  dimensions TEXT,
  material TEXT,
  glaze TEXT,
  care_guide TEXT,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  stock_count INTEGER NOT NULL DEFAULT 5,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABLA DE VENTAS / PEDIDOS (sales)
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completado' CHECK (status IN ('pendiente', 'completado', 'cancelado', 'en_envio')),
  payment_method TEXT DEFAULT 'transferencia_o_tarjeta',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABLA DE DETALLES DE VENTA (sale_items)
CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL,
  product_image TEXT,
  unit_price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. FUNCIÓN VERIFICADORA DE ADMINISTRADOR
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT (role = 'admin') FROM public.profiles WHERE id = auth.uid()),
    (auth.jwt() ->> 'email' = 'Sofia.Tomillo@gmail.com'),
    false
  );
$$;

-- 6. TRIGGER PARA CREACIÓN AUTOMÁTICA DE PERFIL (Google Auth / Email)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT := 'customer';
BEGIN
  IF NEW.email = 'Sofia.Tomillo@gmail.com' THEN
    v_role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    v_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    role = CASE WHEN EXCLUDED.email = 'Sofia.Tomillo@gmail.com' THEN 'admin' ELSE public.profiles.role END,
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. POLÍTICAS ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfiles visibles para todos" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Usuarios editan su perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Insertar perfiles" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "Catalogo publico" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins crean productos" ON public.products FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins editan productos" ON public.products FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins eliminan productos" ON public.products FOR DELETE USING (public.is_admin());

CREATE POLICY "Clientes ven sus compras y admins ven todas" ON public.sales FOR SELECT USING (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "Permitir compras" ON public.sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins actualizan ventas" ON public.sales FOR UPDATE USING (public.is_admin());

CREATE POLICY "Items visibles por cliente y admin" ON public.sale_items FOR SELECT USING (
  public.is_admin() OR EXISTS (SELECT 1 FROM public.sales WHERE public.sales.id = public.sale_items.sale_id AND public.sales.user_id = auth.uid())
);
CREATE POLICY "Permitir insertar items" ON public.sale_items FOR INSERT WITH CHECK (true);

-- 8. PRODUCTOS INICIALES (16 piezas en Pesos Argentinos)
INSERT INTO public.products (
  id, category, category_label, title, description, long_description,
  file_name, image_src, price, price_number, dimensions, material,
  glaze, care_guide, in_stock, stock_count, is_popular, created_at
) VALUES
('jarron-escultorico-arena', 'jarrones', 'JARRONES', 'Jarrón Escultórico Arena', 'Jarrón de gres con acabado texturado en tonos arena cálida y silueta orgánica modelada en torno.', 'Pieza única moldeada a mano con gres chamotado de alta temperatura.', 'jarron__4__f484adc2.jpg', '/assets/aistudio/jarron__4__f484adc2.jpg', '$ 58.000', 58000, '32 cm alto × 16 cm diámetro máximo', 'Gres chamotado cocido a 1260 °C', 'Esmalte mate arena con textura micro-porosa', 'Limpiar suavemente con un paño húmedo.', true, 4, true, '2026-10-20T10:00:00Z'),
('plato-moteado-cuarzo', 'platos', 'PLATOS', 'Plato Llano Moteado de Cuarzo', 'Plato llano artesanal con motas naturales de hierro y ala ligeramente levantada.', 'Diseñado para vestir mesas de alta cocina o uso diario elegante.', 'plato__5__8b9b7d4c.jpg', '/assets/aistudio/plato__5__8b9b7d4c.jpg', '$ 28.000', 28000, '27 cm diámetro × 2,2 cm altura', 'Gres ferruginoso vitrificado', 'Esmalte satinado blanco seda', 'Apto para lavavajillas y microondas.', true, 12, true, '2026-10-19T14:30:00Z'),
('centro-decorativo-gres', 'decoracion', 'DECORACIÓN', 'Centro Decorativo Ondulado', 'Pieza escultórica central con bordes orgánicos inspirados en el oleaje marino.', 'Esculpido mediante técnicas combinadas de pellizco y plancha.', 'decoracion__3__01659f07.jpg', '/assets/aistudio/decoracion__3__01659f07.jpg', '$ 72.000', 72000, '29 cm largo × 24 cm ancho × 9 cm alto', 'Gres blanco fino de alta densidad', 'Engobe natural con esmalte mate artesanal', 'Limpiar con plumero o paño seco.', true, 3, true, '2026-10-18T09:15:00Z'),
('joyero-tapa-artesanal', 'joyeros', 'JOYEROS', 'Joyero con Tapa Artesanal', 'Recipiente cilíndrico con tapa encajada y tirador orgánico, ideal para joyas.', 'Torneado con precisión milimétrica para un cierre suave.', 'joyero_01a29807.jpg', '/assets/aistudio/joyero_01a29807.jpg', '$ 34.000', 34000, '11 cm diámetro × 8 cm altura total', 'Gres porcelánico refractario', 'Esmalte blanco tiza e interior vitrificado', 'Lavar con agua templada y paño suave.', true, 6, true, '2026-10-17T11:00:00Z'),
('cenicero-geometrico-marfil', 'ceniceros', 'CENICEROS', 'Cenicero Geométrico Marfil', 'Cenicero de base sólida y ranuras precisas de apoyo en tono marfil.', 'Modelado con paredes gruesas que aportan estabilidad y resistencia al calor.', 'cenicero__1__e8f54514.jpg', '/assets/aistudio/cenicero__1__e8f54514.jpg', '$ 22.000', 22000, '13 cm diámetro × 3,5 cm altura', 'Gres refractario de alta resistencia térmica', 'Esmalte satinado impermeable resistente a ceniza', 'Apto para lavavajillas.', true, 8, false, '2026-10-16T16:45:00Z'),
('cenicero-rustico-organico', 'ceniceros', 'CENICEROS', 'Cenicero Rústico Borde Orgánico', 'Pieza modelada por pellizco con perímetro irregular y hendiduras a mano.', 'Un homenaje a las técnicas arcaicas de modelado.', 'cenicero__2__be55122e.jpg', '/assets/aistudio/cenicero__2__be55122e.jpg', '$ 24.000', 24000, '14 cm ancho × 12 cm fondo × 4 cm alto', 'Gres chamotado grano medio', 'Esmalte ceniza vegetal', 'Lavar a mano con esponja suave.', true, 5, false, '2026-10-15T13:20:00Z'),
('totem-escultorico-barro', 'decoracion', 'DECORACIÓN', 'Tótem Escultórico de Barro', 'Objeto de arte decorativo compuesto por volúmenes apilados en equilibrio.', 'Pieza concebida como escultura de interior.', 'decoracion__4__26b0421d.jpg', '/assets/aistudio/decoracion__4__26b0421d.jpg', '$ 85.000', 85000, '38 cm alto × 14 cm base', 'Gres tostado cocido con llama directa', 'Pátina mineral cruda sin esmaltar', 'Limpiar en seco.', true, 2, false, '2026-10-14T17:10:00Z'),
('jarron-lineas-altas-cincel', 'jarrones', 'JARRONES', 'Jarrón Botella Líneas Altas', 'Jarrón estilizado de cuello esbelto y hombro marcado, con acabado mate sedoso.', 'Torneado con gres blanco de grano extrafino.', 'jarron__1__755d8979.jpg', '/assets/aistudio/jarron__1__755d8979.jpg', '$ 54.000', 54000, '34 cm alto × 12 cm diámetro', 'Gres blanco de alta temperatura', 'Esmalte tiza mate formulado en taller', 'Apto para agua con flores frescas o secas.', true, 5, true, '2026-10-13T08:30:00Z'),
('pieza-decorativa-texturada', 'decoracion', 'DECORACIÓN', 'Pieza Decorativa Texturada', 'Elemento escultórico con acanaladuras longitudinales tradicionales.', 'El juego entre luces y sombras sobre los surcos resalta la destreza del artesano.', 'decoracion__2__623e7191.jpg', '/assets/aistudio/decoracion__2__623e7191.jpg', '$ 62.000', 62000, '22 cm alto × 18 cm diámetro', 'Gres ferruginoso natural', 'Esmalte satinado tiza', 'Limpiar con paño ligeramente humedecido.', true, 3, false, '2026-10-12T12:00:00Z'),
('cenicero-esculpido-terracota', 'ceniceros', 'CENICEROS', 'Cenicero Esculpido Terracota', 'Cenicero compacto de tono barro cálido y hendidura doble para cigarrillos.', 'Fabricado con gres rico en óxidos de hierro.', 'cenicero_cebc1b7e.jpg', '/assets/aistudio/cenicero_cebc1b7e.jpg', '$ 20.000', 20000, '11,5 cm diámetro × 3 cm altura', 'Gres refractario terracota', 'Sellado cerámico no poroso de alta temperatura', 'Apto para lavavajillas.', true, 9, false, '2026-10-11T15:20:00Z'),
('vasija-oriental-dinastia', 'vasijas', 'VASIJA', 'Vasija Ceremonial Dinastía', 'Pieza tradicional con motivos botánicos en azul cobalto.', 'Una obra maestra de alfarería y pintura botánica a mano alzada.', 'cuong-duyen-ceramics-ZBG9u5KF0Wk-unsplash_321a2a38.jpg', '/assets/aistudio/cuong-duyen-ceramics-ZBG9u5KF0Wk-unsplash_321a2a38.jpg', '$ 95.000', 95000, '26 cm diámetro × 19 cm alto (2,2 L)', 'Porcelana gresificada', 'Pigmentos cobalto bajo cubierta', 'Lavar a mano suavemente.', true, 2, true, '2026-10-10T19:00:00Z'),
('escultura-organica-mesa', 'decoracion', 'DECORACIÓN', 'Escultura Orgánica de Mesa', 'Volumen curvilíneo continuo con orificio central que enmarca la luz.', 'Modelada mediante vaciado y pulido manual.', 'decoracion__1__53301f24.jpg', '/assets/aistudio/decoracion__1__53301f24.jpg', '$ 68.000', 68000, '25 cm alto × 21 cm ancho × 10 cm fondo', 'Gres blanco micro-chamotado', 'Esmalte cáscara de huevo mate sedoso', 'Limpiar con plumero seco.', true, 3, false, '2026-10-09T09:40:00Z'),
('florero-esbelto-blanco', 'jarrones', 'JARRONES', 'Florero Esbelto Blanco Mate', 'Florero de proporciones estilizadas con boca estrecha para una única flor.', 'Pieza minimalista torneada con arcilla refinada.', 'jarron__5__5d25a996.jpg', '/assets/aistudio/jarron__5__5d25a996.jpg', '$ 46.000', 46000, '30 cm alto × 9 cm base', 'Gres blanco cocido a 1260 °C', 'Esmalte blanco tiza mate', 'Limpiar con agua templada.', true, 5, false, '2026-10-08T11:15:00Z'),
('plato-hondo-botanico', 'platos', 'PLATOS', 'Plato Hondo Pasta y Risotto', 'Plato hondo de ala generosa y base texturada para cremas y pastas.', 'Diseñado para realzar presentaciones culinarias.', 'tom-crew-YA2E3d7a9Wo-unsplash_dd7ed7a8.jpg', '/assets/aistudio/tom-crew-YA2E3d7a9Wo-unsplash_dd7ed7a8.jpg', '$ 30.000', 30000, '25 cm diámetro × 5 cm profundidad', 'Gres ferruginoso vitrificado', 'Esmalte satinado libre de plomo', 'Apto para lavavajillas y microondas.', true, 8, false, '2026-10-07T10:05:00Z'),
('joyero-minimalista-marfil', 'joyeros', 'JOYEROS', 'Joyero Minimalista de Mesa', 'Cofre cerámico en forma de corazón con tapa encajada y acabado en gres sedoso.', 'Elaborado artesanalmente en torno con un ajuste preciso entre base y tapa.', 'evelyn-verdin-2iIEfns94pE-unsplash_bf29834f.jpg', '/assets/aistudio/evelyn-verdin-2iIEfns94pE-unsplash_bf29834f.jpg', '$ 36.000', 36000, '12 cm diámetro × 9 cm alto', 'Gres porcelánico refractario', 'Esmalte mate marfil', 'Limpiar con paño suave humedecido.', true, 4, false, '2026-10-06T14:10:00Z'),
('jarron-boceto-mediterraneo', 'jarrones', 'JARRONES', 'Jarrón Solitario Mediterráneo', 'Vasija acanalada de silueta cálida y esmalte satinado tono ámbar.', 'Moldeado en torno con acabado acanalado orgánico.', 'cindy-bartillon-THtfRdrK0nI-unsplash_056b3615.jpg', '/assets/aistudio/cindy-bartillon-THtfRdrK0nI-unsplash_056b3615.jpg', '$ 42.000', 42000, '22 cm alto × 13 cm diámetro', 'Gres chamotado arena', 'Esmalte natural satinado ámbar', 'Lavar a mano suavemente.', true, 7, false, '2026-10-05T18:20:00Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  price_number = EXCLUDED.price_number,
  image_src = EXCLUDED.image_src,
  file_name = EXCLUDED.file_name;`,
    };
  },
  methods: {
    copySql() {
      navigator.clipboard.writeText(this.sqlContent);
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    },
    downloadSql() {
      const blob = new Blob([this.sqlContent], { type: 'text/sql;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'cincel_supabase_schema.sql');
      link.click();
      URL.revokeObjectURL(url);
    },
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
