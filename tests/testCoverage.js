const fs = require('fs')

const SKIP_FOLDERS = [
  {
    pattern: 'smart',
    reason: 'No smart components testing yet',
  },
  {
    pattern: 'AssessmentModule',
    reason: 'Assessment module is not in use for now',
  },
]

const main = async () => {
  let coveredComponents = 0
  let uncoveredComponents = 0
  let skippedComponents = 0
  const skippedMessageLog = []

  const readDir = async dir => {
    const exists = fs.existsSync(`${dir}/package.json`)
    if (exists) {
      const skippedPattern = SKIP_FOLDERS.find(skip => dir.includes(`/${skip.pattern}/`))
      if (skippedPattern) {
        skippedComponents += 1
        if (!skippedMessageLog.find(skip => skip.pattern === skippedPattern.pattern)) {
          skippedMessageLog.push(skippedPattern)
        }
        return
      }

      const files = await fs.promises.readdir(dir)
      const tsxFiles = files.filter(file => file.endsWith('.tsx') && !file.endsWith('.spec.tsx'))
      const specFiles = files.filter(file => file.endsWith('.spec.tsx'))

      if (tsxFiles.length > 0 && specFiles.length === 0) {
        uncoveredComponents += 1
        console.log(`\x1b[31m${dir}\x1b[0m`)
      } else if (tsxFiles.length > 0 && specFiles.length > 0) {
        coveredComponents += 1
      }
    } else {
      const files = await fs.promises.readdir(dir, { withFileTypes: true })
      for (const file of files) {
        if (file.isDirectory()) {
          await readDir(`${dir}/${file.name}`)
        }
      }
    }
  }

  await readDir('./src')

  skippedMessageLog.forEach(skip => console.log(`Skipping '${skip.pattern}' pattern. ${skip.reason}`))

  const percentage = (coveredComponents / (coveredComponents + uncoveredComponents)) * 100
  console.log(`\nSkipped components: ${skippedComponents}`)
  console.log(`Covered components: ${coveredComponents} / ${coveredComponents + uncoveredComponents}`)
  console.log(`\x1b[34mCoverage: ${percentage.toFixed(2)} %\x1b[0m`)
}

main()
