/**
 * Sample component to start with in the editor
 */
export const SAMPLE_COMPONENT = `<template>
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
