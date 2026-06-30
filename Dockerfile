FROM mcr.microsoft.com/playwright:v1.61.0-noble

WORKDIR /app

COPY package*.json ./

# mejor que npm install en CI containers
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]