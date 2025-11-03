import { ref, computed } from 'vue';

/**
 * Composable for managing component props schema and values
 * Handles schema extraction and prop value management
 */
export function usePropsSchema() {
  const propsSchema = ref(null);
  const propValues = ref({});

  /**
   * Check if schema has properties
   */
  const hasProperties = computed(() => {
    return propsSchema.value?.properties &&
           Object.keys(propsSchema.value.properties).length > 0;
  });

  /**
   * Update schema from compiled component
   */
  function updateSchema(compiledComponent) {
    if (!compiledComponent) {
      propsSchema.value = null;
      propValues.value = {};
      return;
    }

    propsSchema.value = compiledComponent.propsSchema || {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object",
      properties: {}
    };

    // Initialize prop values with defaults
    if (compiledComponent.propsSchema?.properties) {
      const newPropValues = {};
      for (const [propName, propDef] of Object.entries(compiledComponent.propsSchema.properties)) {
        newPropValues[propName] = propDef.default;
      }
      propValues.value = newPropValues;
    }
  }

  /**
   * Update a single prop value
   */
  function updatePropValue(propName, value) {
    propValues.value[propName] = value;
  }

  /**
   * Reset all prop values to defaults
   */
  function resetPropValues() {
    if (!propsSchema.value?.properties) {
      propValues.value = {};
      return;
    }

    const newPropValues = {};
    for (const [propName, propDef] of Object.entries(propsSchema.value.properties)) {
      newPropValues[propName] = propDef.default;
    }
    propValues.value = newPropValues;
  }

  /**
   * Get formatted schema for display
   */
  const formattedSchema = computed(() => {
    if (!propsSchema.value) return null;
    return JSON.stringify(propsSchema.value, null, 2);
  });

  return {
    propsSchema,
    propValues,
    hasProperties,
    formattedSchema,
    updateSchema,
    updatePropValue,
    resetPropValues
  };
}
