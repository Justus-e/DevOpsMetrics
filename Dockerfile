FROM registry.app.corpintra.net/dockerhub/library/node:lts-alpine


WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 8080

CMD [ "node", "src/server.js" ]
