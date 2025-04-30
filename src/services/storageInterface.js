export default class StorageInterface {
  // eslint-disable-next-line
  async getState(executionId) {
    throw new Error("Method 'getState()' must be implemented.");
  }

  // eslint-disable-next-line
  async updateState(state) {
    throw new Error("Method 'updateState()' must be implemented.");
  }

  async createConfig() {
    throw new Error("Method 'createConfig()' must be implemented.");
  }

  // eslint-disable-next-line
  async getConfig(config) {
    throw new Error("Method 'getConfig(config)' must be implemented.");
  }

  async getCredentials() {
    throw new Error("Method 'getCredentials()' must be implemented.");
  }

  // eslint-disable-next-line
  async updateCredentials(credentials) {
    throw new Error("Method 'updateCredentials()' must be implemented.");
  }

  async getItems() {
    throw new Error("Method 'fetchItems()' must be implemented.");
  }

  // eslint-disable-next-line
  async getItemById(id) {
    throw new Error("Method 'getItemById(id)' must be implemented.");
  }

  // eslint-disable-next-line
  async updateItems(state) {
    throw new Error("Method 'updateItems(state)' must be implemented.");
  }

  async getNotes() {
    throw new Error("Method 'getNotes()' must be implemented.");
  }

  // eslint-disable-next-line
  async updateNotes(notes) {
    throw new Error("Method 'updateNotes()' must be implemented.");
  }

  // eslint-disable-next-line
  async createNewSession(state) {
    throw new Error("Method 'createNewSession(state)' must be implemented.");
  }
}
