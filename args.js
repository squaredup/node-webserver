const getOAuthConfiguration = (processArgs = []) => {
    let [, , ...args] = processArgs;

    args = args.map(v => (v.startsWith("--") ? v.toLowerCase() : v));

    const getArgValue = name =>
        args.indexOf(name.toLowerCase()) > -1
            ? args[args.indexOf(name.toLowerCase()) + 1]
            : undefined;

    const toInt = x => (isFinite(parseInt(x)) ? parseInt(x) : undefined);

    return {
        accessTokenLifetimeSeconds: toInt(
            getArgValue("--accessTokenLifetimeSeconds")
        ),
        refreshTokenLifetimeSeconds: toInt(
            getArgValue("--refreshTokenLifetimeSeconds")
        ),
        redirectUri: getArgValue("--redirectUri")
    };
};

module.exports = { getOAuthConfiguration };
