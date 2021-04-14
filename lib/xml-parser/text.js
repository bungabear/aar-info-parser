const FastXmlParser = require('fast-xml-parser')
const he = require('he')

class Utf8XmlParser {
  constructor (buffer, options = {}) {
    this.buffer = buffer
    this.xml = buffer.toString()
    this.document = null
    this.debug = options.debug || false
  }

  parse () {
    // https://www.npmjs.com/package/fast-xml-parser
    var options = {
      attributeNamePrefix: '',
      attrNodeName: 'attr', // default is 'false'
      textNodeName: '#text',
      ignoreAttributes: false,
      ignoreNameSpace: false,
      allowBooleanAttributes: true,
      parseNodeValue: true,
      parseAttributeValue: true,
      trimValues: true,
      // cdataTagName: "__cdata", //default is 'false'
      // cdataPositionChar: "\\c",
      parseTrueNumberOnly: false,
      arrayMode: true, // "strict"
      attrValueProcessor: (val, attrName) => he.decode(val, { isAttributeValue: true }), // default is a=>a
      tagValueProcessor: (val, tagName) => he.decode(val), // default is a=>a
      stopNodes: ['parse-me-as-string']
    }

    this.debug && console.group('Utf8XmlParser.parse')
    var tObj = FastXmlParser.getTraversalObj(this.xml, options)
    this.document = FastXmlParser.convertToJson(tObj, options)
    console.log(this.document)
    this.debug && console.groupEnd()

    return this.document
  }
}

module.exports = Utf8XmlParser
