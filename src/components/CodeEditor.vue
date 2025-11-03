<template>
  <div class="editor-panel">
    <h2>Component Editor</h2>
    <textarea ref="editorElement"></textarea>
    <button @click="handleCompile" class="compile-btn" :disabled="isCompiling">
      {{ isCompiling ? 'Compiling...' : 'Compile Component' }}
    </button>
    <div v-if="compilationError" class="error-message">
      <strong>Error:</strong> {{ compilationError }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/vue/vue.js';
import { SAMPLE_COMPONENT } from '../utils/sampleComponent';

export default {
  name: 'CodeEditor',
  props: {
    isCompiling: {
      type: Boolean,
      default: false
    },
    compilationError: {
      type: String,
      default: null
    }
  },
  emits: ['compile'],
  setup(props, { emit }) {
    const editorElement = ref(null);
    let editor = null;

    onMounted(() => {
      editor = CodeMirror.fromTextArea(editorElement.value, {
        mode: 'vue',
        theme: 'default',
        lineNumbers: true
      });

      editor.setValue(SAMPLE_COMPONENT);
    });

    function handleCompile() {
      if (editor) {
        const source = editor.getValue();
        emit('compile', source);
      }
    }

    function getValue() {
      return editor ? editor.getValue() : '';
    }

    function setValue(value) {
      if (editor) {
        editor.setValue(value);
      }
    }

    return {
      editorElement,
      handleCompile,
      getValue,
      setValue
    };
  }
};
</script>

<style scoped>
.error-message {
  color: red;
  margin-top: 10px;
  padding: 10px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
}
</style>
