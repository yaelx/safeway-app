import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { API_PATHS, SHELTER_SELECT_FIELDS } from "../config/constants";
import { RouteShelter, DBShelter } from "../types/types";
import { logger } from "../middleware/logger";
import { RedisCache } from "../infrastructure/cache/RedisCache";

export class ShelterService {
  private cache: RedisCache;

  constructor(private prisma: PrismaClient) {
    this.cache = new RedisCache();
  }

  async fetchFromOSM(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number,
  ) {
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

      return osmShelters;
    } catch (osmError) {
      logger.warn(
        { event: "OSM_TIMEOUT", err: osmError },
        "Overpass API timed out, returning only database shelters",
      );
      // Return what we have from Prisma instead of throwing a 500
      return [];
    }
  }

  async getSheltersInBounds(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number,
    useLiveOsm: boolean = false,
  ) {
    const cacheKey = `shelters:bbox:${minLat.toFixed(4)},${minLng.toFixed(4)}:${maxLat.toFixed(4)},${maxLng.toFixed(4)}`;

    try {
      const cachedShelters = await this.cache.getRaw(cacheKey);
      if (cachedShelters) {
        logger.info(
          { event: "SHELTER_CACHE_HIT", cacheKey },
          "Retrieved shelters from Redis cache",
        );
        return cachedShelters;
      }
    } catch (err) {
      logger.warn(
        { event: "SHELTER_CACHE_MISS", cacheKey, err },
        "Redis lookup failed, falling back to OSM and DB",
      );
    }

    const matchedLocal = await this.prisma.shelter.findMany({
      where: {
        lat: { gte: minLat, lte: maxLat },
        lng: { gte: minLng, lte: maxLng },
      },
      select: SHELTER_SELECT_FIELDS,
    });

    if (!useLiveOsm) {
      await this.cache.setRaw(cacheKey, matchedLocal, 3600);
      return matchedLocal;
    }

    const osmShelters = await this.fetchFromOSM(minLat, minLng, maxLat, maxLng);
    const mergedResults = [...matchedLocal, ...osmShelters];
    await this.cache.setRaw(cacheKey, mergedResults, 3600); // Cache for 1 hour
    return mergedResults;
  }

  async addShelter(data: {
    name: string;
    lat: number;
    lng: number;
    address: string;
    type: string;
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
