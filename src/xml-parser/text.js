"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var FastXmlParser = require('fast-xml-parser');

var he = require('he');

var Utf8XmlParser = /*#__PURE__*/function () {
  function Utf8XmlParser(buffer) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Utf8XmlParser);

    this.buffer = buffer;
    this.xml = buffer.toString();
    this.document = null;
    this.debug = options.debug || false;
  }

  _createClass(Utf8XmlParser, [{
    key: "parse",
    value: function parse() {
      // https://www.npmjs.com/package/fast-xml-parser
      var options = {
        attributeNamePrefix: '',
        attrNodeName: 'attr',
        // default is 'false'
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
        arrayMode: true,
        // "strict"
        attrValueProcessor: function attrValueProcessor(val, attrName) {
          return he.decode(val, {
            isAttributeValue: true
          });
        },
        // default is a=>a
        tagValueProcessor: function tagValueProcessor(val, tagName) {
          return he.decode(val);
        },
        // default is a=>a
        stopNodes: ['parse-me-as-string']
      };
      this.debug && console.group('Utf8XmlParser.parse');
      var tObj = FastXmlParser.getTraversalObj(this.xml, options);
      this.document = FastXmlParser.convertToJson(tObj, options);
      console.log(this.document);
      this.debug && console.groupEnd();
      return this.document;
    }
  }]);

  return Utf8XmlParser;
}();

module.exports = Utf8XmlParser;