# STAGE 1: Get the OSRM engine
FROM ghcr.io/project-osrm/osrm-backend AS osrm_engine

# STAGE 2: Build your Python app
FROM python:3.11-slim

WORKDIR /app

# Copy the OSRM "executable" from the first stage
COPY --from=osrm_engine /usr/local/bin/osrm-routed /usr/local/bin/

# Copy your baked Israel map data from your local folder
COPY ./data /app/data

# 2. Copy your Python logic
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .


# Standardize the port for Cloud Run
ENV PORT 8080
EXPOSE 8080
# 3. Start the server
# Note: You'll need to update main.py to spawn OSRM or use an OSRM library
CMD ["python", "main.py"]