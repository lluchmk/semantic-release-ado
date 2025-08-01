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

## Semantic Commit Messages

This package follows the [Semantic Versioning](https://semver.org/) specification. The version numbers are automatically determined from commit messages following the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Types and Their Effect on Versioning

| Commit Type | Example                                    | Version Bump | Description                                         |
|-------------|-------------------------------------------|--------------|-----------------------------------------------------|
| `fix:`      | `fix: resolve null pointer in logging`     | PATCH (0.0.1)| Bug fixes, patches                                 |
| `feat:`     | `feat: add new output format option`       | MINOR (0.1.0)| New features that don't break existing functionality|
| `perf:`     | `perf: improve query performance by 50%`   | PATCH (0.0.1)| Performance improvements                           |
| `BREAKING CHANGE:` | `feat!: change API response format` | MAJOR (1.0.0)| Breaking changes (note the `!`)                    |
| `docs:`     | `docs: update README.md`                   | No release   | Documentation updates only                          |
| `style:`    | `style: format code according to standards`| No release   | Code style changes that don't affect functionality  |
| `refactor:` | `refactor: simplify authentication logic`  | No release   | Code changes that neither fix bugs nor add features |
| `test:`     | `test: add unit tests for auth module`     | No release   | Adding or modifying tests                          |
| `chore:`    | `chore: update dependencies`               | No release   | Maintenance tasks                                   |

### Example Commit Messages

```
# Patch Release (0.0.1)
fix: prevent crash when connection fails

# Minor Release (0.1.0) 
feat: add support for Azure DevOps Server

# Major Release (1.0.0)
feat!: change plugin API
```

or

```
# Major Release (1.0.0)
feat: add new workflow feature

BREAKING CHANGE: The previous workflow syntax is no longer supported
```

### Tag Generation Based on Commit Types

When you use these commit types, the GitHub Actions workflow will automatically:

1. Analyze your commits since the last release
2. Determine the appropriate version bump (patch, minor, or major)
3. Update version numbers in package.json
4. Create a Git tag with the new version (e.g., `v1.2.3`)
5. Generate release notes from your commits

To manually create a release:

1. Make your changes and commit them with the appropriate prefix
2. Push to the master branch to trigger the semantic-release workflow

Example commit flow:
```bash
# Make changes to fix a bug
git add .
git commit -m "fix: resolve issue with variable not being set correctly"
git push origin master

# Workflow will automatically create v1.0.1 if the previous version was v1.0.0
```

### Helper Script for Semantic Commits

This repository includes a helper script to create properly formatted semantic commits:

```bash
# Make your code changes first
git add .

# Use the helper script instead of regular git commit
./tools/semantic-commit.sh --type feat --scope auth --message "add OAuth2 support"

# For a breaking change
./tools/semantic-commit.sh --type feat --message "redesign API" --breaking

# For a bug fix with detailed description
./tools/semantic-commit.sh --type fix --message "fix memory leak" \
  --description "Resolved memory leak in the connection pooling logic"

# Push to trigger the release workflow
git push origin master
```

The script is located at `./tools/semantic-commit.sh` and provides interactive guidance for creating semantic commits.

### VS Code Integration

For Visual Studio Code users, this repository includes a task definition that makes creating semantic commits even easier:

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
2. Type "Tasks: Run Task" and select it
3. Choose "Semantic Commit"
4. Follow the interactive prompts to select:
   - Commit type (fix, feat, etc.)
   - Commit message
   - Scope (optional)
   - Breaking change flag
   - Extended description (optional)

This integration eliminates the need to remember the commit format syntax and streamlines the semantic commit process.

## GitHub Actions Integration

This package now supports automated releases using GitHub Actions. The enhanced workflow is set up to:

1. Run automatically on pushes to the master branch
2. Run tests on pull requests to master (without releasing)
3. Execute semantic-release to automatically determine the next version number
4. Create GitHub releases with changelogs
5. Publish to npm (if configured with NPM_TOKEN)
6. Store the version number as an output variable for use in subsequent workflows

### Setup

1. Ensure your repository has the `.github/workflows/semantic-release.yml` file
2. If publishing to npm, add an `NPM_TOKEN` secret in your GitHub repository settings
3. Use semantic commit messages to control version bumps:
   - `feat:` - Minor version bump (new features)
   - `fix:` - Patch version bump (bug fixes)
   - `BREAKING CHANGE:` - Major version bump (breaking changes)

### Manual Triggering

You can manually trigger the release workflow from the GitHub Actions tab in your repository with additional options:

1. **Dry Run** - Test the release process without actually publishing
2. **Debug Mode** - Run with enhanced logging for troubleshooting

### Workflow Features

- **Separate Test Job** - Ensures all tests pass before attempting a release
- **Permissions Management** - Explicitly configured for GitHub token scopes
- **Version Output** - Makes the released version available to downstream workflows
- **PR Validation** - Tests PRs without performing a release
- **Package Lock Management** - Automatically fixes outdated package-lock.json files
- **Git Tag Generation** - Automatically creates Git tags for released versions

### Automatic Git Tag Generation

The workflow now includes automatic Git tag creation:

1. After a successful semantic-release, a tag is created in the format `v1.2.3` 
2. This tag is pushed to the repository automatically
3. You can manually trigger tag creation using the "Create Release Tag" workflow:
   - This is useful for creating tags for existing versions
   - The workflow takes a version parameter (e.g., `v1.2.3`)
   - It checks if the tag already exists before creating it

Tags are useful for:
- Keeping track of releases in Git history
- Enabling easy checkout of specific versions
- Integration with other CI/CD systems that rely on Git tags
- Creating GitHub releases based on tags

### Automatic Package Lock Handling

The workflow is designed to handle outdated package-lock.json files automatically:

1. It first tries to use the faster `npm ci` command
2. If that fails due to an outdated lock file, it falls back to `npm install`
3. If package-lock.json is updated, the workflow commits the changes back to the repository
4. This ensures that the repository always has an up-to-date package-lock.json file

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
      
      # Use Git tag if it exists
      - name: Check for Git tag
        id: check_tag
        run: |
          TAG_NAME="v$VERSION"
          if git rev-parse "$TAG_NAME" >/dev/null 2>&1; then
            echo "TAG_EXISTS=true" >> $GITHUB_OUTPUT
            echo "TAG_NAME=$TAG_NAME" >> $GITHUB_OUTPUT
            echo "Found tag: $TAG_NAME"
          else
            echo "TAG_EXISTS=false" >> $GITHUB_OUTPUT
            echo "Tag $TAG_NAME not found"
          fi
      
      - name: Deploy with version
        run: |
          echo "Deploying version $VERSION"
          if [[ "${{ steps.check_tag.outputs.TAG_EXISTS }}" == "true" ]]; then
            echo "Using Git tag: ${{ steps.check_tag.outputs.TAG_NAME }}"
            git checkout "${{ steps.check_tag.outputs.TAG_NAME }}"
          fi
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
