FROM node:latest
RUN npm install -g npm@10.5.2

WORKDIR /APP

COPY . /APP/

RUN npm ci
RUN npm i @spec-box/sync@0.0.2-beta.19 --registry=https://registry.npmjs.org -D
RUN npm run build

WORKDIR /APP/specs

ENTRYPOINT ["npm", "--version"]
