const OAuth2Server = require("express-oauth-server");
const bodyParser = require("body-parser");
const express = require("express");

const authorizationCodes = new Map();
const accessTokens = new Map();
const refreshTokens = new Map();

/**
 * Configure an Express app to fake an OAuth server
 * @param app The app to configure
 * @param options The configuration options for the OAuth server
 */
const configureOAuth = (
    app = express(),
    {
        accessTokenLifetimeSeconds = 45,
        refreshTokenLifetimeSeconds = 90,
        redirectUri = "http://localhost:58816/ext-core-webapi/callback/LocalOAuth"
    }
) => {
    const log = (...args) => console.log(new Date(), ...args);

    log("OAuth Configuration: ", {
        accessTokenLifetimeSeconds,
        refreshTokenLifetimeSeconds,
        redirectUri
    });

    const oauth = new OAuth2Server({
        model: {
            getClient: (id, secret) => {
                const client = {
                    id: "myClientId",
                    redirectUris: [redirectUri],
                    grants: [
                        "authorization_code",
                        "client_credentials",
                        "password",
                        "refresh_token",
                        "implicit"
                    ]
                };
                log("Got client ", client);
                return client;
            },
            saveAuthorizationCode: (code, client, user) => {
                log("saveAuthorizationCode ", {
                    code,
                    client,
                    user
                });
                authorizationCodes.set(code.authorizationCode, {
                    ...code,
                    client,
                    user
                });
                return code;
            },
            getAuthorizationCode: code => {
                const existingCode = authorizationCodes.get(code);
                log("getAuthorizationCode ", existingCode);
                return existingCode;
            },
            saveToken: (token, client, user) => {
                log("saveAccessToken ", token);
                accessTokens.set(token.accessToken, { token, client, user });
                if (token.refreshToken) {
                    log("saveRefreshToken ", token);
                    refreshTokens.set(token.refreshToken, {
                        token,
                        client,
                        user
                    });
                }
                return { ...token, client, user };
            },
            getAccessToken: accessToken => {
                const existingToken = accessTokens.get(accessToken);
                log("getAccessToken ", existingToken);
                return existingToken;
            },
            getUser: (username, password) => {
                log("getUser username ", username, " password ", password);
                return { username, password };
            },
            getUserFromClient: client => {
                log("getUserFromClient ", client);
                return { userForClient: client };
            },
            verifyScope: (token, scope) => {
                log("verifyScope", scope);
            }, // exception will be thrown if this function isn't set
            revokeAuthorizationCode: code => {
                log("revokeAuthorizationCode ", code);
                authorizationCodes.delete(code.authorizationCode);
                return Promise.resolve(true);
            },
            revokeToken: token => {
                if (token.accessToken != null) {
                    log("revokeAccessToken ", token);
                    accessTokens.delete(token.accessToken);
                }

                if (token.refreshToken != null) {
                    log("revokeRefreshToken ", token);
                    refreshTokens.delete(token.refreshToken);
                }
                return Promise.resolve(true);
            },
            getRefreshToken: refreshToken => {
                const foundToken = Array.from(refreshTokens.values()).filter(
                    t =>
                        t.token.refreshToken === refreshToken &&
                        t.token.refreshTokenExpiresAt > new Date()
                )[0];

                log("getRefreshToken ", foundToken);

                return foundToken;
            }
        },
        allowBearerTokensInQueryString: true,
        accessTokenLifetime: accessTokenLifetimeSeconds,
        refreshTokenLifetime: refreshTokenLifetimeSeconds,
        requireClientAuthentication: {
            [undefined]: false
        },
        useErrorHandler: true,
        allowEmptyState: true,
        authorizationCodeLifetime: accessTokenLifetimeSeconds
    });
    
    app.use(bodyParser.text({type: ["text/*","application/xml"]}));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(({ url, body, headers }, res, next) => {
        log("REQUEST: ", { url, body });
        next();
    });

    app.oauth = oauth;

    app.post("/token", app.oauth.token());
    app.get("/token", app.oauth.token());

    app.get("/authorize", (req, res, next) => {
        const options = {
            authenticateHandler: {
                handle: data => {
                    return { id: "someUser" }; // everyone is someUser
                }
            }
        };

        log("Authorizing");
        // Include options to override
        oauth.authorize(options)(req, res, next);
    });

    return app;
};

module.exports = configureOAuth;
