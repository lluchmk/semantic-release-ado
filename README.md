# semantic-release-ado

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Build Status](https://klluch.visualstudio.com/semantic-release-ado/_apis/build/status/semantic-release-ado-CI?branchName=master)](https://klluch.visualstudio.com/semantic-release-ado/_build/latest?definitionId=10&branchName=master)

Semantic release plugin for automatic builds on Azure DevOps pipelines.

| Step             | Description |
|------------------|-------------|
| `analyzeCommits` | If configured to do so, stores the current version as an Azure DevOps pipeline variable. |
| `verifyRelease`  | Stores the next version as an Azure DevOps pipeline variable availabe to downstream steps on the job. |

## Install

```bash
$ npm install -D semantic-release-ado
```

## Usage

The plugin can be configured in the [**semantic-release** configuration file](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#configuration):

`YAML`:
```yaml
plugins:
  - @semantic-release-ado"
```

`JSON`:
```json
{
  "plugins": [
    "semantic-release-ado",
  ]
}
```

The generated version number will be stored on a variable availabe to downstream steps on the job.
By default this variable is named *nextRelease*, but the name can be configured in the plugin options.
The behavior when no new release is available can be configured with *setOnlyOnRelease*.

## Configuration

### Options

| **Options**      | **Desctiption**                                       |
|------------------|-------------------------------------------------------|
| varName          | Name of the variable that will store the next version. Defaults to *nextRelease*. |
| setOnlyOnRelease | `Bool`. Determines if the variable with the new version will be set only when a new version is available. <br> If set to `false`, the next version variable will store the last released version when no new version is available.<br> Defaults to *true*. |
| isOutput         | `Bool`. Determines whether the version will be set as an output variable, so it is available in later stages.<br> Defaults to *false*. |


The following examples store the generated version number in a variable named *version*.

`YAML`:
```yaml
plugins:
  - - "semantic-release-ado"
    - varName: "version"
      setOnlyOnRelease: true
      isOutput: true #defaults to false
```

`JSON`:
```json
{
  "plugins": [
    ["semantic-release-ado", {
      "varName": "version",
      "setOnlyOnRelease": true,
      "isOutput": true //defaults to false
    }],
  ]
}
```

## Azure DevOps build pipeline YAML example:

Using the variable on the seme job:
```yaml
jobs:
- job: Build
  pool:
    vmImage: 'vs2017-win2016'
  steps:

  - script: >
      npx -p semantic-release
      -p @semantic-release/git
      -p semantic-release-ado
      semantic-release
    env: { GH_TOKEN: $(GitHubToken) }
    displayName: 'Semantic release'

  - script: echo $(nextRelease)
    displayName: 'Show next version'
```
### Using the variable on a later job:
### Configuration:
Below is the configuration for setting `isOutput` to true, which will allow the variable to be referenced from other jobs/stages

`JSON`: 
```json
{
  "plugins": [
    ["semantic-release-ado", {
      "varName": "version",
      "setOnlyOnRelease": true,
      "isOutput": true //sets version as output for later use
    }],
  ]
}
```

### In another job:

```yaml
jobs:
- job: Job1
  pool:
    vmImage: 'vs2017-win2016'

  steps:
  - script: >
      npx -p semantic-release
      -p @semantic-release/git
      -p semantic-release-ado
      semantic-release
    env: { GH_TOKEN: $(GitHubToken) }
    displayName: 'Semantic release'

- job: Job2
  dependsOn: Job1
  pool:
    vmImage: 'vs2017-win2016'
  variables:
    versionNumber: $[ dependencies.Job1.outputs['setOutputVar.versionNumber'] ]

  steps:
  - script: echo $(versionNumber)
    displayName: 'Show next version'
```

### In another stage:

```yaml
stages: 
  - stage: Stage1
    jobs:
    - job: Job1
      pool:
        vmImage: 'vs2017-win2016'

      steps:
      - script: >
          npx -p semantic-release
          -p @semantic-release/git
          -p semantic-release-ado
          semantic-release
        env: { GH_TOKEN: $(GitHubToken) }
        name: semantic-release
        displayName: 'Semantic release'

  - stage: Stage2
    dependsOn: Stage1
    #want to make sure variable is set before we continue to run the stage
    condition: and(succeeded(), ne(dependencies.Stage1.outputs['Job1.semantic-release.version'], ''))
    jobs:
    - job: Job2
      variables:
          versionNumber: $[ stageDependencies.Stage1.Job1.outputs['semantic-release.version'] ]
      pool:
        vmImage: 'vs2017-win2016'
      variables:
        versionNumber:
      steps:
      - script: echo $(versionNumber)
        displayName: 'Show next version'
```

