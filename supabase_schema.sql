-- ==============================================================================
-- CINCEL CERÁMICA - ESQUEMA SQL PARA SUPABASE (PostgreSQL + RLS + Triggers)
-- ==============================================================================
-- Este script crea las tablas de usuarios (profiles), productos (products),
-- ventas (sales) y detalles de venta (sale_items), con Row Level Security (RLS),
-- triggers para sincronizar usuarios de Google Auth / Supabase Auth,
-- y los 16 productos iniciales con precios en pesos argentinos ($ ARS).
-- ==============================================================================

-- 1. EXTENSIONES NECESARIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLA DE PERFILES (profiles)
-- Vinculada directamente con auth.users de Supabase
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. TABLA DE PRODUCTOS (products)
-- Catálogo de piezas de cerámica artesanal
-- ==============================================================================
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

-- ==============================================================================
-- 4. TABLA DE VENTAS / PEDIDOS (sales)
-- Mantiene el historial de compras efectuadas
-- ==============================================================================
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

-- ==============================================================================
-- 5. TABLA DE DETALLES DE VENTA (sale_items)
-- Relación 1:N con la tabla de ventas
-- ==============================================================================
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

-- ==============================================================================
-- 6. FUNCIÓN DE AYUDA: is_admin()
-- Permite verificar de forma segura si el usuario actual es administrador
-- (incluyendo al usuario especificado Sofia.Tomillo@gmail.com)
-- ==============================================================================
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

-- ==============================================================================
-- 7. TRIGGER: CREACIÓN AUTOMÁTICA DE PERFIL AL REGISTRARSE (Google Auth o Email)
-- Asigna rol de administrador automáticamente a Sofia.Tomillo@gmail.com
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT := 'customer';
BEGIN
  -- Si el correo coincide con el administrador, asignar rol admin
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

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- Configuración granular de permisos
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Perfiles visibles para usuarios autenticados o publico"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins o triggers pueden insertar perfiles"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- Políticas para products
CREATE POLICY "Cualquiera puede consultar el catálogo de productos"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Solo administradores pueden crear productos"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Solo administradores pueden editar productos"
  ON public.products FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Solo administradores pueden eliminar productos"
  ON public.products FOR DELETE
  USING (public.is_admin());

-- Políticas para sales (ventas / pedidos)
CREATE POLICY "Clientes ven sus compras y admins ven todas"
  ON public.sales FOR SELECT
  USING (public.is_admin() OR auth.uid() = user_id);

CREATE POLICY "Cualquiera o cliente registrado puede registrar una compra"
  ON public.sales FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Solo admins pueden actualizar estado de ventas"
  ON public.sales FOR UPDATE
  USING (public.is_admin());

-- Políticas para sale_items
CREATE POLICY "Clientes ven items de sus ventas y admins ven todos"
  ON public.sale_items FOR SELECT
  USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.sales
      WHERE public.sales.id = public.sale_items.sale_id
      AND public.sales.user_id = auth.uid()
    )
  );

CREATE POLICY "Cualquiera puede insertar items al comprar"
  ON public.sale_items FOR INSERT
  WITH CHECK (true);

