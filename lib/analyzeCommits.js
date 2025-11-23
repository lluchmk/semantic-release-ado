module.exports = async (pluginConfig, { lastRelease, logger }) => {
  const setOnlyOnRelease = pluginConfig.setOnlyOnRelease === undefined ? true : !!pluginConfig.setOnlyOnRelease
  const isOutput = pluginConfig.isOutput || false
  const setLastReleaseObjectVariables = pluginConfig.setLastReleaseObjectVariables || false
  const setWouldRelease = pluginConfig.setWouldRelease || false

  if (!setOnlyOnRelease && lastRelease && lastRelease.version) {
    const varName = pluginConfig.varName || 'nextRelease'
    logger.log(`Setting current version ${lastRelease.version} to the env var ${varName}`)

    console.log(`##vso[task.setvariable variable=${varName};isOutput=${isOutput}]${lastRelease.version}`)
  }

  if (setWouldRelease) {
    const wouldReleaseVarName = pluginConfig.wouldReleaseVarName || 'would_release'
    logger.log(`Setting would_release to false (no release determined yet)`)
    console.log(`##vso[task.setvariable variable=${wouldReleaseVarName};isOutput=${isOutput}]false`)
  }

  if (setLastReleaseObjectVariables && lastRelease) {
    const lastReleaseVersionVarName = pluginConfig.lastReleaseVersionVarName || 'lastReleaseVersion'
    const lastReleaseGitHeadVarName = pluginConfig.lastReleaseGitHeadVarName || 'lastReleaseGitHead'
    const lastReleaseGitTagVarName = pluginConfig.lastReleaseGitTagVarName || 'lastReleaseGitTag'
    const lastReleaseChannelVarName = pluginConfig.lastReleaseChannelVarName || 'lastReleaseChannel'

    if (lastRelease.version) {
      logger.log(`Setting last release version ${lastRelease.version} to the env var ${lastReleaseVersionVarName}`)
      console.log(`##vso[task.setvariable variable=${lastReleaseVersionVarName};isOutput=${isOutput}]${lastRelease.version}`)
    }

    if (lastRelease.gitHead) {
      logger.log(`Setting last release gitHead ${lastRelease.gitHead} to the env var ${lastReleaseGitHeadVarName}`)
      console.log(`##vso[task.setvariable variable=${lastReleaseGitHeadVarName};isOutput=${isOutput}]${lastRelease.gitHead}`)
    }

    if (lastRelease.gitTag) {
      logger.log(`Setting last release gitTag ${lastRelease.gitTag} to the env var ${lastReleaseGitTagVarName}`)
      console.log(`##vso[task.setvariable variable=${lastReleaseGitTagVarName};isOutput=${isOutput}]${lastRelease.gitTag}`)
    }

    if (lastRelease.channel) {
      logger.log(`Setting last release channel ${lastRelease.channel} to the env var ${lastReleaseChannelVarName}`)
      console.log(`##vso[task.setvariable variable=${lastReleaseChannelVarName};isOutput=${isOutput}]${lastRelease.channel}`)
    }
  }
}
