const url = require("url");
const express = require("express");
const args = require("./args");
const configureOAuth = require("./configureOAuth");
const port = 3000;

const app = configureOAuth(express(), args.getOAuthConfiguration(process.argv));

app.get("/requiresAuthentication", (request, response) => {
    app.oauth.authenticate()(request, response, (...args) => {
        if (args.sever_error) {
            throw args.sever_error;
        }

        const urlParts = url.parse(request.url, true);
        const query = urlParts.query;

        response.writeHead(200, {
            "Content-Type": "application/json",
            "access-control-allow-origin": "*"
        });

        const headers = JSON.stringify(request.headers);
        const data = JSON.stringify(query);
        response.write(
            JSON.stringify({
                id: "SomeId",
                body: "This request was authenticated",
                headers: headers,
                data: data
            })
        );

        response.end();
    });
});

app.get("/", (request, response) => {

    response.header("access-control-allow-origin", "*")
    .status(200)
    .json({
        id: "1a4",
        body: "call_me_hand2:",
        headers: request.headers,
        data: url.parse(request.url, true).query
    });
});

app.post("/", (request, response) => {

    response.header("access-control-allow.origin", "*")
    .status(200)
    .json({
        headers: request.headers,
        data: request.body
    });
});

app.listen(port);

console.log("Listening for requests...");
