# Use a lightweight Node image
FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl ca-certificates

WORKDIR /usr/src/app

# Copy manifests
COPY package*.json ./
COPY prisma ./prisma/

# 2. Install EVERYTHING (including @types) for the build
RUN npm install

# Copy source
COPY . .

# 3. Build: Generates Prisma client + Runs TSC
RUN npm run build

# 4. Prune: Remove devDependencies to keep the final image small
RUN npm prune --production

EXPOSE 8080
CMD [ "npm", "start" ]