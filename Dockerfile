FROM node:14.18.2-alpine
RUN mkdir -p usr/src/app
WORKDIR /usr/src/app
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install --silent && npm cache clean --force
WORKDIR /usr/src/app
COPY . .
EXPOSE 8000
CMD ["npm","start"]