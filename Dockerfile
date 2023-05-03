# The docker build command needs to be run from the root of the monorepo !!
FROM node:18

RUN apt-get update -y

WORKDIR /usr/src/app

# Copy package.json first so we don't need to reinstall dependencies if only code changes
COPY package.json package.json
# Copy dependency package.json
# COPY packages/vendure-simple-push/package.json packages/vendure-simple-push/package.json
# COPY packages/vendure-roles-and-permissions/package.json packages/vendure-roles-and-permissions/package.json

# Install dependencies
COPY package.json .npmrc yarn.lock ./
RUN yarn --pure-lockfile --non-interactive

# Copy the App Files
COPY . .
# Copy all dependencies
# COPY packages/vendure-simple-push/ packages/vendure-simple-push/
# COPY packages/vendure-roles-and-permissions/ packages/vendure-roles-and-permissions/

# Build
RUN yarn build

CMD ["yarn", "dev:server"]