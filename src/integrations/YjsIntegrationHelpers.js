import * as Y from "yjs";
// import { WebsocketProvider } from "y-websocket";
import store from "../store/index";

let doc = null;
let wsProvider = null;
export default {
  doc,
  wsProvider,
  connectToRoom(credentials) {
    let credential = credentials?.yatt;
    if (credential && credential.length > 0) credential = credential[0];
    // let user_id = credential?.user?.id || "guest";
    const ydoc = new Y.Doc();
    // const provider = new WebsocketProvider(
    //   "ws://localhost:4444",
    //   `yattie-share-${user_id}`,
    //   ydoc
    // );
    // provider.on("status", (event) => {
    //   console.log({ status: event.status, ydoc }); // logs "connected" or "disconnected"
    // });
    this.doc = ydoc;
    // this.wsProvider = provider;
    return this.doc.getArray("stateArray").get(0);
  },
  updateState(state) {
    if (
      !this.doc &&
      state.credentials &&
      state.credentials.jira &&
      state.credentials.jira.length > 0
    ) {
      this.connectToRoom(state.credentials.jira[0].user.id);
    }
    let credential = state.auth.credentials?.yatt[0];
    if (credential && !this.doc) {
      this.connectToRoom(credential.user.id);
    }
    const yarray = this.doc.getArray("stateArray");
    if (!this.doc.getArray("stateArray").get(0)) {
      this.doc.getArray("stateArray").insert(0, [state]);
    } else {
      this.doc.getArray("stateArray").insert(0, [state]);
    }

    yarray.observe((event) => {
      event.currentTarget.doc.share.get("stateArray").get(0);
    });

    this.doc.on("update", () => {
      // Send the update to the server
      // this.wsProvider.ws.send(JSON.stringify(update));
      // if (this.wsProvider.ws.readyState === WebSocket.OPEN) {
      //   this.wsProvider.ws.send(JSON.stringify(update));
      // }
    });

    return this.doc;
  },
  updateRoomState(state) {
    if (!this.doc.getArray("stateArray").get(0)) {
      this.doc.getArray("stateArray").insert(0, [state]);
    } else {
      this.doc.getArray("stateArray").insert(0, [state]);
    }

    const yarray = this.doc.getArray("stateArray");

    yarray.observe((event) => {
      store.commit(
        "updateFromNetwork",
        event.currentTarget.doc.share.get("stateArray").get(0)
      );
    });
  },
};
