FROM node:20 AS initial

WORKDIR /crud_blog

COPY package*.json ./

RUN npm install 

FROM node:alpine 

WORKDIR /crud_blog

COPY --from=initial /crud_blog /crud_blog

COPY . .

CMD ["node", "server.js"]
