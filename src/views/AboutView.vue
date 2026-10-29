<template>
  <div class="py-10 sm:py-16 bg-[#FAF7F2] min-h-screen">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-xs text-[#8D857B]">
        <router-link to="/" class="hover:text-[#F28482] transition-colors flex items-center gap-1">
          <ArrowLeft class="w-3.5 h-3.5" />
          Inicio
        </router-link>
        <ChevronRight class="w-3.5 h-3.5" />
        <span class="font-semibold text-[#1E1B18]">Acerca de Cincel Cerámica</span>
      </nav>

      <!-- Hero Acerca de -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div class="lg:col-span-7 space-y-4">
          <span class="text-xs font-semibold uppercase tracking-[0.2em] text-[#F28482] block">
            EL ESTUDIO & NUESTRA FILOSOFÍA
          </span>
          <h1 class="font-serif text-3xl sm:text-5xl font-semibold text-[#1E1B18] leading-tight">
            Artesanía contemporánea con alma de barro y tiempo lento
          </h1>
          <p class="text-base text-[#6B655D] leading-relaxed">
            Fundado en 2020 en el corazón de Madrid, Cincel Cerámica nació de la necesidad de volver a conectar con lo tangible. Creemos que los objetos cotidianos deben guardar memoria humana, textura y emoción en lugar de perfección industrial en serie.
          </p>
          <div class="pt-4 flex items-center gap-4">
            <router-link
              to="/catalogo"
              class="inline-flex items-center gap-2 px-6 py-3 bg-[#1E1B18] hover:bg-[#38342E] text-white text-xs font-semibold rounded-xl transition-all"
            >
              Ver piezas del catálogo
              <ArrowRight class="w-4 h-4" />
            </router-link>
            <router-link
              to="/#contacto"
              class="px-6 py-3 bg-white hover:bg-[#FAF7F2] text-[#1E1B18] text-xs font-semibold rounded-xl border border-[#E6DFD5] transition-all"
            >
              Visitar el taller
            </router-link>
          </div>
        </div>

        <div class="lg:col-span-5 rounded-3xl overflow-hidden shadow-xl border border-[#E6DFD5] bg-[#F3EFEA]">
          <img
            src="/banner (1).jpg"
            alt="Vasijas de Cincel sobre mesa de madera acanalada"
            class="w-full aspect-square object-cover"
          />
        </div>
      </div>

      <!-- El Proceso Artesanal (4 pasos) -->
      <div class="bg-white rounded-3xl p-8 sm:p-12 border border-[#E6DFD5] shadow-sm space-y-8">
        <div class="max-w-xl">
          <span class="text-xs font-semibold uppercase tracking-[0.2em] text-[#F28482] block mb-2">
            CÓMO TRABAJAMOS
          </span>
          <h2 class="font-serif text-3xl font-semibold text-[#1E1B18]">
            Las 4 etapas de cada pieza
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(step, idx) in steps"
            :key="idx"
            class="p-5 bg-[#FAF7F2] rounded-2xl border border-[#E6DFD5] flex flex-col justify-between"
          >
            <div>
              <span class="font-serif text-3xl font-bold text-[#F28482] block mb-3">
                0{{ idx + 1 }}
              </span>
              <h3 class="font-serif text-lg font-semibold text-[#1E1B18] mb-2">
                {{ step.title }}
              </h3>
              <p class="text-xs text-[#6B655D] leading-relaxed">
                {{ step.desc }}
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-[#E6DFD5] text-[11px] font-mono text-[#8D857B]">
              {{ step.time }}
            </div>
          </div>
        </div>
      </div>

      <!-- Valores y Sostenibilidad -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-8 bg-white rounded-3xl border border-[#E6DFD5] shadow-xs space-y-3">
          <div class="w-10 h-10 rounded-xl bg-[#FAF7F2] text-[#F28482] flex items-center justify-center">
            <Sparkles class="w-5 h-5" />
          </div>
          <h3 class="font-serif text-xl font-semibold text-[#1E1B18]">
            Esmaltes Minerales Propios
          </h3>
          <p class="text-xs text-[#6B655D] leading-relaxed">
            Formulamos nuestras propias mezclas a base de cenizas, feldespato y óxidos naturales de hierro, cobre y cobalto. 100% libres de plomo y aptos para uso alimentario.
          </p>
        </div>

        <div class="p-8 bg-white rounded-3xl border border-[#E6DFD5] shadow-xs space-y-3">
          <div class="w-10 h-10 rounded-xl bg-[#FAF7F2] text-[#F28482] flex items-center justify-center">
            <Flame class="w-5 h-5" />
          </div>
          <h3 class="font-serif text-xl font-semibold text-[#1E1B18]">
            Cocción a 1260 °C
          </h3>
          <p class="text-xs text-[#6B655D] leading-relaxed">
            El gres alcanza su punto de sinterización óptimo, cerrando sus poros para garantizar impermeabilidad total, resistencia a lavavajillas y gran durabilidad.
          </p>
        </div>

        <div class="p-8 bg-white rounded-3xl border border-[#E6DFD5] shadow-xs space-y-3">
          <div class="w-10 h-10 rounded-xl bg-[#FAF7F2] text-[#F28482] flex items-center justify-center">
            <ShieldCheck class="w-5 h-5" />
          </div>
          <h3 class="font-serif text-xl font-semibold text-[#1E1B18]">
            Cero Residuo Plástico
          </h3>
          <p class="text-xs text-[#6B655D] leading-relaxed">
            Envolvemos cada encargo exclusivamente en cartón reciclado, papel nido de abeja biodegradable y viruta de pino certificada FSC.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ArrowLeft, ChevronRight, ArrowRight, Sparkles, Flame, ShieldCheck } from 'lucide-vue-next';

export default {
  name: 'AboutView',
  components: {
    ArrowLeft,
    ChevronRight,
    ArrowRight,
    Sparkles,
    Flame,
    ShieldCheck,
  },
  data() {
    return {
      steps: [
        {
          title: 'Amasado y desaireado',
          desc: 'Preparación minuciosa de la arcilla para expulsar burbujas de aire y asegurar una plasticidad uniforme.',
          time: 'Día 1 · En taller',
        },
        {
          title: 'Torneado manual',
          desc: 'Modelado en torno alfarero tradicional definiendo el cuello, las paredes y la curvatura exacta de la pieza.',
          time: 'Día 1 a 2 · Torno',
        },
        {
          title: 'Bizcochado a 980 °C',
          desc: 'Secado lento y primera cocción en horno eléctrico para deshidratar el barro y permitir absorber el esmalte.',
          time: 'Días 3 a 5 · Horno',
        },
        {
          title: 'Esmaltado y 1260 °C',
          desc: 'Aplicación por inmersión de esmaltes minerales y segunda cocción de alta temperatura durante 14 horas.',
          time: 'Días 6 a 8 · Vitrificado',
        },
      ],
    };
  },
  // Hooks del ciclo de vida requeridos: created() y mounted()
  created() {
    console.log('[Ciclo de Vida] AboutView creado (created hook)');
  },
  mounted() {
    console.log('[Ciclo de Vida] AboutView montado (mounted hook)');
  },
};
</script>
