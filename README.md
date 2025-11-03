# Code Test: Movement Component System Prototype

Build a standalone prototype that demonstrates the core Movement component system architecture.

## What You're Building

A simple web app that:
1. Lets users write Vue components in a CodeMirror editor
2. Compiles them using WebContainers
3. Extracts props automatically
4. Renders the component with a props UI
5. Provides the $mvt global runtime

## Getting Started

### Prerequisites
- Node.js 18+ installed
- A modern browser (Chrome/Edge recommended for WebContainer support)

### Setup (2 minutes)

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will open at `http://localhost:3000`

**Important:** WebContainers require special CORS headers which are configured in `vite.config.js`. The dev server must be running for the app to work properly.

## Your Task

This is a Vue 3 application. Complete the TODOs in the following files:

### `src/App.vue`
1. **TODO 1**: Initialize WebContainer and compile Vue SFC when the user clicks "Compile Component"
2. **TODO 2**: Extract props from the Vue component and convert to JSON Schema format
   - Parse the Vue component's `props` definition
   - Convert Vue types (String, Number) to JSON Schema types (string, number)
   - Extract `default` values and `mvt.description` into the schema
   - Map `mvt.min`/`mvt.max` to `minimum`/`maximum` for number types
   - Return a proper JSON Schema object (see [JSON Schema spec](https://json-schema.org/))
   - The schema will automatically display in the right panel
3. **TODO 4**: Mount the compiled component in the preview panel

### `src/runtime.js`
4. **TODO 5**: Implement the `$mvt.store` methods (localStorage is recommended)

A sample Vue component is provided in the CodeMirror editor to help you get started. It includes props with custom `mvt` metadata that should be extracted. The app structure and reactive data bindings are already set up - you just need to implement the compilation, extraction, and mounting logic.

## Deliverables

1. GitHub repo with your completed solution
2. Update this README with your architectural decisions and any notes

## Time Limit: 24 hours

## Your Notes

### Implementation Summary

✅ All 4 TODOs successfully completed with modular, production-ready architecture.

### Key Architectural Decision: Modular Refactoring

**Challenge**: Original App.vue was 636 lines with mixed concerns (UI, compilation, mounting, state management).

**Solution**: Refactored into modular architecture using Vue 3 Composition API:

```
src/
├── App.vue (65 lines) - Main orchestration
├── components/        - UI components
│   ├── CodeEditor.vue
│   ├── PropsPanel.vue
│   └── ComponentPreview.vue
├── composables/       - Reusable business logic
│   ├── useWebContainer.js
│   ├── useComponentCompiler.js
│   ├── useComponentMount.js
│   └── usePropsSchema.js
└── utils/             - Shared constants
    ├── buildScript.js
    └── sampleComponent.js
```

**Result**: 90% reduction in main component complexity, better maintainability and testability.

### Implementation Approach

**TODO 1 - WebContainer & Compilation**:
- Singleton pattern for WebContainer to prevent multiple boot processes
- Separated filesystem setup, dependency installation, and compilation logic
- Files: `useWebContainer.js`, `useComponentCompiler.js`

**TODO 2 - Props Extraction & JSON Schema**:
- Parse Vue SFC using `@vue/compiler-sfc` inside WebContainer
- Safe evaluation using Node.js VM module
- Converts Vue types to JSON Schema (String→string, Number→number)
- Extracts MVT metadata (description, min/max)
- Files: `buildScript.js`, `usePropsSchema.js`

**TODO 4 - Component Mounting**:
- Three-step process: extract definition, create render function, mount to DOM
- Reactive updates via watchers when props change
- Proper cleanup on unmount
- Files: `useComponentMount.js`, `ComponentPreview.vue`

**TODO 5 - $mvt.store**:
- localStorage wrapper with JSON serialization
- Async interface for future scalability
- Error handling with try-catch
- File: `runtime.js`

### Technical Benefits

- **Maintainability**: Small, focused files (avg 80 lines) vs one 636-line file
- **Testability**: Each composable can be unit tested independently
- **Reusability**: Composables can be used in other components
- **Performance**: WebContainer singleton, efficient reactive updates
- **Error Handling**: Dedicated error states and user-friendly messages

### Testing Verification

✅ Component compilation works
✅ Props schema extraction displays correctly
✅ Dynamic input fields generated based on prop types
✅ Live preview updates when props change
✅ localStorage persistence ($mvt.store) functional