-- ==============================================================================
-- 9. INSERCIÓN DE PRODUCTOS INICIALES (16 piezas en Pesos Argentinos)
-- ==============================================================================
INSERT INTO public.products (
  id, category, category_label, title, description, long_description,
  file_name, image_src, price, price_number, dimensions, material,
  glaze, care_guide, in_stock, stock_count, is_popular, created_at
) VALUES
(
  'jarron-escultorico-arena',
  'jarrones',
  'JARRONES',
  'Jarrón Escultórico Arena',
  'Jarrón de gres con acabado texturado en tonos arena cálida y silueta orgánica modelada en torno.',
  'Pieza única moldeada a mano con gres chamotado de alta temperatura. Su textura mineral evoca la serenidad de los paisajes desérticos, con un cuello estrecho pensado para ramas secas o flores silvestres de tallo largo.',
  'jarron__4__f484adc2.jpg',
  '/assets/aistudio/jarron__4__f484adc2.jpg',
  '$ 58.000',
  58000,
  '32 cm alto × 16 cm diámetro máximo',
  'Gres chamotado cocido a 1260 °C',
  'Esmalte mate arena con textura micro-porosa',
  'Limpiar suavemente con un paño húmedo. No sumergir.',
  true,
  4,
  true,
  '2026-10-20T10:00:00Z'
),
(
  'plato-moteado-cuarzo',
  'platos',
  'PLATOS',
  'Plato Llano Moteado de Cuarzo',
  'Plato llano artesanal con motas naturales de hierro y ala ligeramente levantada para servicio gastronómico.',
  'Diseñado para vestir mesas de alta cocina o uso diario elegante. Cada plato presenta un patrón irrepetible de motas que surgen naturalmente durante la cocción a 1260 °C en atmósfera oxidante.',
  'plato__5__8b9b7d4c.jpg',
  '/assets/aistudio/plato__5__8b9b7d4c.jpg',
  '$ 28.000',
  28000,
  '27 cm diámetro × 2,2 cm altura',
  'Gres ferruginoso vitrificado',
  'Esmalte satinado blanco seda apto para alimentos',
  'Apto para lavavajillas y microondas.',
  true,
  12,
  true,
  '2026-10-19T14:30:00Z'
),
(
  'centro-decorativo-gres',
  'decoracion',
  'DECORACIÓN',
  'Centro Decorativo Ondulado',
  'Pieza escultórica central con bordes orgánicos inspirados en el oleaje marino y tacto aterciopelado.',
  'Esculpido mediante técnicas combinadas de pellizco y plancha. Funciona tanto como pieza contemplativa sobre aparadores o consolas, como centro de mesa para reuniones.',
  'decoracion__3__01659f07.jpg',
  '/assets/aistudio/decoracion__3__01659f07.jpg',
  '$ 72.000',
  72000,
  '29 cm largo × 24 cm ancho × 9 cm alto',
  'Gres blanco fino de alta densidad',
  'Engobe natural con esmalte mate artesanal',
  'Limpiar con plumero o paño seco.',
  true,
  3,
  true,
  '2026-10-18T09:15:00Z'
),
(
  'joyero-tapa-artesanal',
  'joyeros',
  'JOYEROS',
  'Joyero con Tapa Artesanal',
  'Recipiente cilíndrico con tapa encajada y tirador orgánico, ideal para joyas, anillos y tesoros personales.',
  'Torneado con precisión milimétrica para un cierre suave y seguro. La tapa cuenta con un tirador escultórico tallado en húmedo antes del bizcochado.',
  'joyero_01a29807.jpg',
  '/assets/aistudio/joyero_01a29807.jpg',
  '$ 34.000',
  34000,
  '11 cm diámetro × 8 cm altura total',
  'Gres porcelánico refractario',
  'Esmalte blanco tiza e interior vitrificado brillante',
  'Lavar con agua templada y secar con paño suave.',
  true,
  6,
  true,
  '2026-10-17T11:00:00Z'
),
(
  'cenicero-geometrico-marfil',
  'ceniceros',
  'CENICEROS',
  'Cenicero Geométrico Marfil',
  'Cenicero de base sólida y ranuras precisas de apoyo, con acabado mate en tono marfil contemporáneo.',
  'Modelado con paredes gruesas que aportan estabilidad y resistencia al calor. El vidriado cerámico no poroso facilita una limpieza impecable sin absorber olores.',
  'cenicero__1__e8f54514.jpg',
  '/assets/aistudio/cenicero__1__e8f54514.jpg',
  '$ 22.000',
  22000,
  '13 cm diámetro × 3,5 cm altura',
  'Gres refractario de alta resistencia térmica',
  'Esmalte satinado impermeable resistente a ceniza',
  'Apto para lavavajillas o enjuague con agua y jabón neutro.',
  true,
  8,
  false,
  '2026-10-16T16:45:00Z'
),
(
  'cenicero-rustico-organico',
  'ceniceros',
  'CENICEROS',
  'Cenicero Rústico Borde Orgánico',
  'Pieza modelada por pellizco con perímetro irregular y hendiduras esculpidas a mano.',
  'Un homenaje a las técnicas arcaicas de modelado. Su peso compacto y fondo texturado le confieren presencia tanto en terrazas como en salones sobrios.',
  'cenicero__2__be55122e.jpg',
  '/assets/aistudio/cenicero__2__be55122e.jpg',
  '$ 24.000',
  24000,
  '14 cm ancho × 12 cm fondo × 4 cm alto',
  'Gres chamotado grano medio',
  'Esmalte ceniza vegetal formulado en taller',
  'Lavar a mano con esponja suave.',
  true,
  5,
  false,
  '2026-10-15T13:20:00Z'
),
(
  'totem-escultorico-barro',
  'decoracion',
  'DECORACIÓN',
  'Tótem Escultórico de Barro',
  'Objeto de arte decorativo compuesto por volúmenes apilados en equilibrio visual y textura pura.',
  'Pieza concebida como escultura de interior. Cada sección geométrica responde a una proporción áurea, creando sombras arquitectónicas a cualquier hora del día.',
  'decoracion__4__26b0421d.jpg',
  '/assets/aistudio/decoracion__4__26b0421d.jpg',
  '$ 85.000',
  85000,
  '38 cm alto × 14 cm base',
  'Gres tostado cocido con llama directa',
  'Pátina mineral cruda sin esmaltar',
  'Limpiar en seco con brocha o plumero suave.',
  true,
  2,
  false,
  '2026-10-14T17:10:00Z'
),
(
  'jarron-lineas-altas-cincel',
  'jarrones',
  'JARRONES',
  'Jarrón Botella Líneas Altas',
  'Jarrón estilizado de cuello esbelto y hombro marcado, con elegante acabado mate sedoso.',
  'Torneado con gres blanco de grano extrafino. Su silueta pura y esbelta resalta tanto solitario como agrupado con vasijas de menor porte.',
  'jarron__1__755d8979.jpg',
  '/assets/aistudio/jarron__1__755d8979.jpg',
  '$ 54.000',
  54000,
  '34 cm alto × 12 cm diámetro',
  'Gres blanco de alta temperatura',
  'Esmalte tiza mate formulado en taller',
  'Apto para agua con flores frescas o secas.',
  true,
  5,
  true,
  '2026-10-13T08:30:00Z'
),
(
  'pieza-decorativa-texturada',
  'decoracion',
  'DECORACIÓN',
  'Pieza Decorativa Texturada',
  'Elemento escultórico con acanaladuras longitudinales realizadas con gubias tradicionales de alfarero.',
  'El juego entre luces y sombras sobre los surcos resalta la destreza del artesano. Una pieza ideal para repisas de madera natural o mesas de mármol.',
  'decoracion__2__623e7191.jpg',
  '/assets/aistudio/decoracion__2__623e7191.jpg',
  '$ 62.000',
  62000,
  '22 cm alto × 18 cm diámetro',
  'Gres ferruginoso natural',
  'Esmalte satinado tiza con zonas de barro a la vista',
  'Limpiar con paño ligeramente humedecido.',
  true,
  3,
  false,
  '2026-10-12T12:00:00Z'
),
(
  'cenicero-esculpido-terracota',
  'ceniceros',
  'CENICEROS',
  'Cenicero Esculpido Terracota',
  'Cenicero compacto de tono barro cálido y hendidura doble para descanso seguro de cigarrillos.',
  'Fabricado con gres rico en óxidos de hierro que aportan su característico color terracota tostado. Sellado interior para evitar cualquier tipo de mancha.',
  'cenicero_cebc1b7e.jpg',
  '/assets/aistudio/cenicero_cebc1b7e.jpg',
  '$ 20.000',
  20000,
  '11,5 cm diámetro × 3 cm altura',
  'Gres refractario terracota',
  'Sellado cerámico no poroso de alta temperatura',
  'Apto para lavavajillas.',
  true,
  9,
  false,
  '2026-10-11T15:20:00Z'
),
(
  'vasija-oriental-dinastia',
  'vasijas',
  'VASIJA',
  'Vasija Ceremonial Dinastía',
  'Pieza tradicional inspirada en la cerámica asiática milenaria con motivos florales pintados bajo esmalte.',
  'Una obra maestra de alfarería y pintura botánica a mano alzada. Diseñada tanto para servir caldos o infusiones calientes como para presidir el comedor.',
  'cuong-duyen-ceramics-ZBG9u5KF0Wk-unsplash_321a2a38.jpg',
  '/assets/aistudio/cuong-duyen-ceramics-ZBG9u5KF0Wk-unsplash_321a2a38.jpg',
  '$ 95.000',
  95000,
  '26 cm diámetro × 19 cm alto (Capacidad 2,2 L)',
  'Porcelana gresificada de alta resistencia',
  'Pigmentos cobalto bajo cubierta y esmalte vítreo translúcido',
  'Lavar a mano para preservar el brillo de la pintura.',
  true,
  2,
  true,
  '2026-10-10T19:00:00Z'
),
(
  'escultura-organica-mesa',
  'decoracion',
  'DECORACIÓN',
  'Escultura Orgánica de Mesa',
  'Volumen curvilíneo continuo con orificio central que enmarca la luz y genera profundidad en la estancia.',
  'Modelada mediante vaciado y pulido manual. Su superficie suave al tacto y curvatura continua invitan al tacto y aportan serenidad visual inmediata.',
  'decoracion__1__53301f24.jpg',
  '/assets/aistudio/decoracion__1__53301f24.jpg',
  '$ 68.000',
  68000,
  '25 cm alto × 21 cm ancho × 10 cm fondo',
  'Gres blanco micro-chamotado',
  'Esmalte cáscara de huevo mate sedoso',
  'Limpiar con plumero o paño seco.',
  true,
  3,
  false,
  '2026-10-09T09:40:00Z'
),
(
  'florero-esbelto-blanco',
  'jarrones',
  'JARRONES',
  'Florero Esbelto Blanco Mate',
  'Florero de proporciones estilizadas con boca estrecha pensado para una única flor o espiga seca.',
  'Pieza minimalista torneada con arcilla refinada. Su base pesada garantiza estabilidad absoluta a pesar de su esbeltez vertical.',
  'jarron__5__5d25a996.jpg',
  '/assets/aistudio/jarron__5__5d25a996.jpg',
  '$ 46.000',
  46000,
  '30 cm alto × 9 cm diámetro base',
  'Gres blanco cocido a 1260 °C',
  'Esmalte blanco tiza mate no poroso',
  'Limpiar con agua templada y secar al aire.',
  true,
  5,
  false,
  '2026-10-08T11:15:00Z'
),
(
  'plato-hondo-botanico',
  'platos',
  'PLATOS',
  'Plato Hondo Pasta y Risotto',
  'Plato hondo de ala generosa y base texturada para retener la temperatura de cremas y pastas.',
  'Diseñado para realzar presentaciones culinarias. Las motas minerales del barro cocido contrastan armónicamente con el esmalte satinado.',
  'tom-crew-YA2E3d7a9Wo-unsplash_dd7ed7a8.jpg',
  '/assets/aistudio/tom-crew-YA2E3d7a9Wo-unsplash_dd7ed7a8.jpg',
  '$ 30.000',
  30000,
  '25 cm diámetro × 5 cm profundidad',
  'Gres ferruginoso vitrificado',
  'Esmalte satinado libre de plomo',
  'Apto para lavavajillas y microondas.',
  true,
  8,
  false,
  '2026-10-07T10:05:00Z'
),
(
  'joyero-minimalista-marfil',
  'joyeros',
  'JOYEROS',
  'Joyero Minimalista de Mesa',
  'Cofre cerámico con tapa encajada y acabado en gres sedoso para guardar anillos, relojes y recuerdos.',
  'Elaborado artesanalmente en torno con un ajuste preciso entre base y tapa. Ideal para mesitas de noche o tocadores sobrios.',
  'evelyn-verdin-2iIEfns94pE-unsplash_bf29834f.jpg',
  '/assets/aistudio/evelyn-verdin-2iIEfns94pE-unsplash_bf29834f.jpg',
  '$ 36.000',
  36000,
  '12 cm diámetro × 9 cm alto',
  'Gres porcelánico refractario',
  'Esmalte mate marfil',
  'Limpiar con paño suave humedecido.',
  true,
  4,
  false,
  '2026-10-06T14:10:00Z'
),
(
  'jarron-boceto-mediterraneo',
  'jarrones',
  'JARRONES',
  'Jarrón Solitario Mediterráneo',
  'Vasija pequeña de cuello curvo y textura terrosa que recuerda a las ánforas de la costa levantina.',
  'Moldeado en torno rápido con acabado estriado. Su silueta atemporal aporta calidez orgánica a estanterías y rincones de lectura.',
  'cindy-bartillon-THtfRdrK0nI-unsplash_056b3615.jpg',
  '/assets/aistudio/cindy-bartillon-THtfRdrK0nI-unsplash_056b3615.jpg',
  '$ 42.000',
  42000,
  '22 cm alto × 13 cm diámetro',
  'Gres chamotado arena',
  'Esmalte natural satinado',
  'Lavar a mano suavemente.',
  true,
  7,
  false,
  '2026-10-05T18:20:00Z'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  category_label = EXCLUDED.category_label,
  price = EXCLUDED.price,
  price_number = EXCLUDED.price_number,
  image_src = EXCLUDED.image_src,
  file_name = EXCLUDED.file_name,
  description = EXCLUDED.description,
  long_description = EXCLUDED.long_description,
  updated_at = timezone('utc'::text, now());

-- ==============================================================================
-- FIN DEL ESQUEMA
-- ==============================================================================
