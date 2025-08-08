import { IPC_HANDLERS, IPC_FUNCTIONS } from "../modules/constants";
import axios from "axios";

const ZEPHYR_SQUAD_URL = "https://prod-api.zephyr4jiracloud.com/v2";

export default {
  saveCredentials(credentials, data) {
    let formattedData = this.formatData(data);

    if (!credentials) {
      credentials = {};
    }

    if (credentials.zephyrSquad && credentials.zephyrSquad.length > 0) {
      let matched = false;
      for (const [zephyrSquadIndex, credential] of Object.entries(
        credentials.zephyrSquad
      )) {
        if (credential.user.client_id === formattedData.user.client_id) {
          credentials.zephyrSquad[zephyrSquadIndex] = formattedData;
          matched = true;
        }
      }
      if (!matched) {
        credentials.zephyrSquad.push(formattedData);
      }
    } else {
      credentials.zephyrSquad = [formattedData];
    }

    window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.UPDATE_CREDENTIALS,
      data: credentials,
    });

    return credentials;
  },

  formatData(data) {
    return {
      accessToken: data.auth_token,
      type: "zephyrSquad",
      url: "smartbear.com/test-management/zephyr-squad/",
      loggedInAt: data.loggedInAt,
      lastRefreshed: data.lastRefreshed,
      user: {},
    };
  },

  async fetchProjects(authToken) {
    const url = `${ZEPHYR_SQUAD_URL}/projects`;
    const authHeader = `Bearer ${authToken}`;
    let header = {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    };

    return await axios
      .get(url, header)
      .then((response) => {
        if (response.status === 200) {
          console.log("Fetched Projects");

          return response.data.values;
        }
      })
      .catch((error) => {
        console.error("Error fetching projects: ", error);
        throw new Error(error.message);
      });
  },

  async fetchTestCycles(authToken, projectKey) {
    const url = `${ZEPHYR_SQUAD_URL}/testcycles?projectKey=${projectKey}`;
    const authHeader = `Bearer ${authToken}`;
    let header = {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    };

    return await axios
      .get(url, header)
      .then((response) => {
        console.log("Fetched Test Cycles");

        return response.data.values;
      })
      .catch((error) => {
        console.error("Error fetching test cycles: ", error);
        throw new Error(error.message);
      });
  },

  async fetchTestExecutions(authToken, projectKey, testCycleKey) {
    const url = `${ZEPHYR_SQUAD_URL}/testexecutions?projectKey=${projectKey}&testCycle=${testCycleKey}`;
    const authHeader = `Bearer ${authToken}`;
    let header = {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    };

    return await axios
      .get(url, header)
      .then((response) => {
        console.log("Fetched Test Executions");

        return response.data.values;
      })
      .catch((error) => {
        console.error("Error fetching executions: ", error);
        throw new Error(error.message);
      });
  },
};
