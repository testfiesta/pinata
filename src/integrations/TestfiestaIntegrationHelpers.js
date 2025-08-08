import { IPC_HANDLERS, IPC_FUNCTIONS } from "../modules/constants";
import axios from "axios";
import dayjs from "dayjs";

export default {
  async getHeaders(credential) {
    let authHeader = { headers: {} };
    if (credential.type === "bearer")
      authHeader = {
        headers: {
          Authorization: `Bearer ${credential.accessToken}`,
          Accept: "application/json",
        },
      };
    else if (credential.type === "cookie")
      authHeader = {
        headers: {
          Accept: "application/json",
        },
        withCredentials: true,
      };

    return authHeader;
  },
  async saveSession(credentials) {
    if (!credentials?.testfiesta || credentials?.testfiesta.length < 1) {
      const url = `${process.env.VUE_APP_TESTFIESTA_API_URL}/app/signup/token`;
      const newCredentialsResponse = await axios.get(url);
      this.saveCredentials(credentials, newCredentialsResponse.data);
    }

    // Pull case and session data
    const url = `${process.env.VUE_APP_TESTFIESTA_API_URL}/pinata/executions`;
    const state = await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.GET_STATE,
    });

    const credential = credentials?.testfiesta[0];
    const options = {
      headers: this.getHeaders(credential),
    };

    // Post to TestFiesta
    let returnResponse = {
      link: "",
    };
    await axios
      .patch(url, state, options)
      .then((postedSession) => {
        returnResponse = postedSession.data;
      })
      .catch((error) => {
        returnResponse.error = error.response.data.errors;
      });

    // Take signed attachment URLs and upload them
    returnResponse.steps.map(async (step) => {
      if (step.uploadURL) {
        const match = state.session.items.find(
          (item) => item.stepID === step.external_id
        );
        if (match?.filePath) {
          const sanitizedPath =
            match.filePath.substring(match.filePath.length - 1) !== "?"
              ? match.filePath
              : match.filePath.substring(0, match.filePath.length - 1);
          const fetchResponse = await fetch(`file://${sanitizedPath}`);
          const fileBlob = await fetchResponse.blob();
          const file = new File([fileBlob], step.uid, { type: match.fileType });
          await axios
            .put(step.uploadURL, file, {
              headers: {
                "Content-Type": match.fileType,
                "X-Upload-Content-Length": match.fileSize,
              },
            })
            .catch((error) => {
              returnResponse.error.push(...error.response.data.errors);
            });
        }
      }
    });

    // Return result (with generated "link" field)
    return returnResponse;
  },
  saveCredentials(credentials, data) {
    let formattedData = this.formatData(data);

    if (!credentials) {
      credentials = {};
    }

    if (credentials.testfiesta && credentials.testfiesta.length > 0) {
      let matched = false;
      for (const [index, credential] of credentials.testfiesta.entries()) {
        if (credential.user.id === formattedData.user.id) {
          credentials.testfiesta[index] = formattedData;
          matched = true;
        }
      }
      if (!matched) {
        credentials.testfiesta.push(formattedData);
      }
    } else {
      credentials.testfiesta = [formattedData];
    }

    window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.UPDATE_CREDENTIALS,
      data: credentials,
    });

    return credentials;
  },
  formatData(data) {
    return {
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
    };
  },
};
