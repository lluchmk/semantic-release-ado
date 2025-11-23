module.exports = async (pluginConfig, { nextRelease, logger }) => {
  const varName = pluginConfig.varName || 'nextRelease'
  const isOutput = pluginConfig.isOutput || false
  const setReleaseObjectVariables = pluginConfig.setReleaseObjectVariables || false
  const setWouldRelease = pluginConfig.setWouldRelease || false

  logger.log(`Setting version ${nextRelease.version} to the env var ${varName}`)

  console.log(`##vso[task.setvariable variable=${varName};isOutput=${isOutput}]${nextRelease.version}`)

  if (setWouldRelease) {
    const wouldReleaseVarName = pluginConfig.wouldReleaseVarName || 'would_release'
    logger.log(`Setting would_release to true`)
    console.log(`##vso[task.setvariable variable=${wouldReleaseVarName};isOutput=${isOutput}]true`)
  }

  if (setReleaseObjectVariables) {
    const releaseVersionVarName = pluginConfig.releaseVersionVarName || 'releaseVersion'
    const releaseTypeVarName = pluginConfig.releaseTypeVarName || 'releaseType'
    const releaseGitHeadVarName = pluginConfig.releaseGitHeadVarName || 'releaseGitHead'
    const releaseGitTagVarName = pluginConfig.releaseGitTagVarName || 'releaseGitTag'
    const releaseChannelVarName = pluginConfig.releaseChannelVarName || 'releaseChannel'

    if (nextRelease.version) {
      logger.log(`Setting release version ${nextRelease.version} to the env var ${releaseVersionVarName}`)
      console.log(`##vso[task.setvariable variable=${releaseVersionVarName};isOutput=${isOutput}]${nextRelease.version}`)
    }

    if (nextRelease.type) {
      logger.log(`Setting release type ${nextRelease.type} to the env var ${releaseTypeVarName}`)
      console.log(`##vso[task.setvariable variable=${releaseTypeVarName};isOutput=${isOutput}]${nextRelease.type}`)
    }

    if (nextRelease.gitHead) {
      logger.log(`Setting release gitHead ${nextRelease.gitHead} to the env var ${releaseGitHeadVarName}`)
      console.log(`##vso[task.setvariable variable=${releaseGitHeadVarName};isOutput=${isOutput}]${nextRelease.gitHead}`)
    }

    if (nextRelease.gitTag) {
      logger.log(`Setting release gitTag ${nextRelease.gitTag} to the env var ${releaseGitTagVarName}`)
      console.log(`##vso[task.setvariable variable=${releaseGitTagVarName};isOutput=${isOutput}]${nextRelease.gitTag}`)
    }

    if (nextRelease.channel) {
      logger.log(`Setting release channel ${nextRelease.channel} to the env var ${releaseChannelVarName}`)
      console.log(`##vso[task.setvariable variable=${releaseChannelVarName};isOutput=${isOutput}]${nextRelease.channel}`)
    }
  }
}
