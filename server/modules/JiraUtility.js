const axios = require("axios");
const open = require("open");
const https = require("https");
const path = require("path");
const port = process.env.VUE_APP_SERVER_PORT || 64064;


const clientId = process.env.clientId;
const clientSecret = process.env.clientSecret;
const serverURL = process.env.url;
const codeVerifier = process.env.codeVerifier;
const codeChallenge = process.env.codeChallenge;
const scopes = "WRITE";
const redirectURL = `http://localhost:${port}/oauth2/atlassian/callback`;

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/oauth2/atlassian", (req, res) => {
    var uri = encodeURI(
      `https://${serverURL}/rest/oauth2/latest/authorize?client_id=${clientId}&redirect_uri=${redirectURL}&response_type=code&scope=${scopes}&code_challenge=${codeChallenge}&code_challenge_method=S256`
    );
    return res.send(uri);
  });


  app.get("/oauth2/atlassian/callback", (req, res) => {
    var uri = encodeURI(
      `https://${serverURL}/rest/oauth2/latest/token?client_id=${clientId}&client_secret=${clientSecret}&code=${req.query.code}&grant_type=authorization_code&redirect_uri=${redirectURL}&code_verifier=${codeVerifier}`
    );

    const instance = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });

    instance
      .post(uri)
      .then((data) => {
        const responseData = {};
        for(const [key, value] of Object.entries(data.data)) {
            // Convert keys to camel case.
            const newKey = key.toLowerCase().replace(/([-_][a-z0-9])/g, group =>
              group
               .toUpperCase()
               .replace('-', '')
               .replace('_', '')
            );
            responseData[newKey] = value;
        }
        responseData.type = "oauth";
        responseData.url = serverURL;
        responseData.clientId = clientId;
        responseData.clientSecret = clientSecret;
  
        process.send({
          type: "jira",
          data: {
            jira: responseData,
          },
        });
        return res.sendFile(path.join(__dirname, "../jira_success.html"));
      })
      .catch((error) => {
        console.log(`Connection error: ${JSON.stringify(error)}`);
        return res.sendFile(path.join(__dirname, `../jira_error.html?code=${error.response.status}&message=${encodeURI(error.message)}`));
      });
  });

};
