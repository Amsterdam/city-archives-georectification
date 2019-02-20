const fs = require('fs')
const H = require('highland')
const R = require('ramda')

const argv = require('minimist')(process.argv.slice(2), {
  alias: {
    o: 'output',
    t: 'type'
  },
  default: {
    type: 'ndjson'
  }
})

if (process.stdin.isTTY && !argv._[0]) {
  console.error('Please specify location of source file')
  process.exit(1)
}

const geojson = {
  open: '{"type": "FeatureCollection","features":[',
  close: ']}'
}

function toFeature (map) {
  return {
    type: 'Feature',
    properties: {
      ...map,
      gcps: map.gcps.map(R.prop(['image']))
    },
    geometry: {
      type: 'MultiPoint',
      coordinates: map.gcps.map(R.prop(['world']))
    }
  }
}

let output = H()
const outputStream = argv.o ? fs.createWriteStream(argv.o, 'utf8') : process.stdout

if (argv.type === 'ndjson') {
  output
    .map(JSON.stringify)
    .intersperse('\n')
    .pipe(outputStream)
} else if (argv.type === 'geojson') {
  const features = output
    .map(toFeature)
    .map(JSON.stringify)
    .intersperse(',\n')

  H([
    H([geojson.open]),
    features,
    H([geojson.close])
  ]).compact()
    .sequence()
    .pipe(outputStream)
} else {
  console.error('-t/--type argument must be either \'ndjson\' or \'geojson\'')
}

module.exports = {
  input: ((argv._.length ? fs.createReadStream(argv._[0], 'utf8') : process.stdin)),
  output: output
}
