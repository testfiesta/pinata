import RestApiService from "./storage-options/restApiService";
import LocalJsonDbService from "./storage-options/localJsonDbService";

export default class StorageService {
  constructor() {
    this.storage = navigator.userAgent.includes("Electron")
      ? new LocalJsonDbService()
      : new RestApiService();
  }

  async getState() {
    return await this.storage.getState();
  }

  async updateState(state) {
    return this.storage.updateState(state);
  }

  async getConfig() {
    return await this.storage.getConfig();
  }

  async updateConfig(config) {
    return await this.storage.updateConfig(config);
  }

  async getCredentials() {
    return await this.storage.getCredentials();
  }

  async getMetaData() {
    return await this.storage.getMetaData();
  }

  async updateCredentials(credentials) {
    return this.storage.updateCredentials(credentials);
  }

  async getItems() {
    return await this.storage.getItems();
  }

  async getItemById(id) {
    return await this.storage.getItemById(id);
  }

  async addItem(item) {
    return this.storage.addItem(item);
  }

  async updateItem(item) {
    return this.storage.updateItem(item);
  }
  async updateItems(items) {
    return this.storage.updateItems(items);
  }

  async deleteItems(items) {
    return this.storage.deleteItems(items);
  }

  async getNotes() {
    return await this.storage.getNotes();
  }

  async updateNotes(notes) {
    return this.storage.updateNotes(notes);
  }

  async createNewSession(data) {
    return this.storage.createNewSession(data);
  }

  async getSessionId() {
    return this.storage.getSessionId();
  }

  async getCaseId() {
    return this.storage.getCaseId();
  }

  async saveSession(data) {
    return await this.storage.saveSession(data);
  }

  async resetData() {
    return this.storage.resetData();
  }

  async saveNote(note) {
    return this.storage.saveNote(note);
  }
}
