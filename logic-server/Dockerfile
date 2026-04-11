# STAGE 1: Get the OSRM engine
FROM ghcr.io/project-osrm/osrm-backend AS osrm_engine

# STAGE 2: Build your Python app
FROM python:3.11-slim
WORKDIR /app

# --- Install OSRM Runtime Dependencies ---
# main.py Stage 2 (Inside the python:3.11-slim block)
RUN apt-get update && apt-get install -y \
    libboost-system-dev \
    libboost-filesystem-dev \
    libboost-thread-dev \
    libboost-iostreams-dev \
    libtbb-dev \
    liblua5.3-0 \
    libstxxl1v5 \
    expat \
    gcc \
    python3-dev \
    librdkafka-dev \
    libssl-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*



# --- 2. COPY THE ENGINE AND LIBRARIES (CRITICAL) ---
COPY --from=osrm_engine /usr/local/bin/osrm-routed /usr/local/bin/
COPY --from=osrm_engine /usr/local/lib/libosrm* /usr/local/lib/
# Tell the OS to look in /usr/local/lib for these files
RUN ldconfig

# Copy your baked Israel map data from your local folder
COPY ./data /app/data

# 2. Copy your Python logic
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .


# Standardize the port for Cloud Run
ENV PORT 8080
EXPOSE 8080

CMD ["python", "-u", "worker.py"]