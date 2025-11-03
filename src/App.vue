<template>
  <div class="container">
    <CodeEditor
      :is-compiling="isCompiling"
      :compilation-error="compilationError"
      @compile="handleCompile"
    />

    <div class="right-panel">
      <PropsPanel
        :props-schema="propsSchema"
        :prop-values="propValues"
        @update:prop-values="propValues = $event"
      />

      <ComponentPreview
        :compiled-component="compiledComponent"
        :prop-values="propValues"
      />
    </div>
  </div>
</template>

<script>
import CodeEditor from './components/CodeEditor.vue';
import PropsPanel from './components/PropsPanel.vue';
import ComponentPreview from './components/ComponentPreview.vue';
import { useComponentCompiler } from './composables/useComponentCompiler';
import { usePropsSchema } from './composables/usePropsSchema';

export default {
  name: 'App',
  components: {
    CodeEditor,
    PropsPanel,
    ComponentPreview
  },
  setup() {
    // Composables
    const { compiledComponent, isCompiling, compilationError, compileComponent } = useComponentCompiler();
    const { propsSchema, propValues, updateSchema } = usePropsSchema();

    // Handle compilation from editor
    async function handleCompile(source) {
      try {
        const compiled = await compileComponent(source);
        updateSchema(compiled);
      } catch (error) {
        console.error('Compilation failed:', error);
      }
    }

    return {
      // State
      compiledComponent,
      isCompiling,
      compilationError,
      propsSchema,
      propValues,
      // Methods
      handleCompile
    };
  }
};
</script>
