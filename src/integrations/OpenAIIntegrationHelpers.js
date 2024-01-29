import axios from "axios";

import {
  IPC_HANDLERS,
  IPC_FUNCTIONS,
  AI_ENABLED_FIELDS,
} from "../modules/constants";

export default {
  async enhanceText(credentials, config, field, text) {
    if (!credentials?.openai?.accessToken) {
      return { error: "You must provide an OpenAI key in Settings > Addons." };
    } // TODO - i18n

    let returnResponse = {
      content: "",
    };
    const options = {
      headers: this.getHeaders(credentials.openai),
    };

    let { prompts, ...promptData } = config.ai.openai;
    let userContent =
      AI_ENABLED_FIELDS[field].type === "textField" ? text : text?.content;
    promptData.messages = [
      ...prompts[field],
      {
        role: "user",
        content: userContent,
      },
    ];

    let response = await axios
      .post("https://api.openai.com/v1/chat/completions", promptData, options)
      .catch((error) => {
        returnResponse.error = error;
      });
    if (response?.status === 200) {
      let tempContent = response.data.choices[0].message.content;
      // eslint-disable-next-line no-control-regex
      tempContent = tempContent.trim().replace(/[^\x00-\x7F]/, "");
      if (!AI_ENABLED_FIELDS[field].type === "textField") {
        tempContent = tempContent
          .replaceAll("<!--", "<p>")
          .replaceAll("-->", "</p>");
        let parser = new DOMParser();
        let error = parser
          .parseFromString(tempContent, "application/xml")
          .querySelector("parsererror");
        if (error) {
          returnResponse.error = "Invalid HTML returned.";
        }
      }
      returnResponse.content = tempContent;
    }

    return returnResponse;
  },
  saveCredentials(credentials, data) {
    let formattedData = this.formatData(data);

    if (!credentials) {
      credentials = {};
    }

    credentials.openai = formattedData;

    window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.UPDATE_CREDENTIALS,
      data: credentials,
    });

    return credentials;
  },
  async testCredential(credential) {
    const options = {
      headers: this.getHeaders(credential),
    };

    let returnData = false;
    let response = await axios
      .get("https://api.openai.com/v1/models", options)
      .catch(() => {
        returnData = false;
      });
    if (response?.status === 200) {
      returnData = true;
    }

    return returnData;
  },
  getHeaders(credential) {
    let authHeader;
    if (credential.type === "bearer") {
      authHeader = `Bearer ${credential.accessToken}`;
    }
    return {
      Authorization: authHeader,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  },
  formatData(data) {
    return {
      accessToken: data.accessToken,
      type: data.type,
      loggedInAt: data.loggedInAt,
    };
  },
};
