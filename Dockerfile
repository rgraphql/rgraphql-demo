FROM node:7-alpine
RUN npm install http-server -g
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD ./dist/ /usr/src/app/
CMD ["http-server", "."]
