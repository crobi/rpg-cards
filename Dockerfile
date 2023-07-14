FROM node:16
ENV NPM_CONFIG_LOGLEVEL info
WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm run build

FROM nginx
COPY --from=0 /usr/src/app/generator/ /usr/share/nginx/html/
