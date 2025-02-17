export interface DistrictSummary {
  property_count: number
  avg_price: number
  property_types: {
    Condo: number
    HDB: number
    Landed: number
  }
  price_range: {
    min: number
    max: number
  }
  avg_size: number
}

export interface District {
  id: number
  name: string
  region: string
  center: {
    lat: number
    lng: number
  }
  boundaries: [number, number][]
  avgPrice?: number
  summary: string
}

export interface DistrictResponse {
  districts: District[]
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