import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { API_PATHS } from "../config/constants";
import { RouteShelter, DBShelter } from "../types/types";
import { RedisCache } from "../infrastructure/cache/RedisCache";

export class ShelterService {
  private cache: RedisCache;

  constructor(private prisma: PrismaClient) {
    this.cache = new RedisCache();
  }

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

    // 2. Redis Cache Lookup for OSM Data
    // We create a specific key for this bounding box
    const cacheKey = `shelters:bbox:${minLat.toFixed(4)},${minLng.toFixed(4)}:${maxLat.toFixed(4)},${maxLng.toFixed(4)}`;

    try {
      // Note: Since your RedisCache.getRoute is specific to routes,
      // you can use a generic get/set or add a getShelters method to it.
      // For now, let's assume we use the underlying redis instance or add a method:
      const cachedOSM = await this.cache.getRaw(cacheKey);

      if (cachedOSM) {
        console.log(`[Cache] HIT for Shelters: ${cacheKey}`);
        return [...matchedLocal, ...cachedOSM];
      }
    } catch (err) {
      console.warn("Redis lookup failed, falling back to OSM API");
    }

    // 3. Fetch from OSM if not cached
    try {
      const query = `[out:json][timeout:25];(node["amenity"="shelter"](${minLat},${minLng},${maxLat},${maxLng});way["amenity"="shelter"](${minLat},${minLng},${maxLat},${maxLng}););out center;`;
      const response = await axios.get(
        `${API_PATHS.OSM_INTERPRETER}?data=${encodeURIComponent(query)}`,
        { timeout: 5000 },
      );

      const osmShelters: RouteShelter[] = response.data.elements.map(
        (el: any) => ({
          id: `osm-${el.id}`, // Give OSM items a unique ID string
          lat: el.lat || el.center.lat,
          lng: el.lon || el.center.lon,
          name: el.tags.name || "Public Shelter",
          address: el.tags.address || "",
          isOfficial: false,
          type: el.tags.type || "OSM",
        }),
      );

      // 4. Save to Redis
      await this.cache.setRaw(cacheKey, osmShelters);
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
