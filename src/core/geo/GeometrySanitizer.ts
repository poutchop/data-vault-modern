import * as turf from '@turf/turf';

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export class GeometrySanitizer {
  /**
   * Enforces topological correctness directly on the tablet screen.
   * Prevents corrupted overlapping polygons before hitting the sync queue.
   */
  public static validateFarmPolygon(currentPolygonGeoJson: any, cachedCoopPolygons: any[]): ValidationResult {
    try {
      // Constraint A: Check for self-intersections (Kinks)
      const kinks = turf.kinks(currentPolygonGeoJson);
      if (kinks.features.length > 0) {
        return { isValid: false, errorMessage: 'CRITICAL_GEOMETRY_ERROR: Polygon borders intersect with themselves.' };
      }

      // Constraint B: Check for illegal border overlaps with neighboring farm property lines
      const currentArea = turf.area(currentPolygonGeoJson);
      
      for (const neighbor of cachedCoopPolygons) {
        // Find intersection between current and neighbor
        const intersection = turf.intersect(turf.featureCollection([currentPolygonGeoJson, neighbor]));
        
        if (intersection) {
          const intersectionArea = turf.area(intersection);
          const overlapPercentage = (intersectionArea / currentArea) * 100;

          // Max limit threshold set to 2% to account for expected budget GPS chip drift
          if (overlapPercentage > 2.0) {
            return { isValid: false, errorMessage: `OVERLAP_VIOLATION: Encroaches neighbor boundary by ${overlapPercentage.toFixed(1)}%.` };
          }
        }
      }

      return { isValid: true };
    } catch (e) {
      return { isValid: false, errorMessage: 'CRITICAL_GEOMETRY_ERROR: Invalid polygon structure.' };
    }
  }
}
