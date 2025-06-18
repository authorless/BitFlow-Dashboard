FROM node:18-alpine

WORKDIR /app

# Install dependencies for build
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

# Build the application
COPY . .
RUN npx prisma generate
RUN npm run build

# Cleanup development dependencies
RUN npm prune --production

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
