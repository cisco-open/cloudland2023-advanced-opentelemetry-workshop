FROM node:18-alpine

ENV NODE_ENV=production
WORKDIR /service/app

COPY ["app/package.json", "app/package-lock.json*", "./"]

RUN npm install --production

COPY ["app/app.js", "app/instrumentation.otlp.js",  "./"]
COPY lib /service/lib

EXPOSE 8080

CMD [ "node", "-r", "./instrumentation.otlp.js", "app.js" ]