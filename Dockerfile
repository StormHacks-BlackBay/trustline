# TrustLine call server: holds Twilio media streams open, so it needs an always-on host
# (Railway, Fly.io, Render). The web app itself deploys to Vercel.
FROM node:22-slim

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
# tsx runs the TypeScript server directly; it is a dev dependency, so install everything.
RUN npm ci --include=dev && npm cache clean --force

COPY tsconfig.json tsconfig.node.json ./
COPY server ./server
COPY api ./api
COPY src ./src

EXPOSE 8787
USER node
CMD ["npx", "tsx", "server/index.ts"]
