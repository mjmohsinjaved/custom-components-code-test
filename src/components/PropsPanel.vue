<template>
  <div class="props-panel">
    <h2>Props Schema</h2>
    <div class="props-schema">
      <pre v-if="!propsSchema" class="empty-state">
Compile a component to see props schema</pre>
      <pre v-else>{{ formattedSchema }}</pre>
    </div>

    <div v-if="hasProperties" class="props-inputs">
      <h3>Props Values</h3>
      <div
        v-for="(propDef, propName) in propsSchema.properties"
        :key="propName"
        class="prop-input"
      >
        <label>{{ propName }}</label>
        <input
          v-if="propDef.type === 'string'"
          :value="propValues[propName]"
          @input="updateValue(propName, $event.target.value)"
          type="text"
          :placeholder="propDef.default"
        />
        <input
          v-else-if="propDef.type === 'number'"
          :value="propValues[propName]"
          @input="updateValue(propName, Number($event.target.value))"
          type="number"
          :placeholder="propDef.default"
          :min="propDef.minimum"
          :max="propDef.maximum"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'PropsPanel',
  props: {
    propsSchema: {
      type: Object,
      default: null
    },
    propValues: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:propValues'],
  setup(props, { emit }) {
    const hasProperties = computed(() => {
      return props.propsSchema?.properties &&
             Object.keys(props.propsSchema.properties).length > 0;
    });

    const formattedSchema = computed(() => {
      return JSON.stringify(props.propsSchema, null, 2);
    });

    function updateValue(propName, value) {
      const updatedValues = { ...props.propValues, [propName]: value };
      emit('update:propValues', updatedValues);
    }

    return {
      hasProperties,
      formattedSchema,
      updateValue
    };
  }
};
</script>
