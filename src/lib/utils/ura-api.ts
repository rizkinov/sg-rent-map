const URA_BASE_URL = 'https://www.ura.gov.sg/uraDataService'

interface URAResponse<T> {
  Result: T
  Status: string
  Message: string
}

export async function fetchRentalData(token: string) {
  try {
    // Sample data representing different areas and property types
    const sampleData = [
      // East Region
      {
        property_type: 'Condo',
        sqft: 750,
        bedrooms: 2,
        bathrooms: 2,
        rental_price: 3200,
        latitude: 1.3162,
        longitude: 103.9311, // Tampines
        created_at: new Date().toISOString(),
      },
      {
        property_type: 'HDB',
        sqft: 1200,
        bedrooms: 4,
        bathrooms: 2,
        rental_price: 2800,
        latitude: 1.3516,
        longitude: 103.9473, // Pasir Ris
        created_at: new Date().toISOString(),
      },
      
      // Central Region
      {
        property_type: 'Condo',
        sqft: 1800,
        bedrooms: 3,
        bathrooms: 3,
        rental_price: 6500,
        latitude: 1.3038,
        longitude: 103.8332, // Orchard
        created_at: new Date().toISOString(),
      },
      {
        property_type: 'Landed',
        sqft: 3500,
        bedrooms: 5,
        bathrooms: 4,
        rental_price: 12000,
        latitude: 1.3187,
        longitude: 103.8080, // Bukit Timah
        created_at: new Date().toISOString(),
      },

      // North Region
      {
        property_type: 'HDB',
        sqft: 900,
        bedrooms: 3,
        bathrooms: 2,
        rental_price: 2400,
        latitude: 1.4419,
        longitude: 103.8299, // Yishun
        created_at: new Date().toISOString(),
      },
      {
        property_type: 'Condo',
        sqft: 650,
        bedrooms: 1,
        bathrooms: 1,
        rental_price: 2800,
        latitude: 1.3801,
        longitude: 103.8451, // Bishan
        created_at: new Date().toISOString(),
      },

      // West Region
      {
        property_type: 'Condo',
        sqft: 1100,
        bedrooms: 3,
        bathrooms: 2,
        rental_price: 4200,
        latitude: 1.3349,
        longitude: 103.7436, // Jurong East
        created_at: new Date().toISOString(),
      },
      {
        property_type: 'HDB',
        sqft: 850,
        bedrooms: 2,
        bathrooms: 1,
        rental_price: 2100,
        latitude: 1.3483,
        longitude: 103.7490, // Jurong West
        created_at: new Date().toISOString(),
      },

      // Northeast Region
      {
        property_type: 'Condo',
        sqft: 900,
        bedrooms: 2,
        bathrooms: 2,
        rental_price: 3800,
        latitude: 1.3514,
        longitude: 103.8935, // Paya Lebar
        created_at: new Date().toISOString(),
      },
      {
        property_type: 'Landed',
        sqft: 2800,
        bedrooms: 4,
        bathrooms: 3,
        rental_price: 9500,
        latitude: 1.3790,
        longitude: 103.8570, // Ang Mo Kio
        created_at: new Date().toISOString(),
      }
    ];

    // Add logging
    console.log('Number of sample properties:', sampleData.length);
    console.log('Sample data:', JSON.stringify(sampleData, null, 2));
    
    return sampleData;

    /* Commented out URA API call for now
    const response = await fetch(`${URA_BASE_URL}/invokeUraDS?service=PMI_Resi_Rental&type=json`, {
      headers: {
        'AccessKey': process.env.URA_ACCESS_KEY!,
        'Token': token,
      }
    })

    if (!response.ok) {
      console.error('Response not OK:', await response.text())
      throw new Error('Failed to fetch URA rental data')
    }

    const data: URAResponse<any> = await response.json()
    console.log('Raw URA data:', JSON.stringify(data, null, 2))
    
    if (data.Status !== 'Success') {
      console.error('URA API Error:', data.Message)
      throw new Error(data.Message || 'Failed to fetch URA data')
    }

    const properties = data.Result.map((item: any) => {
      // ... existing mapping code ...
    }).filter(Boolean)

    console.log('Processed properties:', properties)
    return properties
    */

  } catch (error) {
    console.error('Error in fetchRentalData:', error)
    throw error
  }
}

function mapPropertyType(uraType: string): 'Condo' | 'HDB' | 'Landed' {
  // Map URA property types to our simplified categories
  const typeMap: Record<string, 'Condo' | 'HDB' | 'Landed'> = {
    'Apartment': 'Condo',
    'Condominium': 'Condo',
    'Detached House': 'Landed',
    'Semi-detached House': 'Landed',
    'Terrace House': 'Landed',
    'HDB': 'HDB',
  }
  return typeMap[uraType] || 'Condo'
}

function calculateBathrooms(bedrooms: number): number {
  // Estimate bathrooms based on bedrooms
  if (bedrooms <= 1) return 1
  if (bedrooms <= 3) return 2
  return 3
} 