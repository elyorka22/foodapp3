import { distanceKm as haversineKm } from '../../common/utils/geo.util';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

/** Pluggable distance source — swap Haversine for routing APIs later. */
export interface DistanceCalculator {
  distanceKm(from: Coordinates, to: Coordinates): number;
}

export class HaversineDistanceCalculator implements DistanceCalculator {
  distanceKm(from: Coordinates, to: Coordinates): number {
    return haversineKm(from.latitude, from.longitude, to.latitude, to.longitude);
  }
}

export const defaultDistanceCalculator = new HaversineDistanceCalculator();
