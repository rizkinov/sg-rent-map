import fs from 'fs'
import path from 'path'

async function cleanDistrictsData() {
  try {
    // Read the file
    const filePath = path.join(process.cwd(), 'src/data/properties-missing-districts-fixed.json')
    const fileContent = fs.readFileSync(filePath, 'utf8')

    console.log('Reading properties data...')

    // First, let's clean up the file content
    const cleanedContent = fileContent
      // Remove any potential BOM characters
      .replace(/^\uFEFF/, '')
      // Remove any extra newlines between arrays
      .replace(/\]\s+\[/g, '],[')
      // Ensure we have a single array by wrapping in brackets
      .replace(/^\s*\[/, '[')
      .replace(/\]\s*$/, ']')

    // Try to parse the entire content as a single array
    let allProperties
    try {
      allProperties = JSON.parse(cleanedContent)
    } catch (parseError) {
      console.log('Failed to parse as single array, trying alternative method...')
      // If that fails, try to split and parse individual arrays
      const arrayStrings = cleanedContent.match(/\[[^\]]*\]/g) || []
      allProperties = arrayStrings.map(str => JSON.parse(str)).flat()
    }

    // Remove duplicates and sort
    const uniqueProperties = Array.from(
      new Map(allProperties.map(item => [item.name, item])).values()
    ).sort((a, b) => a.name.localeCompare(b.name))

    // Write back the cleaned data
    const outputPath = path.join(process.cwd(), 'src/data/cleaned-properties.json')
    fs.writeFileSync(
      outputPath,
      JSON.stringify(uniqueProperties, null, 2)
    )

    console.log(`\nCleaned and saved ${uniqueProperties.length} properties`)

  } catch (error) {
    console.error('Error cleaning data:', error)
    process.exit(1)
  }
}

// Run the cleaning process
console.log('Starting data cleaning process...')
cleanDistrictsData()
  .then(() => console.log('Data cleaning completed'))
  .catch(error => console.error('Data cleaning failed:', error)) 