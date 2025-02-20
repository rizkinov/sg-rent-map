import type { PropertyType } from '@/types/property'
import { URARentalRecord } from '@/types/ura'

interface URAResponse<T> {
  Result: T
  Status: string
  Message: string
}

const URA_BASE_URL = 'https://www.ura.gov.sg/uraDataService'

export async function fetchRentalData(): Promise<URARentalRecord[]> {
  try {
    // Sample data for testing
    const sampleData: URARentalRecord[] = [
      {
        project_name: "Sample Condo",
        property_type: "Condo",
        sqft: 1200,
        bedrooms: 3,
        bathrooms: 2,
        rental_price: 4500,
        latitude: 1.3521,
        longitude: 103.8198,
        created_at: new Date().toISOString()
      }
    ];

    console.log('Sample data:', JSON.stringify(sampleData, null, 2));
    return sampleData;

    /* Commented out URA API call for now
    const response = await fetch(`${URA_BASE_URL}/invokeUraDS?service=PMI_Resi_Rental&type=json`, {
      headers: {
        'AccessKey': URA_ACCESS_KEY,
        'Token': await getToken(),
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
    */
  } catch (error) {
    console.error('Error fetching rental data:', error);
    throw error;
  }
}

function mapPropertyType(uraType: string): PropertyType {
  const typeMap: Record<string, PropertyType> = {
    'Condominium': 'Condo',
    'Apartment': 'Condo',
    'HDB': 'HDB',
    'Terrace House': 'Landed',
    'Semi-Detached House': 'Landed',
    'Detached House': 'Landed'
  }

  return typeMap[uraType] || 'Condo'
}

function calculateBathrooms(bedrooms: number): number {
  // Estimate bathrooms based on bedrooms
  if (bedrooms <= 1) return 1
  if (bedrooms <= 3) return 2
  return 3
} 