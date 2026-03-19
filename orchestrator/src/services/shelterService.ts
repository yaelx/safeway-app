import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { API_PATHS } from "../config/constants";

const shelterCache = new Map<string, any[]>();

export class ShelterService {
  constructor(private prisma: PrismaClient) {}

  async getSheltersInBounds(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number,
  ) {
    // 1. Fetch from your Prisma DB
    const matchedLocal = await this.prisma.shelter.findMany({
      where: {
        lat: { gte: minLat, lte: maxLat },
        lng: { gte: minLng, lte: maxLng },
      },
    });

    // 2. Check OSM Cache
    const cacheKey = `${Math.round(minLat * 1000)},${Math.round(maxLat * 1000)},${Math.round(minLng * 1000)},${Math.round(maxLng * 1000)}`;
    if (shelterCache.has(cacheKey)) {
      return [...matchedLocal, ...shelterCache.get(cacheKey)!];
    }

    // 3. Fetch from OSM if not cached
    try {
      const query = `[out:json][timeout:25];(node["amenity"="shelter"](${minLat},${minLng},${maxLat},${maxLng});way["amenity"="shelter"](${minLat},${minLng},${maxLat},${maxLng}););out center;`;
      const response = await axios.get(
        `${API_PATHS.OSM_INTERPRETER}?data=${encodeURIComponent(query)}`,
        { timeout: 5000 },
      );

      const osmShelters = response.data.elements.map((el: any) => ({
        id: `osm-${el.id}`, // Give OSM items a unique ID string
        lat: el.lat || el.center.lat, // Change 'y' to 'lat'
        lng: el.lon || el.center.lon, // Change 'x' to 'lng'
        name: el.tags.name || "Public Shelter",
        address: el.tags.address || "",
        isOfficial: false,
      }));

      shelterCache.set(cacheKey, osmShelters);
      return [...matchedLocal, ...osmShelters];
    } catch (osmError) {
      console.warn(
        "⚠️ Overpass API timed out or failed. Returning only database shelters.",
      );
      // Return what we have from Prisma instead of throwing a 500
      return matchedLocal;
    }
  }

  async addShelter(data: {
    name: string;
    lat: number;
    lng: number;
    address?: string;
  }) {
    return this.prisma.shelter.create({
      data: { ...data, isOfficial: false },
    });
  }

  async updateShelter(id: number, data: any) {
    return this.prisma.shelter.update({
      where: { id },
      data,
    });
  }

  async createReport(shelterId: number, reason: string, comment?: string) {
    return (this.prisma as any).shelterReport.create({
      data: { shelterId, reason, comment },
    });
  }
}
