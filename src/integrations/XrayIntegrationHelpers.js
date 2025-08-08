import { IPC_HANDLERS, IPC_FUNCTIONS } from "../modules/constants";
import axios from "axios";

const XRAY_URL = "https://xray.cloud.getxray.app/api/v2/graphql";

export default {
  saveCredentials(credentials, data) {
    let formattedData = this.formatData(data);

    if (!credentials) {
      credentials = {};
    }

    if (credentials.xray && credentials.xray.length > 0) {
      let matched = false;
      for (const [xrayIndex, credential] of Object.entries(credentials.xray)) {
        if (credential.user.client_id === formattedData.user.client_id) {
          credentials.xray[xrayIndex] = formattedData;
          matched = true;
        }
      }
      if (!matched) {
        credentials.xray.push(formattedData);
      }
    } else {
      credentials.xray = [formattedData];
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
      type: "xray",
      url: "www.getxray.app",
      loggedInAt: data.loggedInAt,
      lastRefreshed: data.lastRefreshed,
      clientId: data.client_id,
      clientSecret: data.client_secret,
      user: {},
    };
  },

  async fetchTestExecutions(accessToken) {
    const graphqlQuery = {
      query: `{
        getTestExecutions(limit: 10) {
          total
          start
          limit
          results {
            issueId
            jira(fields: ["key", "summary", "assignee", "reporter"])
          }
        }
      }`,
    };
    const authHeader = `Bearer ${accessToken}`;
    const graphqlHeaders = {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    };

    return axios
      .post(XRAY_URL, graphqlQuery, graphqlHeaders)
      .then((response) => {
        if (response.status === 200) {
          console.log("Fetched Test Executions");

          return response.data.data.getTestExecutions.results;
        }
      })
      .catch((error) => {
        console.error("Error fetching test executions: ", error);
        throw new Error(error.message);
      });
  },

  async fetchTestRuns(accessToken, issueId) {
    const graphqlQuery = {
      query: `{
        getTestRuns(testExecIssueIds: ["${issueId}"], limit: 10 ) {
          total
          limit
          start
          results {
            id
            status {
              name
              color
              description
            }
            gherkin
            examples {
              id
              status {
                name
                color
                description
              }
            }
            test {
              issueId
              jira(fields: ["key", "summary"])
            }
            testExecution {
              issueId
            }
          }
        }
      }`,
    };
    const authHeader = `Bearer ${accessToken}`;
    const graphqlHeaders = {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    };

    return axios
      .post(XRAY_URL, graphqlQuery, graphqlHeaders)
      .then((response) => {
        if (response.status === 200) {
          console.log("Fetched Test Runs");

          return response.data.data.getTestRuns.results;
        }
      })
      .catch((error) => {
        console.error("Error fetching test runs: ", error);
        throw new Error(error.message);
      });
  },

  async addEvidenceToTestRun(testRunId, file, accessToken) {
    const graphqlQuery = {
      query: `mutation {
        addEvidenceToTestRun(
          id: "${testRunId}",
          evidence: [
            {
              filename: "${file.filename}"
              mimeType: "${file.mimeType}"
              data: "${file.data}"
            }
          ]
        ) {
          addedEvidence
          warnings
        }
      }`,
    };
    const authHeader = `Bearer ${accessToken}`;
    const graphqlHeaders = {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    };

    return axios
      .post(XRAY_URL, graphqlQuery, graphqlHeaders)
      .then((response) => {
        if (response.status === 200) {
          if (response.data.errors) {
            console.error(
              "Error attaching evidence to test run: ",
              response.data.errors[0]
            );
            throw new Error(response.data.errors[0].message);
          }

          console.log("Attached evidence to test run");

          return response.data.data.addEvidenceToTestRun.addedEvidence;
        }
      })
      .catch((error) => {
        console.error("Error attaching evidence to test run: ", error);
        throw new Error(error.message);
      });
  },
};
