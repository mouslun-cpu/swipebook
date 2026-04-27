FROM node:20-alpine

WORKDIR /app

COPY swipebook-app/package*.json ./

RUN npm install

COPY swipebook-app/ .

RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "start"]
