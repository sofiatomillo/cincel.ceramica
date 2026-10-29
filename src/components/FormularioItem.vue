<template>
  <div class="space-y-1.5">
    <div class="flex items-center justify-between">
      <label class="block text-xs font-semibold text-[#1E1B18] uppercase tracking-wider">
        {{ label }} <span v-if="required" class="text-[#F28482]">*</span>
        <span v-if="hint" class="text-[#8D857B] font-normal normal-case ml-1">({{ hint }})</span>
      </label>
      <span v-if="showCounter" class="text-[11px] font-mono text-[#8D857B]">
        {{ characterLength }} / {{ minLength }} mín.
      </span>
    </div>

    <!-- Campo tipo textarea -->
    <textarea
      v-if="type === 'textarea'"
      :rows="rows || 3"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur')"
      :placeholder="placeholder"
      class="w-full px-4 py-3 text-sm bg-[#FAF7F2] border rounded-xl focus:outline-none transition-colors"
      :class="[hasError ? 'border-red-400 bg-red-50/30' : 'border-[#E6DFD5] focus:border-[#F28482]']"
    />

    <!-- Campo tipo select -->
    <select
      v-else-if="type === 'select'"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value); $emit('change', $event.target.value)"
      @blur="$emit('blur')"
      class="w-full px-4 py-3 text-sm bg-[#FAF7F2] border rounded-xl focus:outline-none transition-colors cursor-pointer"
      :class="[hasError ? 'border-red-400 bg-red-50/30' : 'border-[#E6DFD5] focus:border-[#F28482]']"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option
        v-for="opt in options"
        :key="opt.value || opt"
        :value="opt.value !== undefined ? opt.value : opt"
      >
        {{ opt.label !== undefined ? opt.label : opt }}
      </option>
    </select>

    <!-- Campo tipo input estándar (text, number, email, tel) -->
    <input
      v-else
      :type="type || 'text'"
      :step="step"
      :min="min"
      :value="modelValue"
      @input="$emit('update:modelValue', type === 'number' ? ($event.target.value === '' ? '' : Number($event.target.value)) : $event.target.value)"
      @blur="$emit('blur')"
      :placeholder="placeholder"
      class="w-full px-4 py-3 text-sm bg-[#FAF7F2] border rounded-xl focus:outline-none transition-colors"
      :class="[hasError ? 'border-red-400 bg-red-50/30' : 'border-[#E6DFD5] focus:border-[#F28482]']"
    />

    <!-- Mensaje de error visible -->
    <p v-if="hasError" class="text-xs text-red-500 flex items-center gap-1 mt-1 animate-fade-in">
      <AlertCircle class="w-3.5 h-3.5 shrink-0" />
      <span>{{ error }}</span>
    </p>
  </div>
</template>

<script>
import { AlertCircle } from 'lucide-vue-next';

export default {
  name: 'FormularioItem',
  components: {
    AlertCircle,
  },
  props: {
    label: {
      type: String,
      required: true,
    },
    modelValue: {
      type: [String, Number],
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
    placeholder: {
      type: String,
      default: '',
    },
    hint: {
      type: String,
      default: '',
    },
    error: {
      type: String,
      default: '',
    },
    required: {
      type: Boolean,
      default: false,
    },
    rows: {
      type: [Number, String],
      default: 3,
    },
    options: {
      type: Array,
      default: () => [],
    },
    step: {
      type: [Number, String],
      default: undefined,
    },
    min: {
      type: [Number, String],
      default: undefined,
    },
    minLength: {
      type: Number,
      default: 0,
    },
  },
  emits: ['update:modelValue', 'blur', 'change'],
  // Propiedades computadas requeridas
  computed: {
    hasError() {
      return Boolean(this.error && this.error.length > 0);
    },
    characterLength() {
      if (typeof this.modelValue === 'string') {
        return this.modelValue.length;
      }
      return 0;
    },
    showCounter() {
      return this.minLength > 0 && typeof this.modelValue === 'string';
    },
  },
  // Hooks del ciclo de vida
  created() {
    // Hook created ejecutado
  },
  mounted() {
    // Hook mounted ejecutado
  },
};
</script>
