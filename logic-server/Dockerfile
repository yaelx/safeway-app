# 1. Start with the official OSRM image
# for the OSRM start-up info. v6.0.0 is a safe bet based on your logs.
FROM ghcr.io/project-osrm/osrm-backend:v6.0.0

# 2. Fix the pyexpat error and install build tools
# 2. Fix the pyexpat error by installing expat explicitly and first
RUN apk update && \
    apk add --no-cache --upgrade expat && \
    apk add --no-cache \
    curl \
    python3 \
    py3-pip \
    python3-dev \
    build-base \
    librdkafka-dev \
    bash \
    openssl-dev \
    zlib-dev

WORKDIR /app

# 2. Use a Virtual Environment to avoid --break-system-packages
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 3. Install requirements
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 4. Ensure data directory exists
RUN mkdir -p /app/data

# 5. Copy code
COPY . .

# 6. Runtime settings
ENV PORT=8080
ENV PYTHONUNBUFFERED=1
EXPOSE 8080

CMD ["python3", "worker.py"]