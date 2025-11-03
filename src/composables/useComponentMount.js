import { ref, onBeforeUnmount } from 'vue';
import {
  createApp,
  openBlock,
  createElementBlock,
  createElementVNode,
  toDisplayString,
  createTextVNode,
  Fragment,
  createVNode,
  withCtx,
  renderList,
  createBlock,
  createCommentVNode
} from 'vue';

/**
 * Composable for mounting compiled Vue components
 * Handles component instantiation, render function creation, and lifecycle
 */
export function useComponentMount() {
  const appInstance = ref(null);
  const mountError = ref(null);

  /**
   * Vue render helpers available to compiled templates
   */
  const vueHelpers = {
    openBlock,
    createElementBlock,
    createElementVNode,
    toDisplayString,
    createTextVNode,
    Fragment,
    createVNode,
    withCtx,
    renderList,
    createBlock,
    createCommentVNode
  };

  /**
   * Extract component definition from compiled script
   */
  function extractComponentDefinition(script) {
    // Remove "export default" and extract the object
    const cleanedScript = script.trim().replace(/export\s+default\s+/, '');
    const scriptWrapper = `(${cleanedScript})`;
    return eval(scriptWrapper);
  }

  /**
   * Create render function from compiled template
   */
  function createRenderFunction(templateCode) {
    // Remove import statement
    let processedTemplate = templateCode.replace(
      /import\s+\{[^}]+\}\s+from\s+['"]vue['"];?\s*/g,
      ''
    );

    // Extract hoisted constants (defined before render function)
    const hoistedMatch = processedTemplate.match(/^([\s\S]*?)export function render/);
    const hoistedCode = hoistedMatch ? hoistedMatch[1].trim() : '';

    // Extract the render function body
    const renderMatch = processedTemplate.match(/export function render\(([^)]*)\)\s*\{([\s\S]*)\}$/);

    if (!renderMatch) {
      throw new Error('Failed to extract render function');
    }

    const body = renderMatch[2];

    // Create render function with Vue helpers in scope
    const renderFuncCode = `
      const _openBlock = vueHelpers.openBlock;
      const _createElementBlock = vueHelpers.createElementBlock;
      const _createElementVNode = vueHelpers.createElementVNode;
      const _toDisplayString = vueHelpers.toDisplayString;
      const _createTextVNode = vueHelpers.createTextVNode;
      const _Fragment = vueHelpers.Fragment;
      const _createVNode = vueHelpers.createVNode;
      const _withCtx = vueHelpers.withCtx;
      const _renderList = vueHelpers.renderList;
      const _createBlock = vueHelpers.createBlock;
      const _createCommentVNode = vueHelpers.createCommentVNode;

      // Hoisted constants
      ${hoistedCode}

      ${body}
    `;

    const renderFunc = new Function('_ctx', '_cache', 'vueHelpers', renderFuncCode);

    // Bind vueHelpers
    return function(_ctx, _cache) {
      return renderFunc.call(this, _ctx, _cache, vueHelpers);
    };
  }

  /**
   * Mount a compiled component to a DOM element
   */
  function mountComponent(compiledComponent, mountPoint, propValues = {}) {
    try {
      // Unmount previous instance
      unmountComponent();

      // Clear mount point
      if (mountPoint) {
        mountPoint.innerHTML = '';
      }

      if (!compiledComponent || !mountPoint) {
        console.log('No compiled component or mount point available');
        return;
      }

      console.log('Mounting component...');

      const { script, template: templateCode } = compiledComponent;

      // Extract component definition
      const componentDef = extractComponentDefinition(script);

      // Create render function
      const renderFunc = createRenderFunction(templateCode);

      // Create Vue app
      const app = createApp({
        ...componentDef,
        render: renderFunc || componentDef.render,
        setup(props) {
          // Call original setup if it exists
          const originalSetup = componentDef.setup;
          const setupResult = originalSetup ? originalSetup(props) : {};

          // Return merged result
          return {
            ...setupResult,
            ...propValues
          };
        }
      });

      // Provide global $mvt if available
      if (window.$mvt) {
        app.config.globalProperties.$mvt = window.$mvt;
      }

      // Provide props
      app.provide('props', propValues);

      // Mount the app
      appInstance.value = app;
      app.mount(mountPoint);

      console.log('Component mounted successfully');
      mountError.value = null;

    } catch (error) {
      console.error('Mounting error:', error);
      mountError.value = error.message;

      if (mountPoint) {
        mountPoint.innerHTML = `<div style="color: red; padding: 10px;">
          <strong>Mount Error:</strong><br>
          ${error.message}
        </div>`;
      }

      throw error;
    }
  }

  /**
   * Unmount the current component instance
   */
  function unmountComponent() {
    if (appInstance.value) {
      appInstance.value.unmount();
      appInstance.value = null;
    }
  }

  // Cleanup on composable unmount
  onBeforeUnmount(() => {
    unmountComponent();
  });

  return {
    appInstance,
    mountError,
    mountComponent,
    unmountComponent
  };
}
