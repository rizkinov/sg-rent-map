import fs from 'fs'
import path from 'path'

const filesToDelete = [
  'properties-missing-districts-fixed.json',
  'properties-backup.json',
  'properties (backup).json'
]

async function cleanupFiles() {
  console.log('Starting cleanup...')
  
  for (const file of filesToDelete) {
    const filePath = path.join(process.cwd(), 'src/data', file)
    
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        console.log(`✅ Deleted: ${file}`)
      } else {
        console.log(`⏭️ Skipped: ${file} (not found)`)
      }
    } catch (error) {
      console.error(`❌ Failed to delete ${file}:`, error)
    }
  }
}

console.log('Running cleanup...')
cleanupFiles()
  .then(() => console.log('Cleanup completed!'))
  .catch(error => console.error('Cleanup failed:', error)) 