import * as turf from '@turf/turf';

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
}

/**
 * Validates a polygon geometry to ensure it doesn't self-intersect and doesn't 
 * excessively overlap with existing cached polygons.
 * 
 * @param coordinates The GeoJSON polygon coordinates (e.g. [[[lng, lat], ...]])
 * @param cachedPolygons Array of existing GeoJSON polygons
 * @returns ValidationResult
 */
export function validateMicroPolygon(
  coordinates: number[][][], 
  cachedPolygons: any[] = []
): ValidationResult {
  try {
    const poly = turf.polygon(coordinates);
    
    // 1. Check for self-intersections (Kinks)
    const kinks = turf.kinks(poly);
    if (kinks.features.length > 0) {
      return { isValid: false, reason: 'Polygon self-intersects. Please redraw boundaries without crossing lines.' };
    }

    // 2. Overlap checks
    const area = turf.area(poly);
    for (const cached of cachedPolygons) {
      const cachedPoly = turf.polygon(cached.coordinates);
      const intersection = turf.intersect(turf.featureCollection([poly, cachedPoly]));
      
      if (intersection) {
        const overlapArea = turf.area(intersection);
        const overlapPercentage = (overlapArea / area) * 100;
        
        // Strict >2% overlap rejection rule
        if (overlapPercentage > 2) {
          return { 
            isValid: false, 
            reason: `Polygon overlaps an existing boundary by ${overlapPercentage.toFixed(1)}% (Limit is 2%).` 
          };
        }
      }
    }

    return { isValid: true };
  } catch (e) {
    console.error("Topology check failed", e);
    return { isValid: false, reason: 'Invalid geometry format.' };
  }
}
