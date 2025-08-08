import axios from "axios";
import dayjs from "dayjs";
import { IPC_HANDLERS, IPC_FUNCTIONS } from "../modules/constants";

export default {
  async checkAuth(credentials) {
    let authedCount = Object.values(credentials).flat().length;

    // Refresh any OAuth tokens that need it.
    let failedAuth = await this.updateCredentials(credentials);

    if (authedCount < 1 || authedCount === failedAuth.length) {
      return {
        authed: false,
        failedAuth,
      };
    }
    return {
      authed: true,
      failedAuth,
    };
  },
  async updateCredentials(credentials) {
    let failedAuth = [];
    let newCredentials = {};
    let updated = false;

    for (const [credentialProvider, credentialList] of Object.entries(
      credentials
    )) {
      let updatedList = [];

      if (Array.isArray(credentialList)) {
        // Supporting external services like OpenAI store creds as an object
        //   because you can only have one of each.
        for (const credential of credentialList) {
          let updatedCredential;
          if (Object.keys(credential).length) {
            if (
              credential.type == "oauth" &&
              this.isTokenExpired(credential) &&
              dayjs(credential.lastRefreshed) < dayjs().subtract(4, "minute")
            ) {
              updatedCredential = await this.refreshAccessToken(
                credentials,
                credentialProvider,
                credential
              );
              if (
                updatedCredential.status &&
                updatedCredential.status > 399 &&
                updatedCredential.status < 500
              ) {
                if (credential.testfiestaOauthTokenId) {
                  updatedCredential = null;
                  failedAuth.push({
                    credentialProvider,
                    credential,
                  });

                  // Remove the id from testfiesta.oauthTokenIds
                  let testfiestaCreds = [];
                  const currentCreds =
                    newCredentials.testfiesta || credentials.testfiesta;
                  for (const cred of currentCreds) {
                    cred.oauthTokenIds = cred.oauthTokenIds.filter(
                      (id) => id !== credential.testfiestaOauthTokenId
                    );
                    testfiestaCreds.push(cred);
                  }
                  newCredentials.testfiesta = testfiestaCreds;
                }
              }
              updated = true;
            } else {
              updatedCredential = credential;
            }
            if (updatedCredential) {
              delete updatedCredential["provider"];
              delete updatedCredential["status"];
              updatedList.push({ ...credential, ...updatedCredential });
            }
          } else {
            failedAuth.push({
              credentialProvider,
              credential,
            });
          }
        }
        newCredentials[credentialProvider] = updatedList;
      } else {
        newCredentials[credentialProvider] = credentialList;
      }
    }

    if (updated) {
      await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
        func: IPC_FUNCTIONS.UPDATE_CREDENTIALS,
        data: newCredentials,
      });
    }

    return failedAuth;
  },
  isTokenExpired(data) {
    if (data.type == "oauth") {
      if (dayjs() > dayjs(data.expiresAt)) {
        return true;
      }
      return false;
    }
    return true;
  },
  getTestFiestaCredentialForOauthToken(credentials, token) {
    for (const credential of credentials?.testfiesta) {
      if (credential.oauthTokenIds.includes(token)) {
        return credential.accessToken;
      }
    }
    return null;
  },
  async refreshAccessToken(credentials, provider, credential) {
    let tokenURL;
    if (provider === "jira") {
      if (!credential.url) {
        tokenURL = `${process.env.VUE_APP_TESTFIESTA_API_URL}/app/oauth/jira/token/${credential.testfiestaOauthTokenId}`;
        let testfiestaToken = this.getTestFiestaCredentialForOauthToken(
          credentials,
          credential.testfiestaOauthTokenId
        );

        let header = {
          headers: {
            Authorization: `Bearer ${testfiestaToken}`,
            Accept: "application/json",
          },
        };

        return await axios
          .get(tokenURL, header)
          .then((response) => {
            response.data.jira.lastRefreshed = dayjs().format(
              "YYYY-MM-DD HH:mm:ss"
            );
            return response.data.jira;
          })
          .catch((error) => {
            return {
              status: error?.response?.status,
              provider: error.response?.data?.provider,
            };
          });
      } else {
        tokenURL = `http://${credential.url}/rest/oauth2/latest/token`;

        let header = {
          headers: {
            Accept: "application/json",
          },
        };

        let params = new URLSearchParams();
        params.append("client_id", credential.clientId);
        params.append("client_secret", credential.clientSecret);
        params.append("refresh_token", credential.refreshToken);
        params.append("grant_type", "refresh_token");

        return await axios
          .post(tokenURL, params, header)
          .then((response) => {
            const responseData = {};
            for (const [key, value] of Object.entries(response.data)) {
              // Convert keys to camel case.
              const newKey = key
                .toLowerCase()
                .replace(/([-_][a-z0-9])/g, (group) =>
                  group.toUpperCase().replace("-", "").replace("_", "")
                );
              responseData[newKey] = value;
            }
            responseData.expiresAt = dayjs()
              .add(response.data.expires_in, "second")
              .format("YYYY-MM-DD HH:mm:ss");
            responseData.lastRefreshed = dayjs().format("YYYY-MM-DD HH:mm:ss");
            return responseData;
          })
          .catch((error) => {
            console.log(`Error: ${JSON.stringify(error.data)}`);
            return {
              status: error?.response?.status,
              provider: provider,
            };
          });
      }
    }
  },
  sha256(plain) {
    // returns promise ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest("SHA-256", data);
  },
  base64URLEncode(a) {
    var str = "";
    var bytes = new Uint8Array(a);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      str += String.fromCharCode(bytes[i]);
    }
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  },
  dec2Hex(dec) {
    return ("0" + dec.toString(16)).substr(-2);
  },
  generateCodeVerifier() {
    var array = new Uint32Array(56 / 2);
    crypto.getRandomValues(array);
    return Array.from(array, this.dec2Hex).join("");
  },
  async generateCodeChallengeFromVerifier(v) {
    var hashed = await this.sha256(v);
    var base64encoded = this.base64URLEncode(hashed);
    return base64encoded;
  },
};
