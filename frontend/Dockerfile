# ---------- Stage 1: build ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- Stage 2: runtime (nginx) ----------
FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
# Samopodpisany certyfikat TLS dla dema (#76). W PRODUKCJI podmień na realny
# (Let's Encrypt / zamontowany wolumen z /etc/nginx/ssl).
RUN apk add --no-cache openssl \
  && mkdir -p /etc/nginx/ssl \
  && openssl req -x509 -nodes -days 825 -newkey rsa:2048 \
       -keyout /etc/nginx/ssl/key.pem -out /etc/nginx/ssl/cert.pem \
       -subj "/CN=localhost"
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
