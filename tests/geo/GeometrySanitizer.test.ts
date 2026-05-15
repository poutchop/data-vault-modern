import { GeometrySanitizer } from '../../src/core/geo/GeometrySanitizer';
import * as turf from '@turf/turf';

describe('GeometrySanitizer', () => {

  it('Self-Intersection Test: Rejects Figure-8 polygon configuration', () => {
    // A classic Figure-8 self-intersecting polygon
    const figure8Polygon = turf.polygon([[
      [0, 0],
      [10, 10],
      [10, 0],
      [0, 10],
      [0, 0]
    ]]);

    const result = GeometrySanitizer.validateFarmPolygon(figure8Polygon, []);
    
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('CRITICAL_GEOMETRY_ERROR: Polygon borders intersect');
  });

  it('Neighbor Overlap Test: Rejects polygons with >2% overlap', () => {
    // Base 10x10 square (Area: 100)
    const baseSquare = turf.polygon([[
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [0, 0]
    ]]);

    // Overlapping 10x10 square
    // Area of intersection will be exactly 10% (10 out of 100)
    const overlappingSquare = turf.polygon([[
      [9, 0],
      [19, 0],
      [19, 10],
      [9, 10],
      [9, 0]
    ]]);

    const result = GeometrySanitizer.validateFarmPolygon(overlappingSquare, [baseSquare]);
    
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('OVERLAP_VIOLATION: Encroaches neighbor boundary');
  });

  it('Neighbor Overlap Test: Allows polygons with <2% overlap (budget GPS drift allowance)', () => {
    // Base 10x10 square (Area: 100)
    const baseSquare = turf.polygon([[
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [0, 0]
    ]]);

    // Very slightly overlapping square
    // Intersection width is 0.1, Height is 10. Area = 1 (which is 1% of 100)
    const slightlyOverlappingSquare = turf.polygon([[
      [9.9, 0],
      [19.9, 0],
      [19.9, 10],
      [9.9, 10],
      [9.9, 0]
    ]]);

    const result = GeometrySanitizer.validateFarmPolygon(slightlyOverlappingSquare, [baseSquare]);
    
    expect(result.isValid).toBe(true);
    expect(result.errorMessage).toBeUndefined();
  });
});
