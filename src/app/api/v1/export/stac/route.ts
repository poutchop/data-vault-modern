import { NextResponse } from 'next/server';

export async function GET() {
  const stacCatalog = {
    "type": "Catalog",
    "id": "dmrv-field-assets",
    "title": "Data Vault Field Assets Catalog",
    "description": "SpatioTemporal Asset Catalog of field photos, drone surveys, and masks.",
    "stac_version": "1.0.0",
    "links": [
      {
        "rel": "self",
        "href": "https://api.datavault.com/stac",
        "type": "application/json"
      },
      {
        "rel": "item",
        "href": "https://api.datavault.com/stac/items/img-001",
        "type": "application/json"
      }
    ],
    "extent": {
      "spatial": {
        "bbox": [
          [-0.25, 5.70, -0.20, 5.80]
        ]
      },
      "temporal": {
        "interval": [
          ["2026-01-01T00:00:00Z", null]
        ]
      }
    }
  };

  return NextResponse.json(stacCatalog);
}
