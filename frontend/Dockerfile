# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
RUN chmod +x node_modules/.bin/*
COPY . .
RUN node node_modules/@angular/cli/bin/ng.js build --configuration=production

# Serve stage
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve@14
COPY --from=build /app/dist/resource-planner-pro/browser ./dist
EXPOSE 3000
CMD ["sh", "-c", "if [ -n \"$API_URL\" ]; then sed -i \"s|/api|$API_URL|g\" dist/*.js; fi && serve -s dist -l ${PORT:-3000}"]
