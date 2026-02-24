FROM node:22-alpine

WORKDIR /app

COPY frontend/package.json ./frontend/package.json
COPY frontend/tsconfig.json ./frontend/tsconfig.json
COPY frontend/next.config.js ./frontend/next.config.js

WORKDIR /app/frontend
RUN npm install

COPY frontend ./
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
