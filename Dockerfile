# Set the base image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of your app's source code
COPY . .

# Expose the app on port 3000
EXPOSE 3000

# Build the app
RUN npm run build

# Start the app
CMD [ "npm", "run", "dev" ]
