const fs = require('fs')
const path = require('path')

module.exports = async (pluginConfig, { nextRelease, logger }) => {
  const writeNotesFile = pluginConfig.writeNotesFile || false
  const notesFilePath = pluginConfig.notesFilePath || 'CHANGELOG-latest.md'
  const notesFileBehaviour = pluginConfig.notesFileBehaviour || 'prepend'

  if (!writeNotesFile) {
    return nextRelease.notes
  }

  try {
    logger.log(`Writing release notes to ${notesFilePath}`)

    const absolutePath = path.resolve(notesFilePath)
    const fileContent = nextRelease.notes || ''

    // Check if file exists
    let finalContent = fileContent

    if (fs.existsSync(absolutePath)) {
      const existingContent = fs.readFileSync(absolutePath, 'utf8')

      if (notesFileBehaviour === 'prepend') {
        // Add new notes to top, with separator
        finalContent = fileContent + '\n\n---\n\n' + existingContent
      } else if (notesFileBehaviour === 'append') {
        // Add new notes to bottom, with separator
        finalContent = existingContent + '\n\n---\n\n' + fileContent
      } else if (notesFileBehaviour === 'overwrite') {
        // Replace entire file
        finalContent = fileContent
      }
    }

    // Write file
    fs.writeFileSync(absolutePath, finalContent, 'utf8')
    logger.log(`Release notes written successfully to ${notesFilePath}`)
  } catch (error) {
    logger.error(`Failed to write release notes to file: ${error.message}`)
    throw error
  }

  // Return notes unchanged so other plugins can use them
  return nextRelease.notes
}
