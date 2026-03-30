#!/bin/bash

# 1. Configuration
DATA_DIR="./data"
OSM_FILE="israel-and-palestine-latest.osm.pbf"
OSRM_IMAGE="ghcr.io/project-osrm/osrm-backend"

echo "🚀 Starting OSRM Map Processing for Israel..."

# 2. Extract
echo "📦 Extracting map data (car profile)..."
docker run -t -v "${PWD}/${DATA_DIR}:/data" $OSRM_IMAGE osrm-extract -p /opt/car.lua /data/$OSM_FILE

# 3. Partition (Required for MLD)
echo "🧩 Partitioning for MLD algorithm..."
docker run -t -v "${PWD}/${DATA_DIR}:/data" $OSRM_IMAGE osrm-partition /data/israel-and-palestine-latest.osrm

# 4. Customize
echo "⚙️ Customizing travel weights..."
docker run -t -v "${PWD}/${DATA_DIR}:/data" $OSRM_IMAGE osrm-customize /data/israel-and-palestine-latest.osrm

echo "✅ Success! Data is baked and ready for Docker build."