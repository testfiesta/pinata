import { IPC_HANDLERS, IPC_FUNCTIONS } from "../modules/constants";
import axios from "axios";

const ZEPHYR_SCALE_URL = "https://api.zephyrscale.smartbear.com/v2";

export default {
  saveCredentials(credentials, data) {
    let formattedData = this.formatData(data);

    if (!credentials) {
      credentials = {};
    }

    if (credentials.zephyrScale && credentials.zephyrScale.length > 0) {
      let matched = false;
      for (const [zephyrScaleIndex, credential] of Object.entries(
        credentials.zephyrScale
      )) {
        if (credential.user.client_id === formattedData.user.client_id) {
          credentials.zephyrScale[zephyrScaleIndex] = formattedData;
          matched = true;
        }
      }
      if (!matched) {
        credentials.zephyrScale.push(formattedData);
      }
    } else {
      credentials.zephyrScale = [formattedData];
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
      type: "zephyrScale",
      url: "smartbear.com/test-management/zephyr-scale/",
      loggedInAt: data.loggedInAt,
      lastRefreshed: data.lastRefreshed,
      user: {},
    };
  },

  async fetchProjects(authToken) {
    const url = `${ZEPHYR_SCALE_URL}/projects`;
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
    const url = `${ZEPHYR_SCALE_URL}/testcycles?projectKey=${projectKey}`;
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
    const url = `${ZEPHYR_SCALE_URL}/testexecutions?projectKey=${projectKey}&testCycle=${testCycleKey}`;
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
