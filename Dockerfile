FROM node:20.5.0
WORKDIR /app
COPY . /app
RUN yarn install
EXPOSE 8080
ENTRYPOINT ["yarn","dev"]
