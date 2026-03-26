FROM node:20-slim
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run css:build
RUN npm prune --omit=dev
EXPOSE 8080
ENV NODE_ENV=production
CMD ["node", "server.js"]
