const execa = require('execa')

module.exports = async (pluginConfig, { nextRelease: { version }, logger }) => {
  const varName = pluginConfig.varName || 'nextRelease'
  logger.log(`Setting version ${version} to the env var ${varName}`)

  execa('echo', [`'##vso[task.setvariable variable=${varName}]${version}`])
    .stdout.pipe(process.stdout)
}
