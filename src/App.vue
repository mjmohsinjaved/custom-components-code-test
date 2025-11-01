<template>
  <div class="container">
    <div class="editor-panel">
      <h2>Component Editor</h2>
      <textarea ref="editorElement"></textarea>
      <button @click="compileComponent" class="compile-btn">
        Compile Component
      </button>
    </div>

    <div class="right-panel">
      <div class="props-panel">
        <h2>Props Schema</h2>
        <div class="props-schema">
          <!-- Displays extracted props as JSON schema -->
          <pre v-if="!propsSchema" class="empty-state">
Compile a component to see props schema</pre
          >
          <pre v-else>{{ JSON.stringify(propsSchema, null, 2) }}</pre>
        </div>

        <!-- Displays extracted props as input fields -->
        <div v-if="propsSchema?.properties" class="props-inputs">
          <h3>Props Values</h3>
          <div
            v-for="(propDef, propName) in propsSchema.properties"
            :key="propName"
            class="prop-input"
          >
            <label>{{ propName }}</label>
            <input
              v-if="propDef.type === 'string'"
              v-model="propValues[propName]"
              type="text"
              :placeholder="propDef.default"
            />
            <input
              v-else-if="propDef.type === 'number'"
              v-model.number="propValues[propName]"
              type="number"
              :placeholder="propDef.default"
              :min="propDef.minimum"
              :max="propDef.maximum"
            />
          </div>
        </div>
      </div>

      <div class="preview-panel">
        <h2>Component Preview</h2>
        <div ref="componentMount" class="component-mount">
          <!-- TODO 4: Compiled component will mount here -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/vue/vue.js";
import { WebContainer } from "@webcontainer/api";

export default {
  name: "App",
  setup() {
    const editorElement = ref(null);
    const componentMount = ref(null);
    const propsSchema = ref(null);
    const propValues = ref({});

    let editor = null;

    // Sample component to start with
    const sampleComponent = `<template>
  <div class="metric-card">
    <h3>{{ title }}</h3>
    <p>Count: {{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: 'My Counter',
      mvt: {
        type: 'text',
        description: 'Counter title'
      }
    },
    startValue: {
      type: Number,
      default: 0,
      mvt: {
        type: 'number',
        description: 'Starting value',
        min: 0,
        max: 100
      }
    }
  },
  data() {
    return {
      count: this.startValue
    }
  },
  methods: {
    async increment() {
      this.count++
      await $mvt.store.setItem('count', this.count)
    }
  }
}
<\/script>`;

    onMounted(() => {
      // Initialize CodeMirror
      editor = CodeMirror.fromTextArea(editorElement.value, {
        mode: "vue",
        theme: "default",
        lineNumbers: true,
      });

      editor.setValue(sampleComponent);
    });

    // TODO 1: Initialize WebContainer and compile Vue SFC
    async function compileComponentHandler() {
      const source = editor.getValue();
      console.log("Compiling component:", source);

      // Your implementation here
      // Should:
      // 1. Initialize WebContainer (if not already initialized)
      // 2. Compile the Vue SFC to JavaScript
      // 3. Extract props from the component
      // 4. Mount the component with the current prop values

      // Example structure:
      // const compiled = await compileVueSFC(source)
      // propsSchema.value = extractProps(source);
      // await mountComponent(compiled);
    }

    // TODO 2: Extract props from Vue component and convert to JSON Schema
    function extractProps(componentSource) {
      // Your implementation here
      // Parse the Vue component props and convert them to JSON Schema format
      //
      // Example output for the sample component:
      // {
      //   $schema: "https://json-schema.org/draft/2020-12/schema",
      //   type: "object",
      //   properties: {
      //     title: {
      //       type: "string",
      //       description: "Counter title",
      //       default: "My Counter",
      //     },
      //     startValue: {
      //       type: "number",
      //       description: "Starting value",
      //       default: 0,
      //       minimum: 0,
      //       maximum: 100,
      //     },
      //   },
      // }
      return null;
    }

    return {
      editorElement,
      componentMount,
      propsSchema,
      propValues,
      compileComponent: compileComponentHandler,
    };
  },
};
</script>
