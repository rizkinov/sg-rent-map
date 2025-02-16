export interface District {
  id: number;
  name: string;
  region: string;
  coordinates: {
    lat: number;
    lng: number;
  }[];
}

export interface DistrictGeoJSON {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    properties: {
      name: string;
      district_id: number;
      region: string;
    };
    geometry: {
      type: "Polygon" | "MultiPolygon";
      coordinates: number[][][];
    };
  }[];
} 