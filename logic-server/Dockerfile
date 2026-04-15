# 1. Start with the official OSRM image
FROM ghcr.io/project-osrm/osrm-backend:latest

# 2. Fix the pyexpat error and install build tools
RUN apk update && \
    apk add --no-cache --upgrade expat && \
    apk add --no-cache \
    python3 \
    py3-pip \
    python3-dev \
    build-base \
    librdkafka-dev \
    bash \
    openssl-dev \
    zlib-dev

WORKDIR /app

# 3. Path setup for OSRM
RUN ln -s /usr/local/bin/osrm-routed /usr/bin/osrm-routed || true

# 4. Install requirements 
# (Make sure requirements.txt has confluent-kafka==2.3.0)
COPY requirements.txt .
RUN pip3 install --no-cache-dir --upgrade setuptools wheel cython --break-system-packages && \
    pip3 install --no-cache-dir -r requirements.txt --break-system-packages

# 5. Copy code and data
COPY . .

ENV PORT 8080
EXPOSE 8080

CMD ["python3", "-u", "worker.py"]