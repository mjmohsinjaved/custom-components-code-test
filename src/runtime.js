// TODO 5: Implement $mvt global runtime
// This is a global object that should be available to all compiled components

window.$mvt = {
  currentUser: () => ({
    id: "test-user",
    name: "Test User",
  }),
  store: {
    // Your implementation here (localStorage is fine)
    getItem: async (key) => {
      // Implement localStorage get
    },
    setItem: async (key, value) => {
      // Implement localStorage set
    },
  },
}

export default window.$mvt
