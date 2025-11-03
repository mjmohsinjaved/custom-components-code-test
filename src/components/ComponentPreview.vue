<template>
  <div class="preview-panel">
    <h2>Component Preview</h2>
    <div ref="componentMount" class="component-mount">
      <!-- Compiled component will mount here -->
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import { useComponentMount } from '../composables/useComponentMount';

export default {
  name: 'ComponentPreview',
  props: {
    compiledComponent: {
      type: Object,
      default: null
    },
    propValues: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const componentMount = ref(null);
    const { mountComponent, unmountComponent } = useComponentMount();

    // Watch for changes in compiled component or prop values
    watch(
      [() => props.compiledComponent, () => props.propValues],
      ([newCompiled, newPropValues]) => {
        if (newCompiled && componentMount.value) {
          mountComponent(newCompiled, componentMount.value, newPropValues);
        } else {
          unmountComponent();
        }
      },
      { deep: true, immediate: true }
    );

    return {
      componentMount
    };
  }
};
</script>
