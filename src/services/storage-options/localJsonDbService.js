import StorageInterface from "../storageInterface";
import { IPC_FUNCTIONS, IPC_HANDLERS } from "@/modules/constants";

export default class LocalJsonDbService extends StorageInterface {
  async getState() {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.GET_STATE,
    });
  }

  async updateState(state) {
    window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.UPDATE_STATE,
      data: state,
    });
  }

  async getConfig() {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.GET_CONFIG,
    });
  }

  async updateConfig(config) {
    return window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.UPDATE_CONFIG,
      data: config,
    });
  }

  async getCredentials() {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.GET_CREDENTIALS,
    });
  }

  async getMetaData() {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.GET_METADATA,
    });
  }

  async updateCredentials(credentials) {
    window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.UPDATE_CREDENTIALS,
      data: credentials,
    });
  }

  async getItems() {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.GET_ITEMS,
    });
  }

  async getItemById(id) {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.GET_ITEM_BY_ID,
      data: id,
    });
  }

  async addItem(item) {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.ADD_ITEM,
      data: item,
    });
  }

  async updateItem(item) {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.UPDATE_ITEM,
      data: item,
    });
  }

  async updateItems(items) {
    window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.UPDATE_ITEMS,
      data: items,
    });
  }

  async deleteItems(items) {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.DELETE_ITEMS,
      data: items,
    });
  }

  async getNotes() {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.GET_NOTES,
    });
  }

  async updateNotes(notes) {
    await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.UPDATE_NOTES,
      data: notes,
    });
  }

  async deleteNotes(notes) {
    await await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.DELETE_NOTES,
      data: notes,
    });
  }

  async getNodes() {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.GET_NODES,
    });
  }

  async updateNodes(nodes) {
    await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.UPDATE_NODES,
      data: nodes,
    });
  }

  async getConnections() {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.GET_CONNECTIONS,
    });
  }

  async updateConnections(connections) {
    await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.UPDATE_CONNECTIONS,
      data: connections,
    });
  }

  async createNewSession(data) {
    return await window.ipc.invoke(IPC_HANDLERS.FILE_SYSTEM, {
      func: IPC_FUNCTIONS.CREATE_NEW_SESSION,
      data: data,
    });
  }

  async getSessionId() {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.GET_SESSION_ID,
    });
  }

  async getCaseId() {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.GET_CASE_ID,
    });
  }

  async saveSession(data) {
    return await window.ipc.invoke(IPC_HANDLERS.FILE_SYSTEM, {
      func: IPC_FUNCTIONS.SAVE_SESSION,
      data: data,
    });
  }

  async resetData(state) {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.RESET_DATA,
      data: state,
    });
  }
}
