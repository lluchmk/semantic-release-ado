module.exports = async (pluginConfig, { lastRelease: { version }, logger }) => {
  const setOnlyOnRelease = pluginConfig.setOnlyOnRelease === undefined ? true : !!pluginConfig.setOnlyOnRelease

  if (!setOnlyOnRelease) {
    const varName = pluginConfig.varName || 'nextRelease'
    const isOutput = pluginConfig.isOutput || false
    logger.log(`Setting current version ${version} to the env var ${varName}`)

    // Output for Azure DevOps
    console.log(`##vso[task.setvariable variable=${varName};isOutput=${isOutput}]${version}`)
    
    // Output for GitHub Actions
    if (process.env.GITHUB_ACTIONS === 'true') {
      console.log(`::set-output name=${varName}::${version}`)
      // New GitHub Actions output syntax
      const githubOutput = process.env.GITHUB_OUTPUT
      if (githubOutput) {
        const fs = require('fs')
        fs.appendFileSync(githubOutput, `${varName}=${version}\n`)
      }
    }
  }
}
