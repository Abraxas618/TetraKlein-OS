FROM alpine:3.18

# Install required packages
RUN apk add --no-cache nodejs npm curl bash procps tini

# Working directory
WORKDIR /app

# Copy application files
COPY tiny_server.js .
COPY deploy.sh .
COPY public/ ./public/
COPY .dockerignore .
COPY README.md .

# Create and prepare vault directory with proper permissions
RUN mkdir -p /app/vault && \
    chmod 777 /app/vault

# Install Node.js dependencies with explicit versions for stability
RUN npm init -y && \
    npm install express@4.18.2 helmet@7.0.0 compression@1.7.4

# Create mock Yggdrasil bin for environments where it can't be installed
RUN echo '#!/bin/sh' > /usr/local/bin/yggdrasil && \
    echo 'echo "Yggdrasil (mock): $@"' >> /usr/local/bin/yggdrasil && \
    echo 'echo "{\"peers\": [], \"listen\": [\"tcp://127.0.0.1:0\"], \"multicast\": {}}"' >> /usr/local/bin/yggdrasil && \
    chmod +x /usr/local/bin/yggdrasil

# Set up Yggdrasil configuration directory
RUN mkdir -p /etc/yggdrasil

# Expose ports for binding
EXPOSE 8080
EXPOSE 3000

# Create healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Create startup script with better error handling
RUN echo '#!/bin/sh' > /app/startup.sh && \
    echo 'set -e' >> /app/startup.sh && \
    echo 'echo "Checking system requirements..."' >> /app/startup.sh && \
    echo 'mkdir -p /app/vault' >> /app/startup.sh && \
    echo 'chmod 777 /app/vault' >> /app/startup.sh && \
    echo 'echo "Starting Yggdrasil mesh networking daemon (or mock)..."' >> /app/startup.sh && \
    echo 'if [ ! -f /etc/yggdrasil/yggdrasil.conf ]; then' >> /app/startup.sh && \
    echo '  echo "Generating Yggdrasil config..."' >> /app/startup.sh && \
    echo '  yggdrasil -genconf > /etc/yggdrasil/yggdrasil.conf' >> /app/startup.sh && \
    echo 'fi' >> /app/startup.sh && \
    echo 'yggdrasil -useconffile /etc/yggdrasil/yggdrasil.conf -logto /dev/null &' >> /app/startup.sh && \
    echo 'YGGDRASIL_PID=$!' >> /app/startup.sh && \
    echo 'echo "TetraKlein-OS Field Terminal starting..."' >> /app/startup.sh && \
    echo 'exec node tiny_server.js' >> /app/startup.sh && \
    chmod +x /app/startup.sh

# Set up basic Yggdrasil config
RUN mkdir -p /etc/yggdrasil && \
    echo '{"peers":[],"listen":["tcp://127.0.0.1:0"],"multicast":{}}' > /etc/yggdrasil/yggdrasil.conf

# Use tini as init system to properly handle signals and child processes
ENTRYPOINT ["/sbin/tini", "--"]

# Run both services on container startup
CMD ["/app/startup.sh"] 