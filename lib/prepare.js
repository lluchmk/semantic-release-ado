const execa = require('execa')

module.exports = async (pluginConfig, { nextRelease: { version }, logger }) => {
  logger.log(`Setting version ${version} to the env var ${pluginConfig.varName}`)

  execa('echo', [`'##vso[task.setvariable variable=${pluginConfig.varName}]${version}'`])
    .stdout.pipe(process.stdout)
}
