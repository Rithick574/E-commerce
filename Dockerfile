FROM node:20.5.0
WORKDIR /app
COPY . .
RUN yarn install --production
EXPOSE 8080
ENTRYPOINT ["yarn","dev"]
