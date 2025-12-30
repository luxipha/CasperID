FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port (Cloud Run sets PORT env var)
EXPOSE 8080

# Health check endpoint for Cloud Run
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]