import { IPC_HANDLERS, IPC_FUNCTIONS } from "../modules/constants";

export default {
  saveCredentials(credentials, data) {
    // TODO - can this be generalized and the key passed
    let formattedData = this.formatData(data);

    if (!credentials) {
      credentials = {};
    }

    if (credentials.testrail && credentials.testrail.length > 0) {
      let matched = false;
      for (const [testrailIndex, credential] of Object.entries(
        credentials.testrail
      )) {
        if (credential.user.id === formattedData.user.id) {
          credentials.testrail[testrailIndex] = formattedData;
          matched = true;
        }
      }
      if (!matched) {
        credentials.testrail.push(formattedData);
      }
    } else {
      credentials.testrail = [formattedData];
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
      type: data.type,
      loggedInAt: data.loggedInAt,
      user: {
        id: data.profile.account_id,
        email: data.profile.email,
        name: data.profile.name,
      },
      url: data.url,
    };
  },
};
