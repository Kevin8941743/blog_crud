FROM node:20 AS initial

WORKDIR /crud_blog

COPY package*.json ./

RUN npm install 