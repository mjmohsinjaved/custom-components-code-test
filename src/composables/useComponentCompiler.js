import { ref } from 'vue';
import { useWebContainer } from './useWebContainer';

/**
 * Composable for compiling Vue SFC components
 * Handles compilation logic and output parsing
 */
export function useComponentCompiler() {
  const { bootContainer, writeComponentFile, runScript } = useWebContainer();

  const compiledComponent = ref(null);
  const isCompiling = ref(false);
  const compilationError = ref(null);

  /**
   * Read process output with timeout
   */
  async function readWithTimeout(reader, timeoutMs) {
    let result = '';
    const timeout = setTimeout(() => {
      console.log('Read timeout reached');
    }, timeoutMs);

    try {
      while (true) {
        const readPromise = reader.read();
        const timeoutPromise = new Promise((resolve) =>
          setTimeout(() => resolve({ done: true, value: null }), timeoutMs)
        );

        const { done, value } = await Promise.race([readPromise, timeoutPromise]);

        if (done) break;
        if (value) {
          const text = typeof value === 'string' ? value : new TextDecoder().decode(value);
          result += text;
        }
      }
    } finally {
      clearTimeout(timeout);
    }

    return result;
  }

  /**
   * Compile a Vue component source
   */
  async function compileComponent(source) {
    isCompiling.value = true;
    compilationError.value = null;

    try {
      console.log('Compiling component...');

      // Boot WebContainer if needed
      await bootContainer();

      // Write component to filesystem
      await writeComponentFile(source);

      // Run compilation script
      console.log('Running Vue SFC compiler...');
      const compileProcess = await runScript('build.js');

      const reader = compileProcess.output.getReader();
      const output = await readWithTimeout(reader, 10000);

      const exitCode = await compileProcess.exit;
      console.log('Compilation exit code:', exitCode);

      if (exitCode !== 0 || !output.trim()) {
        throw new Error('Compilation failed. Exit code: ' + exitCode);
      }

      // Parse compiled output
      const compiled = JSON.parse(output.trim());
      compiledComponent.value = compiled;

      console.log('Component compiled successfully');
      return compiled;

    } catch (error) {
      console.error('Compilation error:', error);
      compilationError.value = error.message;
      throw error;
    } finally {
      isCompiling.value = false;
    }
  }

  /**
   * Reset compilation state
   */
  function resetCompilation() {
    compiledComponent.value = null;
    compilationError.value = null;
  }

  return {
    compiledComponent,
    isCompiling,
    compilationError,
    compileComponent,
    resetCompilation
  };
}
