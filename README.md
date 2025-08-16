# semantic-release-ado

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Build Status](https://klluch.visualstudio.com/semantic-release-ado/_apis/build/status/semantic-release-ado-CI?branchName=master)](https://klluch.visualstudio.com/semantic-release-ado/_build/latest?definitionId=10&branchName=master)
[![GitHub Actions](https://github.com/lluchmk/semantic-release-ado/actions/workflows/semantic-release.yml/badge.svg)](https://github.com/lluchmk/semantic-release-ado/actions/workflows/semantic-release.yml)

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

## GitHub Actions Integration

<<<<<<< HEAD
This package now supports automated releases using GitHub Actions. The enhanced workflow is set up to:

1. Run automatically on pushes to the master branch
2. Run tests on pull requests to master (without releasing)
3. Execute semantic-release to automatically determine the next version number
4. Create GitHub releases with changelogs
5. Publish to npm (if configured with NPM_TOKEN)
6. Store the version number as an output variable for use in subsequent workflows
=======
This package now supports automated releases using GitHub Actions. The configuration is set up to:

1. Run on pushes to the master branch
2. Execute semantic-release to automatically determine the next version number
3. Create GitHub releases
4. Publish to npm (if configured)
>>>>>>> 82045cd (added GitHub Actions feature)

### Setup

1. Ensure your repository has the `.github/workflows/semantic-release.yml` file
2. If publishing to npm, add an `NPM_TOKEN` secret in your GitHub repository settings
3. Use semantic commit messages to control version bumps:
   - `feat:` - Minor version bump (new features)
   - `fix:` - Patch version bump (bug fixes)
   - `BREAKING CHANGE:` - Major version bump (breaking changes)

### Manual Triggering

<<<<<<< HEAD
You can manually trigger the release workflow from the GitHub Actions tab in your repository with additional options:

1. **Dry Run** - Test the release process without actually publishing
2. **Debug Mode** - Run with enhanced logging for troubleshooting

### Workflow Features

- **Separate Test Job** - Ensures all tests pass before attempting a release
- **Permissions Management** - Explicitly configured for GitHub token scopes
- **Version Output** - Makes the released version available to downstream workflows
- **PR Validation** - Tests PRs without performing a release

For more details on semantic-release, check the [official documentation](https://semantic-release.gitbook.io/semantic-release/).

### Example: Using with Other GitHub Action Workflows

You can use the version output from the semantic-release workflow in subsequent workflows:

```yaml
name: Build and Deploy

on:
  workflow_run:
    workflows: ["Semantic Release"]
    types:
      - completed

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        
      - name: Get version
        run: |
          VERSION=$(node -p "require('./package.json').version")
          echo "VERSION=$VERSION" >> $GITHUB_ENV
      
      - name: Deploy with version
        run: |
          echo "Deploying version $VERSION"
          # Your deployment commands here
```

Alternatively, you can create dependent workflows that wait for semantic-release to complete:

### Example: GitHub Actions with Azure DevOps Integration

The `.github/workflows/semantic-release-ado.yml` workflow shows how to integrate semantic-release in GitHub Actions while still updating Azure DevOps variables:

```yaml
name: Semantic Release with ADO Integration

on:
  push:
    branches:
      - master
  workflow_dispatch:

jobs:
  release:
    name: Release and Update ADO
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
      pull-requests: write
      
    steps:
      - name: Checkout
        uses: actions/checkout@v3
          
      - name: Setup Node.js
        uses: actions/setup-node@v3
          
      - name: Semantic Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npx semantic-release
      
      - name: Get Version
        id: version
        run: |
          VERSION=$(node -p "require('./package.json').version")
          echo "VERSION=$VERSION" >> $GITHUB_OUTPUT
      
      - name: Update Azure DevOps Variable
        # Example of updating ADO variable - adapt to your ADO setup
        uses: microsoft/variable-substitution@v1
        with:
          files: 'azure-pipelines.yml'
        env:
          variables.version: ${{ steps.version.outputs.VERSION }}
```

This example shows how you can use semantic-release in GitHub Actions while still leveraging this package's Azure DevOps integration capabilities.

=======
You can manually trigger the release workflow from the GitHub Actions tab in your repository.

For more details on semantic-release, check the [official documentation](https://semantic-release.gitbook.io/semantic-release/).

>>>>>>> 82045cd (added GitHub Actions feature)
