# server/Dockerfile (Multi-stage)

# --- Stage 1: Build ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npx prisma generate 
RUN npm run build 

# --- Stage 2: Production ---
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma 
EXPOSE 5000
CMD ["npm", "start"] 