FROM microsoft/windowsservercore

# Create app directory
WORKDIR C:\\Webserver

COPY .\\webserver.js .

EXPOSE 3000

CMD [ "node", "webserver.js" ]