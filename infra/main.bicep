@description('Name of the Azure Static Web App resource')
param appName string = 'cerevyn-memory-game'

@description('Azure datacenter location for deployment')
param location string = 'eastus2'

@description('Static Web Apps pricing tier (Free for dev/test, Standard for custom SLA and domains)')
@allowed([
  'Free'
  'Standard'
])
param skuTier string = 'Free'

@description('Repository URL for CI/CD tracking')
param repositoryUrl string = 'https://github.com/example/cerevyn'

@description('Branch used for deployment')
param branch string = 'main'

resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: appName
  location: location
  sku: {
    name: skuTier
    tier: skuTier
  }
  properties: {
    repositoryUrl: repositoryUrl
    branch: branch
    buildProperties: {
      appLocation: '/'
      outputLocation: 'dist'
      appBuildCommand: 'npm run build'
      skipGithubActionWorkflowGeneration: true
    }
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
  }
}

output staticWebAppDefaultHostname string = staticWebApp.properties.defaultHostname
output staticWebAppId string = staticWebApp.id
output staticWebAppName string = staticWebApp.name
