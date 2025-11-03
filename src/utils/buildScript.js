/**
 * Build script for compiling Vue SFC components
 * This script runs inside WebContainer to compile Vue components
 */
export const BUILD_SCRIPT = `import fs from 'fs';
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';
import vm from 'vm';

const source = fs.readFileSync('./component.vue', 'utf-8');
const { descriptor, errors } = parse(source);

if (errors.length > 0) {
  console.error(JSON.stringify({ error: errors[0].message }));
  process.exit(1);
}

// Function to extract props and convert to JSON Schema
function extractPropsSchema(descriptor) {
  if (!descriptor.script && !descriptor.scriptSetup) {
    return null;
  }

  try {
    const scriptContent = descriptor.script?.content || descriptor.scriptSetup?.content;
    if (!scriptContent) return null;

    // Extract the component definition object
    const exportMatch = scriptContent.match(/export\\s+default\\s+({[\\s\\S]*})/);
    if (!exportMatch) return null;

    // Safely evaluate the component definition using VM
    const componentDefCode = exportMatch[1];
    const context = {
      String: String,
      Number: Number,
      Boolean: Boolean,
      Array: Array,
      Object: Object,
      Date: Date,
      Function: Function,
      Symbol: Symbol
    };

    const componentDef = vm.runInNewContext('(' + componentDefCode + ')', context);

    if (!componentDef.props) return null;

    // Convert Vue props to JSON Schema
    const properties = {};

    for (const [propName, propDef] of Object.entries(componentDef.props)) {
      // Handle shorthand syntax: props: { title: String }
      if (typeof propDef === 'function') {
        const typeName = propDef.name.toLowerCase();
        properties[propName] = { type: typeName };
        continue;
      }

      // Handle object syntax: props: { title: { type: String, default: ... } }
      if (typeof propDef === 'object' && propDef.type) {
        const vueType = propDef.type.name || propDef.type;
        const jsonType = (typeof vueType === 'string' ? vueType : vueType.name).toLowerCase();

        const schemaProp = { type: jsonType };

        // Add default value
        if (propDef.default !== undefined) {
          schemaProp.default = propDef.default;
        }

        // Extract MVT metadata
        if (propDef.mvt) {
          if (propDef.mvt.description) {
            schemaProp.description = propDef.mvt.description;
          }
          if (propDef.mvt.min !== undefined) {
            schemaProp.minimum = propDef.mvt.min;
          }
          if (propDef.mvt.max !== undefined) {
            schemaProp.maximum = propDef.mvt.max;
          }
        }

        properties[propName] = schemaProp;
      }
    }

    if (Object.keys(properties).length === 0) {
      return null;
    }

    return {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object",
      properties
    };
  } catch (error) {
    console.error('Error extracting props:', error);
    return null;
  }
}

try {
  // Compile script
  const compiledScript = compileScript(descriptor, {
    id: 'component',
    inlineTemplate: false
  });

  // Compile template
  const compiledTemplate = compileTemplate({
    source: descriptor.template?.content || '<div></div>',
    id: 'component',
    filename: 'component.vue'
  });

  // Extract props schema
  const propsSchema = extractPropsSchema(descriptor);

  // Combine into output
  const output = {
    script: compiledScript.content,
    template: compiledTemplate.code,
    hasTemplate: !!descriptor.template,
    propsSchema
  };

  console.log(JSON.stringify(output));
} catch (error) {
  console.error(JSON.stringify({ error: error.message }));
  process.exit(1);
}`;
