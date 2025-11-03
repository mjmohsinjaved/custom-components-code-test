import { ref } from 'vue';
import { WebContainer } from '@webcontainer/api';
import { BUILD_SCRIPT } from '../utils/buildScript';

/**
 * Composable for managing WebContainer instance
 * Handles initialization, setup, and filesystem operations
 */
export function useWebContainer() {
  const containerInstance = ref(null);
  const isBooting = ref(false);
  const bootError = ref(null);

  /**
   * Boot WebContainer and set up build environment
   * Only boots once - subsequent calls return existing instance
   */
  async function bootContainer() {
    if (containerInstance.value) {
      return containerInstance.value;
    }

    if (isBooting.value) {
      // Wait for ongoing boot to complete
      while (isBooting.value) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return containerInstance.value;
    }

    isBooting.value = true;
    bootError.value = null;

    try {
      console.log('Booting WebContainer...');
      containerInstance.value = await WebContainer.boot();
      console.log('WebContainer booted successfully');

      await setupFilesystem();
      await installDependencies();

      return containerInstance.value;
    } catch (error) {
      bootError.value = error.message;
      console.error('WebContainer boot failed:', error);
      throw error;
    } finally {
      isBooting.value = false;
    }
  }

  /**
   * Create filesystem structure and write necessary files
   */
  async function setupFilesystem() {
    const container = containerInstance.value;
    if (!container) throw new Error('Container not initialized');

    await container.fs.mkdir('/project', { recursive: true });

    // Write package.json
    await container.fs.writeFile(
      '/project/package.json',
      JSON.stringify({
        name: 'component-compiler',
        type: 'module',
        dependencies: {
          '@vue/compiler-sfc': '^3.4.0'
        }
      }, null, 2)
    );

    // Write build script
    await container.fs.writeFile('/project/build.js', BUILD_SCRIPT);
  }

  /**
   * Install npm dependencies in WebContainer
   */
  async function installDependencies() {
    const container = containerInstance.value;
    if (!container) throw new Error('Container not initialized');

    console.log('Installing dependencies...');
    const installProcess = await container.spawn('npm', ['install'], {
      cwd: '/project'
    });

    const exitCode = await installProcess.exit;
    if (exitCode !== 0) {
      throw new Error('Failed to install dependencies');
    }

    console.log('Dependencies installed successfully');
  }

  /**
   * Write component source to filesystem
   */
  async function writeComponentFile(source) {
    const container = containerInstance.value;
    if (!container) throw new Error('Container not initialized');

    await container.fs.writeFile('/project/component.vue', source);
  }

  /**
   * Run a node script in the WebContainer
   */
  async function runScript(scriptPath, args = [], options = {}) {
    const container = containerInstance.value;
    if (!container) throw new Error('Container not initialized');

    return await container.spawn('node', [scriptPath, ...args], {
      cwd: '/project',
      ...options
    });
  }

  return {
    containerInstance,
    isBooting,
    bootError,
    bootContainer,
    writeComponentFile,
    runScript
  };
}
