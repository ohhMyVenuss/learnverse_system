FROM node:20-alpine

WORKDIR /app

COPY vite-project/package*.json ./
RUN npm install

COPY vite-project/ ./

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]