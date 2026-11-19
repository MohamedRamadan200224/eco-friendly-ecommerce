# Eco-friendly e-commerce backend.
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# config.env is excluded by .dockerignore — never bake secrets into the
# image. Provide DATABASE / JWT_SECRET / JWT_EXPIRES_IN (and the Stripe
# keys) as environment variables at runtime; server.js fails fast if
# DATABASE / JWT_SECRET / JWT_EXPIRES_IN are missing.
USER node

EXPOSE 3000

CMD ["node", "server.js"]
