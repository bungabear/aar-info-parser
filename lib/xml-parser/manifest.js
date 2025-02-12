// From https://github.com/openstf/adbkit-apkreader
const BinaryXmlParser = require('./binary')
const TextXmlParser = require('./text')

const INTENT_MAIN = 'android.intent.action.MAIN'
const CATEGORY_LAUNCHER = 'android.intent.category.LAUNCHER'

class ManifestParser {
  constructor (buffer, options = {}) {
    this.buffer = buffer
    this.isText = buffer[0] === 0x3c && buffer[1] === 0x3f
    if (this.isText) {
      this.xmlParser = new TextXmlParser(this.buffer, options)
    } else {
      this.xmlParser = new BinaryXmlParser(this.buffer, options)
    }
  }

  collapseAttributes (element) {
    const collapsed = Object.create(null)
    for (let attr of Array.from(element.attributes)) {
      collapsed[attr.name] = attr.typedValue.value
    }
    return collapsed
  }

  parseIntents (element, target) {
    target.intentFilters = []
    target.metaData = []

    return element.childNodes.forEach(element => {
      switch (element.nodeName) {
        case 'intent-filter': {
          const intentFilter = this.collapseAttributes(element)

          intentFilter.actions = []
          intentFilter.categories = []
          intentFilter.data = []

          element.childNodes.forEach(element => {
            switch (element.nodeName) {
              case 'action':
                intentFilter.actions.push(this.collapseAttributes(element))
                break
              case 'category':
                intentFilter.categories.push(this.collapseAttributes(element))
                break
              case 'data':
                intentFilter.data.push(this.collapseAttributes(element))
                break
            }
          })

          target.intentFilters.push(intentFilter)
          break
        }
        case 'meta-data':
          target.metaData.push(this.collapseAttributes(element))
          break
      }
    })
  }

  parseApplication (element) {
    const app = this.collapseAttributes(element)

    app.activities = []
    app.activityAliases = []
    app.launcherActivities = []
    app.services = []
    app.receivers = []
    app.providers = []
    app.usesLibraries = []
    app.metaData = []

    element.childNodes.forEach(element => {
      switch (element.nodeName) {
        case 'activity': {
          const activity = this.collapseAttributes(element)
          this.parseIntents(element, activity)
          app.activities.push(activity)
          if (this.isLauncherActivity(activity)) {
            app.launcherActivities.push(activity)
          }
          break
        }
        case 'activity-alias': {
          const activityAlias = this.collapseAttributes(element)
          this.parseIntents(element, activityAlias)
          app.activityAliases.push(activityAlias)
          if (this.isLauncherActivity(activityAlias)) {
            app.launcherActivities.push(activityAlias)
          }
          break
        }
        case 'service': {
          const service = this.collapseAttributes(element)
          this.parseIntents(element, service)
          app.services.push(service)
          break
        }
        case 'receiver': {
          const receiver = this.collapseAttributes(element)
          this.parseIntents(element, receiver)
          app.receivers.push(receiver)
          break
        }
        case 'provider': {
          const provider = this.collapseAttributes(element)

          provider.grantUriPermissions = []
          provider.metaData = []
          provider.pathPermissions = []

          element.childNodes.forEach(element => {
            switch (element.nodeName) {
              case 'grant-uri-permission':
                provider.grantUriPermissions.push(this.collapseAttributes(element))
                break
              case 'meta-data':
                provider.metaData.push(this.collapseAttributes(element))
                break
              case 'path-permission':
                provider.pathPermissions.push(this.collapseAttributes(element))
                break
            }
          })

          app.providers.push(provider)
          break
        }
        case 'uses-library':
          app.usesLibraries.push(this.collapseAttributes(element))
          break
        case 'meta-data':
          app.metaData.push(this.collapseAttributes(element))
          break
      }
    })

    return app
  }

  isLauncherActivity (activity) {
    return activity.intentFilters.some(function (filter) {
      const hasMain = filter.actions.some(action => action.name === INTENT_MAIN)
      if (!hasMain) {
        return false
      }
      return filter.categories.some(category => category.name === CATEGORY_LAUNCHER)
    })
  }

  parse () {
    const document = this.xmlParser.parse().manifest[0]
    console.log(JSON.stringify(document, null, '\t'))
    let manifest
    if (this.isText) {
      manifest = {}
      manifest.package = document.attr.package
      manifest.versionCode = document.attr['android:versionCode']
      manifest.versionName = document.attr['android:versionName']
      let permissions = document['uses-permission']
      if (!!permissions && permissions.length > 0) {
        manifest.usesPermissions = permissions.map(attr => {
          return { name: attr['attr']['android:name'] }
        })
      } else {
        manifest.usesPermissions = []
      }
      let usesSdk = document['uses-sdk'][0]['attr']
      manifest.usesSdk = {
        minSdkVersion: usesSdk['android:minSdkVersion'],
        targetSdkVersion: usesSdk['android:targetSdkVersion']
      }

      let application = document.application[0].attr
      manifest.application = {
        debuggable: application['android:debuggable'],
        testOnly: application['android:detestOnlybuggable'],
        allowBackup: application['android:allowBackup'],
        supportsRtl: application['android:supportsRtl'],
        usesCleartextTraffic: application['android:usesCleartextTraffic']
      }
    } else {
      manifest = this.collapseAttributes(document)

      manifest.usesPermissions = []
      manifest.permissions = []
      manifest.permissionTrees = []
      manifest.permissionGroups = []
      manifest.instrumentation = null
      manifest.usesSdk = null
      manifest.usesConfiguration = null
      manifest.usesFeatures = []
      manifest.supportsScreens = null
      manifest.compatibleScreens = []
      manifest.supportsGlTextures = []
      manifest.application = Object.create(null)

      document.childNodes.forEach(element => {
        switch (element.nodeName) {
          case 'uses-permission':
            manifest.usesPermissions.push(this.collapseAttributes(element))
            break
          case 'permission':
            manifest.permissions.push(this.collapseAttributes(element))
            break
          case 'permission-tree':
            manifest.permissionTrees.push(this.collapseAttributes(element))
            break
          case 'permission-group':
            manifest.permissionGroups.push(this.collapseAttributes(element))
            break
          case 'instrumentation':
            manifest.instrumentation = this.collapseAttributes(element)
            break
          case 'uses-sdk':
            manifest.usesSdk = this.collapseAttributes(element)
            break
          case 'uses-configuration':
            manifest.usesConfiguration = this.collapseAttributes(element)
            break
          case 'uses-feature':
            manifest.usesFeatures.push(this.collapseAttributes(element))
            break
          case 'supports-screens':
            manifest.supportsScreens = this.collapseAttributes(element)
            break
          case 'compatible-screens':
            element.childNodes.forEach(screen => {
              return manifest.compatibleScreens.push(this.collapseAttributes(screen))
            })
            break
          case 'supports-gl-texture':
            manifest.supportsGlTextures.push(this.collapseAttributes(element))
            break
          case 'application':
            manifest.application = this.parseApplication(element)
            break
        }
      })
    }
    return manifest
  }
}

module.exports = ManifestParser
