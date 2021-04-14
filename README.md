## [aar-info-parser](https://github.com/bungabear/aar-info-parser) 

[aar-info-parser](https://github.com/bungabear/aar-info-parser) is a parser for parsing `.ipa` `.apk` or `.aar` files. It will return the information with json from `AndroidManifest.xml` or `Info.plist`.

## forked from [app-info-parser](https://github.com/chenquincy/aar-info-parser), check [origin readme](https://github.com/chenquincy/app-info-parser#readme)


<!-- ![](https://img.shields.io/npm/v/aar-info-parser.svg) ![](https://img.shields.io/npm/dt/aar-info-parser.svg) -->
 ![](https://img.shields.io/badge/language-javascript-yellow.svg)

### NPM Use For aar

``` javascript
const AppInfoParser = require('app-info-parser')
const parser = new AppInfoParser('../packages/test.aar') // or xxx.ipa
parser.parse().then(result => {
  console.log('app info ----> ', result)
  console.log('icon base64 ----> ', result.icon)
}).catch(err => {
  console.log('err ----> ', err)
})
```

### Basic Use

``` html
<input type="file" name="file" id="file" onchange="fileSelect()">
<script src="/dist/app-info-parser.js"></script>
<script>
function fileSelect () {
  const files = document.getElementById('file').files
  const parser = new AppInfoParser(files[0])
  parser.parse().then(result => {
    console.log('app info ----> ', result)
    console.log('icon base64 ----> ', result.icon)
  }).catch(err => {
    console.log('err ----> ', err)
  })
}
</script>
```

### Demand loading

> You can use demand loading, when you only need one parser.

#### AarParser

``` javascript
const AarParser = require('app-info-parser/src/aar')
const parser = new AarParser('../packages/test.aar')
parser.parse().then(result => {
  console.log('app info ----> ', result)
}).catch(err => {
  console.log('err ----> ', err)
})
```



##  License

MIT
