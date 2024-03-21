import axios from "axios";
import dayjs from "dayjs";
import StorageInterface from "../storageInterface";
import store from "@/store";

export default class RestApiService extends StorageInterface {
  async getState() {
    const response = await axios.get(`http://localhost:3000/state`);
    return response.data;
  }

  async updateState(state) {
    const data = {
      case: state.case,
      session: state.session,
    };
    const credential = state.auth.credentials?.yatt[0];
    let authHeader;
    authHeader = `Bearer ${credential.accessToken}`;
    const options = {
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
    };
    let returnResponse = {
      link: "",
    };
    await axios
      .patch(`http://localhost:5000/v1/yattie/executions`, data, options)
      .then((postedSession) => {
        returnResponse = postedSession.data;
      })
      .catch((error) => {
        returnResponse.error = error.response.data.errors;
      });

    if (returnResponse?.steps) {
      returnResponse.steps.map(async (step) => {
        if (step.uploadURL) {
          const match = state.session.items.find(
            (item) => item.stepID === step.external_id
          );
          if (match?.filePath) {
            const fetchResponse = await fetch(match.filePath);
            const fileBlob = await fetchResponse.blob();
            const file = new File([fileBlob], step.uid, {
              type: match.fileType,
            });
            await axios
              .put(step.uploadURL, file, {
                headers: {
                  "Content-Type": match.fileType,
                  "X-Upload-Content-Length": match.fileSize,
                },
              })
              .then((resp) => {
                console.log("File upload response");
                console.log(resp);
              })
              .catch((error) => {
                returnResponse.error.push(...error.response.data.errors);
              });
          }
        }
      });
    }
    if (returnResponse?.data) {
      store.commit("setSessionIDFromBackend", returnResponse.data.sessionID);
      store.commit("setCaseIDFromBackend", returnResponse.data.caseID);
    }
  }

  async getConfig() {
    const response = await axios.get(
      `http://localhost:5000/v1/app/org/2f6cb8ea-e5c0-11ee-87ec-0242ac130002/config/5e0f71ff-987d-4240-85eb-df6adf568c31`
    );
    console.log(response);
    return response.data.config;
  }

  async updateConfig(config) {
    const response = await axios.put(
      `http://localhost:5000/v1/app/org/2f6cb8ea-e5c0-11ee-87ec-0242ac130002//config/5e0f71ff-987d-4240-85eb-df6adf568c31`,
      { config }
    );
    return response.data.config;
  }

  async getCredentials() {
    const { data } = await axios.get(
      "http://localhost:5000/v1/app/profile/token"
    );
    console.log(data);
    return {
      yatt: [
        {
          accessToken: data.accessToken,
          expiresAt: data.expiresAt,
          type: data.type || "bearer",
          loggedInAt: data.loggedInAt || dayjs().format("YYYY-MM-DD HH:mm:ss"),
          oauthTokenIds: data.oauthTokenIds,
          user: {
            id: data.user.uid,
            email: data.user.email,
            name: data.user.first_name + " " + data.user.last_name,
            avatar: data.user.avatar_url,
            locale: data.user.preferences?.locale,
            verified: data.user.preferences?.verified,
          },
          orgs: data.orgs,
        },
      ],
    };
  }

  async getMetaData() {}

  async updateCredentials(credentials) {
    console.log(credentials);
    // saving credentials endpoint here
  }

  async getItems() {
    // const response = await axios.get(`http://localhost:8082/items`);
    // return response.data;
    return [];
  }

  async getItemById(id) {
    console.log(id);
    const response = await axios.get(`http://localhost:8082/item`);
    return response.data;
  }

  async updateItems(items) {
    console.log(items);
    // saving state endpoint here
  }

  async deleteItems(items) {
    console.log(items);
  }

  async getNotes() {
    const response = await axios.get(`http://localhost:8082/notes`);
    return response.data;
  }

  async updateNotes(notes) {
    console.log(notes);
    // saving notes endpoint here
  }

  async createNewSession(data) {
    console.log(data);
  }

  async saveSession(data) {
    console.log(data);
  }

  async resetData() {
    console.log("Reset data request goes here");
  }

  async saveNote() {
    console.log("Save Note");
  }
}
