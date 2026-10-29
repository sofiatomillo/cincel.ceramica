<template>
  <div class="py-10 sm:py-16 bg-[#FAF7F2] min-h-screen">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-xs text-[#8D857B] mb-8">
        <router-link to="/" class="hover:text-[#F28482] transition-colors flex items-center gap-1">
          <ArrowLeft class="w-3.5 h-3.5" />
          Inicio
        </router-link>
        <ChevronRight class="w-3.5 h-3.5" />
        <router-link to="/catalogo" class="hover:text-[#F28482] transition-colors">
          Catálogo
        </router-link>
        <ChevronRight class="w-3.5 h-3.5" />
        <span class="font-semibold text-[#1E1B18]">
          {{ isEditing ? 'Modificar Registro' : 'Alta de Nueva Pieza' }}
        </span>
      </nav>

      <!-- Tarjeta principal del formulario -->
      <div class="bg-white rounded-3xl border border-[#E6DFD5] shadow-lg p-6 sm:p-10">
        <div class="mb-8 pb-6 border-b border-[#E6DFD5]">
          <span class="text-xs font-semibold uppercase tracking-[0.2em] text-[#F28482] block mb-2">
            GESTIÓN DE REGISTROS (LOCALSTORAGE)
          </span>
          <h1 class="font-serif text-3xl sm:text-4xl font-semibold text-[#1E1B18]">
            {{ isEditing ? `Modificar: ${form.title || 'Pieza'}` : 'Crear Nuevo Registro de Pieza' }}
          </h1>
          <p class="text-xs sm:text-sm text-[#6B655D] mt-2">
            Los datos se guardan en el almacenamiento local del navegador (LocalStorage) y persistirán de forma automática.
          </p>
        </div>

        <!-- Alerta de éxito con transición Vue -->
        <Transition name="alert-fade">
          <div
            v-if="saveSuccess"
            class="mb-6 p-4 bg-[#E8F5E9] border border-[#C8E6C9] rounded-2xl flex items-center gap-3 text-xs text-[#2E7D32] font-medium"
          >
            <CheckCircle2 class="w-5 h-5 shrink-0" />
            <span>¡Registro guardado exitosamente en LocalStorage! Redirigiendo...</span>
          </div>
        </Transition>

        <!-- Alerta de error global con transición Vue -->
        <Transition name="alert-fade">
          <div
            v-if="hasErrors"
            class="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-600 font-medium"
          >
            <AlertCircle class="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <strong class="block mb-1">Por favor corrige los siguientes errores:</strong>
              <ul class="list-disc list-inside space-y-0.5">
                <li v-for="(err, field) in errors" :key="field">{{ err }}</li>
              </ul>
            </div>
          </div>
        </Transition>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- 1. Título y Categoría usando Componente Reutilizable FormularioItem -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormularioItem
              label="Nombre de la pieza"
              v-model="form.title"
              :required="true"
              hint="Mínimo 3 caracteres"
              placeholder="Ej. Jarrón Ánfora de Gres"
              :error="errors.title"
              @blur="validateField('title')"
            />

            <FormularioItem
              label="Categoría"
              type="select"
              v-model="form.category"
              :required="true"
              placeholder="Selecciona una categoría"
              :options="categorySelectOptions"
              :error="errors.category"
              @change="handleCategoryChange"
              @blur="validateField('category')"
            />
          </div>

          <!-- 2. Precio y Stock usando FormularioItem -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormularioItem
              label="Precio ($ ARS)"
              type="number"
              step="100"
              min="1"
              v-model="form.priceNumber"
              :required="true"
              hint="Número positivo mayor a 0"
              placeholder="Ej. 45000"
              :error="errors.priceNumber"
              @blur="validateField('priceNumber')"
            />

            <FormularioItem
              label="Unidades en Stock"
              type="number"
              min="0"
              step="1"
              v-model="form.stockCount"
              :required="true"
              hint="Entero mayor o igual a 0"
              placeholder="Ej. 5"
              :error="errors.stockCount"
              @blur="validateField('stockCount')"
            />
          </div>

          <!-- 3. Selección / Asignación de Imagen -->
          <div>
            <label class="block text-xs font-semibold text-[#1E1B18] mb-1.5 uppercase tracking-wider">
              Fotografía de la pieza *
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <button
                type="button"
                v-for="img in sampleImages"
                :key="img.fileName"
                @click="form.fileName = img.fileName; form.imageSrc = img.src; errors.imageSrc = ''"
                class="p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer bg-[#FAF7F2]"
                :class="[form.fileName === img.fileName ? 'border-[#F28482] ring-2 ring-[#F28482]/20 bg-white' : 'border-[#E6DFD5] hover:border-[#D5CDC2]']"
              >
                <img :src="img.src" :alt="img.label" class="w-full aspect-square object-cover rounded-lg bg-white" />
                <span class="text-[10px] font-medium text-[#1E1B18] truncate w-full text-center">{{ img.label }}</span>
              </button>
            </div>

            <!-- Campo manual de imagen usando FormularioItem -->
            <FormularioItem
              label="Ruta o URL de Imagen"
              v-model="form.imageSrc"
              placeholder="O ingresa la ruta personalizada (/assets/aistudio/...)"
              :error="errors.imageSrc"
              @blur="validateField('imageSrc')"
            />
          </div>

          <!-- 4. Descripción breve y Descripción completa usando FormularioItem -->
          <FormularioItem
            label="Descripción resumida"
            type="textarea"
            :rows="2"
            :minLength="15"
            v-model="form.description"
            :required="true"
            hint="Mínimo 15 caracteres"
            placeholder="Breve resumen que aparece en las tarjetas del catálogo..."
            :error="errors.description"
            @blur="validateField('description')"
          />

          <FormularioItem
            label="Descripción detallada"
            type="textarea"
            :rows="3"
            v-model="form.longDescription"
            hint="Opcional"
            placeholder="Detalles sobre el proceso de modelado, inspiración artesanal, tonalidades de cocción..."
          />

          <!-- 5. Dimensiones y Material usando FormularioItem -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormularioItem
              label="Dimensiones / Medidas"
              v-model="form.dimensions"
              :required="true"
              placeholder="Ej. 24 cm alto × 18 cm diámetro"
              :error="errors.dimensions"
              @blur="validateField('dimensions')"
            />

            <FormularioItem
              label="Tipo de arcilla / Material"
              v-model="form.material"
              :required="true"
              placeholder="Ej. Gres blanco alta temperatura (1260 °C)"
              :error="errors.material"
              @blur="validateField('material')"
            />
          </div>

          <!-- 6. Esmalte y Cuidados usando FormularioItem -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormularioItem
              label="Esmalte y Acabado"
              v-model="form.glaze"
              hint="Opcional"
              placeholder="Ej. Esmalte tiza mate formulado en taller"
            />

            <FormularioItem
              label="Guía de cuidados"
              v-model="form.careGuide"
              hint="Opcional"
              placeholder="Ej. Apto lavavajillas y microondas"
            />
          </div>

          <!-- Botones de Acción -->
          <div class="flex items-center justify-end gap-4 pt-6 border-t border-[#E6DFD5]">
            <router-link
              to="/catalogo"
              class="px-6 py-3.5 text-xs font-semibold text-[#6B655D] hover:text-[#1E1B18] hover:bg-[#FAF7F2] rounded-xl border border-[#E6DFD5] transition-colors"
            >
              Cancelar
            </router-link>

            <button
              type="submit"
              class="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#F28482] hover:bg-[#E06F6D] text-white text-xs font-semibold rounded-xl shadow-sm transition-all hover:shadow-md cursor-pointer"
            >
              <Save class="w-4 h-4" />
              <span>{{ isEditing ? 'Guardar Cambios' : 'Crear Registro' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import {
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Save,
} from 'lucide-vue-next';
import { ceramicsService } from '../services/ceramicsService';
import FormularioItem from '../components/FormularioItem.vue';

export default {
  name: 'PieceFormView',
  components: {
    ArrowLeft,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Save,
    FormularioItem,
  },
  data() {
    return {
      saveSuccess: false,
      hasAttemptedSubmit: false,
      errors: {},
      sampleImages: [
        { fileName: 'jarron__4__f484adc2.jpg', src: '/assets/aistudio/jarron__4__f484adc2.jpg', label: 'Jarrón Arena' },
        { fileName: 'jarron__1__755d8979.jpg', src: '/assets/aistudio/jarron__1__755d8979.jpg', label: 'Jarrón Botella' },
        { fileName: 'jarron__5__5d25a996.jpg', src: '/assets/aistudio/jarron__5__5d25a996.jpg', label: 'Florero Blanco' },
        { fileName: 'plato__5__8b9b7d4c.jpg', src: '/assets/aistudio/plato__5__8b9b7d4c.jpg', label: 'Plato Moteado' },
        { fileName: 'cenicero__1__e8f54514.jpg', src: '/assets/aistudio/cenicero__1__e8f54514.jpg', label: 'Cenicero Geométrico' },
        { fileName: 'cenicero__2__be55122e.jpg', src: '/assets/aistudio/cenicero__2__be55122e.jpg', label: 'Cenicero Rústico' },
        { fileName: 'cenicero_cebc1b7e.jpg', src: '/assets/aistudio/cenicero_cebc1b7e.jpg', label: 'Cenicero Terracota' },
        { fileName: 'joyero_01a29807.jpg', src: '/assets/aistudio/joyero_01a29807.jpg', label: 'Joyero con Tapa' },
        { fileName: 'decoracion__1__53301f24.jpg', src: '/assets/aistudio/decoracion__1__53301f24.jpg', label: 'Escultura Orgánica' },
        { fileName: 'decoracion__2__623e7191.jpg', src: '/assets/aistudio/decoracion__2__623e7191.jpg', label: 'Pieza Texturada' },
        { fileName: 'decoracion__3__01659f07.jpg', src: '/assets/aistudio/decoracion__3__01659f07.jpg', label: 'Centro Ondulado' },
        { fileName: 'decoracion__4__26b0421d.jpg', src: '/assets/aistudio/decoracion__4__26b0421d.jpg', label: 'Tótem Barro' },
        { fileName: 'cindy-bartillon-THtfRdrK0nI-unsplash_056b3615.jpg', src: '/assets/aistudio/cindy-bartillon-THtfRdrK0nI-unsplash_056b3615.jpg', label: 'Jarrón Solitario' },
        { fileName: 'tom-crew-YA2E3d7a9Wo-unsplash_dd7ed7a8.jpg', src: '/assets/aistudio/tom-crew-YA2E3d7a9Wo-unsplash_dd7ed7a8.jpg', label: 'Platos Hondos Pasta' },
        { fileName: 'evelyn-verdin-2iIEfns94pE-unsplash_bf29834f.jpg', src: '/assets/aistudio/evelyn-verdin-2iIEfns94pE-unsplash_bf29834f.jpg', label: 'Joyeros Corazón' },
        { fileName: 'cuong-duyen-ceramics-ZBG9u5KF0Wk-unsplash_321a2a38.jpg', src: '/assets/aistudio/cuong-duyen-ceramics-ZBG9u5KF0Wk-unsplash_321a2a38.jpg', label: 'Vasija Dinastía' },
      ],
      categorySelectOptions: [
        { value: 'jarrones', label: 'Jarrones' },
        { value: 'platos', label: 'Platos' },
        { value: 'decoracion', label: 'Decoración' },
        { value: 'ceniceros', label: 'Ceniceros' },
        { value: 'joyeros', label: 'Joyeros' },
        { value: 'vasijas', label: 'Vasija' },
      ],
      categoryLabels: {
        jarrones: 'JARRONES',
        platos: 'PLATOS',
        decoracion: 'DECORACIÓN',
        ceniceros: 'CENICEROS',
        joyeros: 'JOYEROS',
        vasijas: 'VASIJA',
        vajilla: 'VASIJA',
      },
      form: {
        title: '',
        category: 'jarrones',
        categoryLabel: 'JARRONES',
        priceNumber: '',
        stockCount: 5,
        description: '',
        longDescription: '',
        dimensions: '',
        material: 'Gres cocido a 1260 °C',
        glaze: 'Esmalte mineral artesanal',
        careGuide: 'Apto para lavavajillas',
        fileName: 'jarron__4__f484adc2.jpg',
        imageSrc: '/assets/aistudio/jarron__4__f484adc2.jpg',
      },
    };
  },
  // Propiedades computadas requeridas
  computed: {
    isEditing() {
      return Boolean(this.$route.params.id);
    },
    hasErrors() {
      return this.hasAttemptedSubmit && Object.keys(this.errors).length > 0;
    },
  },
  // Hooks del ciclo de vida requeridos: created() y mounted()
  created() {
    console.log('[Ciclo de Vida] PieceFormView creado (created hook)');
  },
  mounted() {
    console.log('[Ciclo de Vida] PieceFormView montado (mounted hook)');
    if (this.isEditing) {
      const existing = ceramicsService.getById(this.$route.params.id);
      if (existing) {
        Object.assign(this.form, {
          title: existing.title,
          category: existing.category,
          categoryLabel: existing.categoryLabel,
          priceNumber: existing.priceNumber,
          stockCount: existing.stockCount ?? 1,
          description: existing.description,
          longDescription: existing.longDescription || '',
          dimensions: existing.dimensions || '',
          material: existing.material || '',
          glaze: existing.glaze || '',
          careGuide: existing.careGuide || '',
          fileName: existing.fileName || 'jarron__4__f484adc2.jpg',
          imageSrc: existing.imageSrc || '/assets/aistudio/jarron__4__f484adc2.jpg',
        });
      } else {
        this.$router.push('/catalogo');
      }
    }
  },
  methods: {
    handleCategoryChange(val) {
      this.form.category = val;
      this.form.categoryLabel = this.categoryLabels[val] || val.toUpperCase();
      this.validateField('category');
    },

    validateField(fieldName) {
      delete this.errors[fieldName];

      if (fieldName === 'title') {
        if (!this.form.title || this.form.title.trim().length === 0) {
          this.errors.title = 'El nombre de la pieza es obligatorio.';
        } else if (this.form.title.trim().length < 3) {
          this.errors.title = 'El nombre debe tener al menos 3 caracteres.';
        }
      }

      if (fieldName === 'category') {
        if (!this.form.category) {
          this.errors.category = 'Debes seleccionar una categoría válida.';
        }
      }

      if (fieldName === 'priceNumber') {
        const p = Number(this.form.priceNumber);
        if (this.form.priceNumber === '' || this.form.priceNumber === null || isNaN(p)) {
          this.errors.priceNumber = 'El precio es obligatorio.';
        } else if (p <= 0) {
          this.errors.priceNumber = 'El precio debe ser un número positivo mayor que 0.';
        }
      }

      if (fieldName === 'stockCount') {
        const s = Number(this.form.stockCount);
        if (this.form.stockCount === '' || isNaN(s) || s < 0) {
          this.errors.stockCount = 'El stock debe ser un número entero mayor o igual a 0.';
        }
      }

      if (fieldName === 'description') {
        if (!this.form.description || this.form.description.trim().length === 0) {
          this.errors.description = 'La descripción resumida es obligatoria.';
        } else if (this.form.description.trim().length < 15) {
          this.errors.description = 'La descripción debe tener al menos 15 caracteres.';
        }
      }

      if (fieldName === 'dimensions') {
        if (!this.form.dimensions || this.form.dimensions.trim().length === 0) {
          this.errors.dimensions = 'Las dimensiones son obligatorias (ej. 20 cm x 15 cm).';
        }
      }

      if (fieldName === 'material') {
        if (!this.form.material || this.form.material.trim().length === 0) {
          this.errors.material = 'El material es obligatorio.';
        }
      }

      if (fieldName === 'imageSrc') {
        if (!this.form.imageSrc || this.form.imageSrc.trim().length === 0) {
          this.errors.imageSrc = 'Debes asignar una imagen válida para la pieza.';
        }
      }
    },

    validateAll() {
      this.validateField('title');
      this.validateField('category');
      this.validateField('priceNumber');
      this.validateField('stockCount');
      this.validateField('description');
      this.validateField('dimensions');
      this.validateField('material');
      this.validateField('imageSrc');

      return Object.keys(this.errors).length === 0;
    },

    handleSubmit() {
      this.hasAttemptedSubmit = true;
      if (!this.validateAll()) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (this.isEditing) {
        const updated = ceramicsService.update(this.$route.params.id, { ...this.form });
        if (updated) {
          this.saveSuccess = true;
          setTimeout(() => {
            this.$router.push(`/piezas/${updated.id}`);
          }, 900);
        }
      } else {
        const created = ceramicsService.create({ ...this.form });
        this.saveSuccess = true;
        setTimeout(() => {
          this.$router.push(`/piezas/${created.id}`);
        }, 900);
      }
    },
  },
};
</script>

<style scoped>
.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.alert-fade-enter-from,
.alert-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
