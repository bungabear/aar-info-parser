const Zip = require('./zip')
const { mapInfoResource, findAarIconPath, getBase64FromBuffer } = require('./utils')
const ManifestName = /^androidmanifest\.xml$/
const ResourceName = /^resources\.arsc$/

const ManifestXmlParser = require('./xml-parser/manifest')
const ResourceFinder = require('./resource-finder')

class AarParser extends Zip {
  /**
   * parser for parsing .aar file
   * @param {String | File | Blob} file // file's path in Node, instance of File or Blob in Browser
   */
  constructor (file) {
    super(file)
    if (!(this instanceof AarParser)) {
      return new AarParser(file)
    }
  }
  parse () {
    return new Promise((resolve, reject) => {
      this.getEntries([ManifestName]).then(buffers => {
        if (!buffers[ManifestName]) {
          throw new Error('AndroidManifest.xml can\'t be found.')
        }
        let aarInfo = this._parseManifest(buffers[ManifestName])
        let resourceMap
        if (!buffers[ResourceName]) {
          resolve(aarInfo)
        } else {
          // parse resourceMap
          resourceMap = this._parseResourceMap(buffers[ResourceName])
          // update aarInfo with resourceMap
          aarInfo = mapInfoResource(aarInfo, resourceMap)

          // find icon path and parse icon
          const iconPath = findAarIconPath(aarInfo)
          if (iconPath) {
            this.getEntry(iconPath).then(iconBuffer => {
              aarInfo.icon = iconBuffer ? getBase64FromBuffer(iconBuffer) : null
              resolve(aarInfo)
            }).catch(e => {
              aarInfo.icon = null
              resolve(aarInfo)
              console.warn('[Warning] failed to parse icon: ', e)
            })
          } else {
            aarInfo.icon = null
            resolve(aarInfo)
          }
        }
      }).catch(e => {
        reject(e)
      })
    })
  }
  /**
   * Parse manifest
   * @param {Buffer} buffer // manifest file's buffer
   */
  _parseManifest (buffer) {
    try {
      const parser = new ManifestXmlParser(buffer, {
        ignore: [
          'application.activity',
          'application.service',
          'application.receiver',
          'application.provider',
          'permission-group'
        ]
      })
      return parser.parse()
    } catch (e) {
      console.error(e)
      throw new Error('Parse AndroidManifest.xml error: ', e)
    }
  }
  /**
   * Parse resourceMap
   * @param {Buffer} buffer // resourceMap file's buffer
   */
  _parseResourceMap (buffer) {
    try {
      return new ResourceFinder().processResourceTable(buffer)
    } catch (e) {
      throw new Error('Parser resources.arsc error: ' + e)
    }
  }
}

module.exports = AarParser
