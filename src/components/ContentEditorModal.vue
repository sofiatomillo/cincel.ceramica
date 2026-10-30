<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="effectiveIsOpen"
        class="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 min-h-screen"
        @click.self="close"
      >
        <div
          class="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-[#E6DFD5] relative flex flex-col max-h-[92vh] m-auto animate-scale-in z-[10000]"
        >
          <!-- Input oculto para subida de imágenes -->
          <input
            ref="hiddenFileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onFileSelected"
          />

          <!-- Cabecera -->
          <div class="flex items-start justify-between pb-4 border-b border-[#E6DFD5] shrink-0">
            <div>
              <div class="inline-flex items-center gap-2 mb-1">
                <span class="w-2.5 h-2.5 rounded-full bg-[#F28482] animate-pulse" />
                <span class="text-xs font-semibold uppercase tracking-wider text-[#F28482] flex items-center gap-1.5">
                  <Edit3 class="w-3.5 h-3.5" />
                  Panel de Administrador
                </span>
                <span class="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-semibold px-2 py-0.5 rounded-full">
                  Sofia.Tomillo
                </span>
              </div>
              <h2 class="font-serif text-xl sm:text-2xl font-semibold text-[#1E1B18]">
                Modificar Textos e Imágenes del Sitio
              </h2>
              <p class="text-xs text-[#6B655D] mt-0.5">
                Edita la información visual de Cincel Cerámica. Los cambios se guardan y se reflejan inmediatamente en toda la página.
              </p>
            </div>

            <button
              @click="close"
              class="p-2 text-[#8D857B] hover:text-[#1E1B18] rounded-xl hover:bg-[#FAF7F2] transition-colors cursor-pointer shrink-0 ml-3"
              aria-label="Cerrar modal"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Selector de Pestañas / Secciones -->
          <div class="flex items-center gap-1.5 overflow-x-auto py-3 border-b border-[#E6DFD5] shrink-0 text-xs font-medium no-scrollbar">
            <button
              type="button"
              @click="activeSection = 'hero'"
              class="px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5"
              :class="activeSection === 'hero' ? 'bg-[#1E1B18] text-white shadow-xs' : 'bg-[#FAF7F2] text-[#6B655D] hover:text-[#1E1B18] hover:bg-[#F3EFEA] border border-[#E6DFD5]'"
            >
              <Sparkles class="w-3.5 h-3.5 text-[#F28482]" />
              <span>Portada (Hero)</span>
            </button>

            <button
              type="button"
              @click="activeSection = 'services'"
              class="px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5"
              :class="activeSection === 'services' ? 'bg-[#1E1B18] text-white shadow-xs' : 'bg-[#FAF7F2] text-[#6B655D] hover:text-[#1E1B18] hover:bg-[#F3EFEA] border border-[#E6DFD5]'"
            >
              <Layers class="w-3.5 h-3.5 text-[#F28482]" />
              <span>Servicios</span>
            </button>

            <button
              type="button"
              @click="activeSection = 'empresa'"
              class="px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5"
              :class="activeSection === 'empresa' ? 'bg-[#1E1B18] text-white shadow-xs' : 'bg-[#FAF7F2] text-[#6B655D] hover:text-[#1E1B18] hover:bg-[#F3EFEA] border border-[#E6DFD5]'"
            >
              <Store class="w-3.5 h-3.5 text-[#F28482]" />
              <span>Sobre Nosotros</span>
            </button>

            <button
              type="button"
              @click="activeSection = 'aboutPage'"
              class="px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5"
              :class="activeSection === 'aboutPage' ? 'bg-[#1E1B18] text-white shadow-xs' : 'bg-[#FAF7F2] text-[#6B655D] hover:text-[#1E1B18] hover:bg-[#F3EFEA] border border-[#E6DFD5]'"
            >
              <BookOpen class="w-3.5 h-3.5 text-[#F28482]" />
              <span>Página Acerca de</span>
            </button>

            <button
              type="button"
              @click="activeSection = 'footer'"
              class="px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5"
              :class="activeSection === 'footer' ? 'bg-[#1E1B18] text-white shadow-xs' : 'bg-[#FAF7F2] text-[#6B655D] hover:text-[#1E1B18] hover:bg-[#F3EFEA] border border-[#E6DFD5]'"
            >
              <MapPin class="w-3.5 h-3.5 text-[#F28482]" />
              <span>Pie de Página & Contacto</span>
            </button>
          </div>

          <!-- Mensajes de feedback -->
          <div v-if="successMsg" class="mt-3 p-2.5 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 flex items-center gap-2">
            <CheckCircle class="w-4 h-4 text-green-600 shrink-0" />
            <span>{{ successMsg }}</span>
          </div>

          <!-- Formulario editable con scroll -->
          <div class="overflow-y-auto pr-1 mt-4 space-y-5 flex-1">
            <!-- 1. SECCIÓN HERO / PORTADA -->
            <div v-if="activeSection === 'hero'" class="space-y-4">
              <div>
                <label class="block text-[11px] font-semibold text-[#1E1B18] uppercase tracking-wider mb-1">
                  Subtítulo superior (Eyebrow)
                </label>
                <input
                  v-model="form.hero.eyebrow"
                  type="text"
                  class="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                />
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-[#1E1B18] uppercase tracking-wider mb-1">
                  Título Principal de la Portada
                </label>
                <textarea
                  v-model="form.hero.title"
                  rows="2"
                  class="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482] resize-none"
                ></textarea>
                <span class="text-[10px] text-[#8D857B]">Puedes usar saltos de línea para estructurar el titular.</span>
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-[#1E1B18] uppercase tracking-wider mb-1">
                  Párrafo Descriptivo
                </label>
                <textarea
                  v-model="form.hero.description"
                  rows="3"
                  class="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                ></textarea>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-semibold text-[#1E1B18] uppercase tracking-wider mb-1">
                    Texto Botón Catálogo
                  </label>
                  <input
                    v-model="form.hero.buttonCatalogText"
                    type="text"
                    placeholder="Ver catálogo completo"
                    class="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-[#1E1B18] uppercase tracking-wider mb-1">
                    Texto Botón Taller
                  </label>
                  <input
                    v-model="form.hero.buttonWorkshopText"
                    type="text"
                    placeholder="Conocer el taller"
                    class="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                  />
                </div>
              </div>

              <!-- Imagen de la Portada -->
              <div class="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E6DFD5] space-y-3">
                <label class="block text-[11px] font-semibold text-[#1E1B18] uppercase tracking-wider">
                  Imagen de la Portada (Hero)
                </label>
                <div class="flex flex-col sm:flex-row gap-4 items-center">
                  <div class="w-32 h-24 rounded-xl overflow-hidden bg-white border border-[#E6DFD5] shrink-0">
                    <img :src="form.hero.imageSrc" alt="Preview Hero" class="w-full h-full object-cover" />
                  </div>
                  <div class="flex-1 w-full space-y-2">
                    <div class="flex items-center gap-2">
                      <input
                        v-model="form.hero.imageSrc"
                        type="text"
                        placeholder="URL o ruta de imagen (ej. /banner.jpg)"
                        class="flex-1 px-3 py-2 text-xs bg-white border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                      />
                      <button
                        type="button"
                        @click="triggerFileUpload('hero')"
                        class="px-3 py-2 bg-white hover:bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl text-xs font-semibold text-[#1E1B18] transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                      >
                        <Upload class="w-3.5 h-3.5 text-[#F28482]" />
                        <span>Subir archivo</span>
                      </button>
                    </div>

                    <div class="space-y-1">
                      <span class="text-[10px] font-medium text-[#8D857B] block">O selecciona una imagen del taller:</span>
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <button
                          v-for="img in galleryImages"
                          :key="img.url"
                          type="button"
                          @click="form.hero.imageSrc = img.url"
                          class="px-2 py-1 text-[10px] bg-white border border-[#E6DFD5] hover:border-[#F28482] rounded-lg text-[#1E1B18] transition-colors cursor-pointer"
                          :class="form.hero.imageSrc === img.url ? 'border-[#F28482] bg-[#F28482]/10 font-bold' : ''"
                        >
                          {{ img.name }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Estadísticas de la Portada -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div class="p-3 bg-[#FAF7F2] rounded-xl border border-[#E6DFD5]">
                  <label class="block text-[10px] font-semibold text-[#8D857B] uppercase mb-1">Dato 1</label>
                  <input v-model="form.hero.stat1Number" class="w-full px-2 py-1.5 text-xs bg-white border border-[#E6DFD5] rounded-lg mb-1" placeholder="100%" />
                  <input v-model="form.hero.stat1Label" class="w-full px-2 py-1.5 text-xs bg-white border border-[#E6DFD5] rounded-lg" placeholder="Torno manual" />
                </div>
                <div class="p-3 bg-[#FAF7F2] rounded-xl border border-[#E6DFD5]">
                  <label class="block text-[10px] font-semibold text-[#8D857B] uppercase mb-1">Dato 2</label>
                  <input v-model="form.hero.stat2Number" class="w-full px-2 py-1.5 text-xs bg-white border border-[#E6DFD5] rounded-lg mb-1" placeholder="1260 °C" />
                  <input v-model="form.hero.stat2Label" class="w-full px-2 py-1.5 text-xs bg-white border border-[#E6DFD5] rounded-lg" placeholder="Gres vitrificado" />
                </div>
                <div class="p-3 bg-[#FAF7F2] rounded-xl border border-[#E6DFD5]">
                  <label class="block text-[10px] font-semibold text-[#8D857B] uppercase mb-1">Dato 3</label>
                  <input v-model="form.hero.stat3Number" class="w-full px-2 py-1.5 text-xs bg-white border border-[#E6DFD5] rounded-lg mb-1" placeholder="0% Plomo" />
                  <input v-model="form.hero.stat3Label" class="w-full px-2 py-1.5 text-xs bg-white border border-[#E6DFD5] rounded-lg" placeholder="Apto alimentos" />
                </div>
              </div>
            </div>

            <!-- 2. SECCIÓN SERVICIOS -->
            <div v-if="activeSection === 'services'" class="space-y-4">
              <div>
                <label class="block text-[11px] font-semibold text-[#1E1B18] uppercase tracking-wider mb-1">
                  Subtítulo superior
                </label>
                <input
                  v-model="form.services.eyebrow"
                  type="text"
                  class="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                />
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-[#1E1B18] uppercase tracking-wider mb-1">
                  Título de la Sección Servicios
                </label>
                <input
                  v-model="form.services.title"
                  type="text"
                  class="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                />
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-[#1E1B18] uppercase tracking-wider mb-1">
                  Descripción General
                </label>
                <textarea
                  v-model="form.services.description"
                  rows="2"
                  class="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                ></textarea>
              </div>

              <!-- Imagen de Servicios -->
              <div class="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E6DFD5] space-y-3">
                <label class="block text-[11px] font-semibold text-[#1E1B18] uppercase tracking-wider">
                  Imagen de la Sección Servicios
                </label>
                <div class="flex flex-col sm:flex-row gap-4 items-center">
                  <div class="w-32 h-24 rounded-xl overflow-hidden bg-white border border-[#E6DFD5] shrink-0">
                    <img :src="form.services.imageSrc" alt="Preview Servicios" class="w-full h-full object-cover" />
                  </div>
                  <div class="flex-1 w-full space-y-2">
                    <div class="flex items-center gap-2">
                      <input
                        v-model="form.services.imageSrc"
                        type="text"
                        placeholder="URL o ruta de imagen (ej. /banner..jpg)"
                        class="flex-1 px-3 py-2 text-xs bg-white border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                      />
                      <button
                        type="button"
                        @click="triggerFileUpload('services')"
                        class="px-3 py-2 bg-white hover:bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl text-xs font-semibold text-[#1E1B18] transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                      >
                        <Upload class="w-3.5 h-3.5 text-[#F28482]" />
                        <span>Subir</span>
                      </button>
                    </div>

                    <input
                      v-model="form.services.imageCaption"
                      type="text"
                      placeholder="Texto al pie de foto"
                      class="w-full px-3 py-2 text-xs bg-white border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                    />
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <button
                        v-for="img in galleryImages"
                        :key="img.url"
                        type="button"
                        @click="form.services.imageSrc = img.url"
                        class="px-2 py-1 text-[10px] bg-white border border-[#E6DFD5] hover:border-[#F28482] rounded-lg text-[#1E1B18] transition-colors cursor-pointer"
                        :class="form.services.imageSrc === img.url ? 'border-[#F28482] bg-[#F28482]/10 font-bold' : ''"
                      >
                        {{ img.name }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Items de servicios -->
              <div class="space-y-3 pt-1">
                <span class="text-xs font-semibold text-[#1E1B18] uppercase tracking-wider block">
                  Los 3 Servicios Ofrecidos:
                </span>
                <div
                  v-for="(item, idx) in form.services.items"
                  :key="item.id || idx"
                  class="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E6DFD5] space-y-2"
                >
                  <div class="flex items-center gap-2">
                    <span class="font-serif font-bold text-[#F28482] text-sm">{{ item.number }}</span>
                    <input
                      v-model="item.title"
                      type="text"
                      class="flex-1 px-2.5 py-1.5 text-xs bg-white border border-[#E6DFD5] rounded-lg font-medium"
                      placeholder="Título del servicio"
                    />
                  </div>
                  <textarea
                    v-model="item.description"
                    rows="2"
                    class="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E6DFD5] rounded-lg"
                    placeholder="Descripción"
                  ></textarea>
                  <input
                    v-model="item.details"
                    type="text"
                    class="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E6DFD5] rounded-lg text-[#8D857B]"
                    placeholder="Detalles y modalidades"
                  />
                </div>
              </div>
            </div>

            <!-- 3. SECCIÓN SOBRE NOSOTROS (HOME) -->
            <div v-if="activeSection === 'empresa'" class="space-y-4">
              <div>
                <label class="block text-[11px] font-semibold text-[#1E1B18] uppercase tracking-wider mb-1">
                  Subtítulo superior
                </label>
                <input
                  v-model="form.empresa.eyebrow"
                  type="text"
                  class="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                />
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-[#1E1B18] uppercase tracking-wider mb-1">
                  Título de la Sección
                </label>
                <input
                  v-model="form.empresa.title"
                  type="text"
                  class="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                />
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-[#1E1B18] uppercase tracking-wider mb-1">
                  Párrafo Destacado (Lead)
                </label>
                <textarea
                  v-model="form.empresa.lead"
                  rows="3"
                  class="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                ></textarea>
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-[#1E1B18] uppercase tracking-wider mb-1">
                  Párrafo Secundario
                </label>
                <textarea
                  v-model="form.empresa.paragraph"
                  rows="3"
                  class="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                ></textarea>
              </div>

              <!-- Imagen de Sobre Nosotros -->
              <div class="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E6DFD5] space-y-3">
                <label class="block text-[11px] font-semibold text-[#1E1B18] uppercase tracking-wider">
                  Imagen de la Sección Sobre Nosotros
                </label>
                <div class="flex flex-col sm:flex-row gap-4 items-center">
                  <div class="w-32 h-24 rounded-xl overflow-hidden bg-white border border-[#E6DFD5] shrink-0">
                    <img :src="form.empresa.imageSrc" alt="Preview Empresa" class="w-full h-full object-cover" />
                  </div>
                  <div class="flex-1 w-full space-y-2">
                    <div class="flex items-center gap-2">
                      <input
                        v-model="form.empresa.imageSrc"
                        type="text"
                        placeholder="URL o ruta de imagen (ej. /banner (1).jpg)"
                        class="flex-1 px-3 py-2 text-xs bg-white border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                      />
                      <button
                        type="button"
                        @click="triggerFileUpload('empresa')"
                        class="px-3 py-2 bg-white hover:bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl text-xs font-semibold text-[#1E1B18] transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                      >
                        <Upload class="w-3.5 h-3.5 text-[#F28482]" />
                        <span>Subir</span>
                      </button>
                    </div>

                    <div class="flex items-center gap-1.5 flex-wrap">
                      <button
                        v-for="img in galleryImages"
                        :key="img.url"
                        type="button"
                        @click="form.empresa.imageSrc = img.url"
                        class="px-2 py-1 text-[10px] bg-white border border-[#E6DFD5] hover:border-[#F28482] rounded-lg text-[#1E1B18] transition-colors cursor-pointer"
                        :class="form.empresa.imageSrc === img.url ? 'border-[#F28482] bg-[#F28482]/10 font-bold' : ''"
                      >
                        {{ img.name }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 4. PÁGINA ACERCA DE -->
            <div v-if="activeSection === 'aboutPage'" class="space-y-4">
              <div>
                <label class="block text-[11px] font-semibold text-[#1E1B18] uppercase tracking-wider mb-1">
                  Subtítulo superior
                </label>
                <input
                  v-model="form.aboutPage.eyebrow"
                  type="text"
                  class="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                />
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-[#1E1B18] uppercase tracking-wider mb-1">
                  Título Principal de la Página Acerca de
                </label>
                <input
                  v-model="form.aboutPage.title"
                  type="text"
                  class="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                />
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-[#1E1B18] uppercase tracking-wider mb-1">
                  Historia y Manifiesto del Taller
                </label>
                <textarea
                  v-model="form.aboutPage.description"
                  rows="4"
                  class="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                ></textarea>
              </div>

              <!-- Imagen de Acerca de -->
              <div class="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E6DFD5] space-y-3">
                <label class="block text-[11px] font-semibold text-[#1E1B18] uppercase tracking-wider">
                  Imagen Principal del Estudio
                </label>
                <div class="flex flex-col sm:flex-row gap-4 items-center">
                  <div class="w-32 h-24 rounded-xl overflow-hidden bg-white border border-[#E6DFD5] shrink-0">
                    <img :src="form.aboutPage.imageSrc" alt="Preview Acerca de" class="w-full h-full object-cover" />
                  </div>
                  <div class="flex-1 w-full space-y-2">
                    <div class="flex items-center gap-2">
                      <input
                        v-model="form.aboutPage.imageSrc"
                        type="text"
                        placeholder="URL o ruta de imagen (ej. /banner (1).jpg)"
                        class="flex-1 px-3 py-2 text-xs bg-white border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                      />
                      <button
                        type="button"
                        @click="triggerFileUpload('aboutPage')"
                        class="px-3 py-2 bg-white hover:bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl text-xs font-semibold text-[#1E1B18] transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                      >
                        <Upload class="w-3.5 h-3.5 text-[#F28482]" />
                        <span>Subir</span>
                      </button>
                    </div>

                    <div class="flex items-center gap-1.5 flex-wrap">
                      <button
                        v-for="img in galleryImages"
                        :key="img.url"
                        type="button"
                        @click="form.aboutPage.imageSrc = img.url"
                        class="px-2 py-1 text-[10px] bg-white border border-[#E6DFD5] hover:border-[#F28482] rounded-lg text-[#1E1B18] transition-colors cursor-pointer"
                        :class="form.aboutPage.imageSrc === img.url ? 'border-[#F28482] bg-[#F28482]/10 font-bold' : ''"
                      >
                        {{ img.name }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 5. PIE DE PÁGINA & CONTACTO -->
            <div v-if="activeSection === 'footer'" class="space-y-4">
              <div>
                <label class="block text-[11px] font-semibold text-[#1E1B18] uppercase tracking-wider mb-1">
                  Texto descriptivo bajo el logo de Cincel
                </label>
                <textarea
                  v-model="form.footer.brandDescription"
                  rows="3"
                  class="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                ></textarea>
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-[#1E1B18] uppercase tracking-wider mb-1">
                  Dirección física del taller y tienda
                </label>
                <input
                  v-model="form.footer.address"
                  type="text"
                  placeholder="Gorriti 4825, Palermo Soho · CABA, Argentina"
                  class="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-semibold text-[#1E1B18] uppercase tracking-wider mb-1">
                    Correo de contacto
                  </label>
                  <input
                    v-model="form.footer.email"
                    type="email"
                    placeholder="hola@cincelceramica.com.ar"
                    class="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-[#1E1B18] uppercase tracking-wider mb-1">
                    Teléfono
                  </label>
                  <input
                    v-model="form.footer.phone"
                    type="text"
                    placeholder="+54 11 4832-6540"
                    class="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                  />
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-[#1E1B18] uppercase tracking-wider mb-1">
                  Texto de copyright inferior
                </label>
                <input
                  v-model="form.footer.copyright"
                  type="text"
                  class="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                />
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-[#1E1B18] uppercase tracking-wider mb-1">
                  Nota secundaria al pie
                </label>
                <input
                  v-model="form.footer.bottomNote"
                  type="text"
                  class="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482]"
                />
              </div>
            </div>
          </div>

          <!-- Pie del Modal: Botones de Acción -->
          <div class="pt-4 mt-3 border-t border-[#E6DFD5] flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              @click="resetActiveSection"
              class="px-4 py-2.5 rounded-xl border border-[#E6DFD5] hover:bg-[#FAF7F2] text-[#8D857B] hover:text-[#1E1B18] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>Restablecer sección</span>
            </button>

            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="close"
                class="px-4 py-2.5 rounded-xl border border-[#E6DFD5] hover:bg-[#FAF7F2] text-[#2D2A26] text-xs font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                @click="saveCurrentSection"
                class="px-5 py-2.5 rounded-xl bg-[#1E1B18] hover:bg-[#38342E] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-2"
              >
                <Save class="w-4 h-4 text-[#F28482]" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import {
  X,
  Edit3,
  Sparkles,
  Layers,
  Store,
  BookOpen,
  MapPin,
  Save,
  RotateCcw,
  CheckCircle,
  Upload,
} from 'lucide-vue-next';
import {
  siteContentService,
  GALLERY_PRESET_IMAGES,
} from '../services/siteContentService';

export default {
  name: 'ContentEditorModal',
  components: {
    X,
    Edit3,
    Sparkles,
    Layers,
    Store,
    BookOpen,
    MapPin,
    Save,
    RotateCcw,
    CheckCircle,
    Upload,
  },
  props: {
    isOpen: {
      type: Boolean,
      default: undefined,
    },
    initialSection: {
      type: String,
      default: 'hero',
    },
  },
  emits: ['close'],
  data() {
    return {
      activeSection: this.initialSection || 'hero',
      galleryImages: GALLERY_PRESET_IMAGES,
      successMsg: '',
      uploadTarget: 'hero',
      form: {
        hero: {},
        services: {},
        empresa: {},
        aboutPage: {},
        footer: {},
      },
    };
  },
  computed: {
    effectiveIsOpen() {
      if (this.isOpen !== undefined && typeof this.isOpen === 'boolean') {
        return this.isOpen;
      }
      return Boolean(siteContentService.isEditorModalOpen.value);
    },
  },
  watch: {
    effectiveIsOpen: {
      immediate: true,
      handler(val) {
        if (val) {
          this.activeSection = siteContentService.activeEditorSection.value || this.initialSection || 'hero';
          this.syncFormWithService();
          this.successMsg = '';
        }
      },
    },
    initialSection(val) {
      if (val) {
        this.activeSection = val;
      }
    },
  },
  created() {
    this.syncFormWithService();
  },
  methods: {
    syncFormWithService() {
      const src = siteContentService.content.value;
      this.form = JSON.parse(JSON.stringify(src));
    },

    close() {
      this.$emit('close');
      siteContentService.closeEditor();
    },

    triggerFileUpload(targetSection) {
      this.uploadTarget = targetSection;
      if (this.$refs.hiddenFileInput) {
        this.$refs.hiddenFileInput.value = '';
        this.$refs.hiddenFileInput.click();
      }
    },

    onFileSelected(e) {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (dataUrl && this.uploadTarget && this.form[this.uploadTarget]) {
          this.form[this.uploadTarget].imageSrc = dataUrl;
          this.successMsg = `Imagen cargada para "${this.getSectionLabel(this.uploadTarget)}". Haz clic en "Guardar Cambios" para aplicarla.`;
        }
      };
      reader.readAsDataURL(file);
    },

    async saveCurrentSection() {
      await siteContentService.updateSection(this.activeSection, this.form[this.activeSection]);
      this.successMsg = `¡Cambios en "${this.getSectionLabel(this.activeSection)}" guardados con éxito!`;
      setTimeout(() => {
        this.successMsg = '';
      }, 3000);
    },

    async resetActiveSection() {
      if (confirm(`¿Restablecer los textos e imagen de "${this.getSectionLabel(this.activeSection)}" a sus valores iniciales?`)) {
        await siteContentService.resetSection(this.activeSection);
        this.syncFormWithService();
        this.successMsg = `Sección "${this.getSectionLabel(this.activeSection)}" restablecida a los valores iniciales.`;
        setTimeout(() => {
          this.successMsg = '';
        }, 3000);
      }
    },

    getSectionLabel(key) {
      const labels = {
        hero: 'Portada (Hero)',
        services: 'Servicios',
        empresa: 'Sobre Nosotros',
        aboutPage: 'Página Acerca de',
        footer: 'Pie de Página',
      };
      return labels[key] || key;
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
