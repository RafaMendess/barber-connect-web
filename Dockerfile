FROM node:20-alpine AS builder

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

# copy package manifests first for better caching
COPY package.json package-lock.json* ./
COPY tsconfig.json tsconfig.node.json* ./

# copy everything else
COPY . .

RUN npm ci --silent
RUN npm run build

FROM nginx:stable-alpine AS runner

# Copy built app from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config (fallback to index.html for SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
