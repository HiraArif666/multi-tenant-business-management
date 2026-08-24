FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev
RUN npm install sequelize-cli@6.6.5

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/database ./src/database
COPY --from=builder /app/.sequelizerc ./.sequelizerc

EXPOSE 3000

CMD ["sh", "-c", "npx sequelize-cli db:migrate --env production && node dist/main"]