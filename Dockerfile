FROM stefanscherer/node-windows:10.0.0

# Create app directory
WORKDIR C:\\Webserver

COPY .\\webserver.js .

EXPOSE 3000

CMD [ "node", "webserver.js" ]