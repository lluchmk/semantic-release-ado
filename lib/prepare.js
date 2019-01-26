module.exports = async (pluginConfig, { nextRelease: { version }, logger }) => {
  const varName = pluginConfig.varName || 'nextRelease'
  logger.log(`Setting version ${version} to the env var ${varName}`)

  console.log(`##vso[task.setvariable variable=${varName}]${version}`)
}
