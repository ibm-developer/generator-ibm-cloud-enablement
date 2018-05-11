FROM node:8

ADD . /app

ENV NODE_ENV production
ENV PORT <%= port %>

EXPOSE <%= port %>

WORKDIR "/app"

RUN npm install
CMD ["npm", "start"]
