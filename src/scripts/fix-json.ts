import fs from 'fs'
import path from 'path'

async function fixJson() {
  try {
    // Read the file
    const filePath = path.join(process.cwd(), 'src/data/properties-missing-districts-fixed.json')
    const fileContent = fs.readFileSync(filePath, 'utf8')

    console.log('Reading JSON file...')

    // Clean up the content
    const cleanedContent = fileContent
      .replace(/\]\s*\[/g, ',')  // Replace adjacent arrays with comma
      .replace(/^\s*\[/, '[')    // Ensure single opening bracket
      .replace(/\]\s*$/, ']')    // Ensure single closing bracket
      .replace(/\]\s*,\s*\[/g, ',') // Replace any remaining array boundaries

    // Parse and re-stringify to ensure valid JSON
    const parsedData = JSON.parse(cleanedContent)
    const formattedJson = JSON.stringify(parsedData, null, 2)

    // Write the cleaned file
    const outputPath = path.join(process.cwd(), 'src/data/cleaned-properties.json')
    fs.writeFileSync(outputPath, formattedJson)

    console.log(`Successfully cleaned and saved JSON file`)
    console.log(`Total properties: ${parsedData.length}`)

  } catch (error) {
    console.error('Error fixing JSON:', error)
  }
}

console.log('Starting JSON fix...')
fixJson()
  .then(() => console.log('JSON fix completed'))
  .catch(error => console.error('JSON fix failed:', error)) 