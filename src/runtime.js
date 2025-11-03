// TODO 5: Implement $mvt global runtime
// This is a global object that should be available to all compiled components

window.$mvt = {
  currentUser: () => ({
    id: "test-user",
    name: "Test User",
  }),
  store: {
    /**
     * Get item from localStorage
     * @param {string} key - The key to retrieve
     * @returns {Promise<any>} The stored value (parsed from JSON)
     */
    getItem: async (key) => {
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.error('Error getting item from store:', error);
        return null;
      }
    },
    /**
     * Set item in localStorage
     * @param {string} key - The key to store
     * @param {any} value - The value to store (will be JSON stringified)
     * @returns {Promise<void>}
     */
    setItem: async (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error('Error setting item in store:', error);
        throw error;
      }
    },
  },
}

export default window.$mvt
