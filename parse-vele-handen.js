#!/usr/bin/env node

const fs = require('fs')
const H = require('highland')
const R = require('ramda')
const csv = require('csv-parser')

const LAT_LNG_DECIMALS = 6

const argv = require('minimist')(process.argv.slice(2), {
  alias: {
    o: 'output',
    t: 'type'
  },
  default: {
    type: 'ndjson'
  }
})

const geojson = {
  open: '{"type": "FeatureCollection","features":[',
  close: ']}'
}

const csvOptions = {
  separator: ';'
}

if (process.stdin.isTTY && !argv._[0]) {
  console.error('Please specify location of CSV export')
  process.exit(1)
}

const inputStream = ((argv._.length ? fs.createReadStream(argv._[0], 'utf8') : process.stdin))
const outputStream = argv.o ? fs.createWriteStream(argv.o, 'utf8') : process.stdout
const rowStream = inputStream.pipe(csv(csvOptions))

function parseGCP (gcps) {
  const gcp = JSON.parse(gcps.replace(new RegExp('\\\\', 'g'), ''))

  return {
    id: parseInt(gcp.id.replace('marker_', '')),
    geo: [
      roundDecimals(parseFloat(gcp.geoLat), LAT_LNG_DECIMALS),
      roundDecimals(parseFloat(gcp.geoLng), LAT_LNG_DECIMALS),
    ],
    image: [
      Math.round(parseFloat(gcp.imageGeoLat)),
      Math.round(parseFloat(gcp.imageGeoLng))
    ]
  }
}

function roundDecimals (num, decimals) {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

function toFeature (map) {
  return {
    type: 'Feature',
    properties: {
      ...map,
      gcps: map.gcps.map(R.omit(['geo']))
    },
    geometry: {
      type: 'MultiPoint',
      coordinates: map.gcps.map((gcp) => ([
        gcp.geo[1], gcp.geo[0]
      ]))
    }
  }
}

const maps = H(rowStream)
  .map((row) => ({
    ...row,
    gcps: parseGCP(row.gcps)
  }))
  .stopOnError((err) => {
    console.error(err)
  })
  .group('velehanden_scan_id')
  .map(R.toPairs)
  .sequence()
  .map((pair) => ({
    ...pair[1][0],
    gcps: pair[1].map(R.prop('gcps'))
  }))

if (argv.type === 'ndjson') {
  maps
    .map(JSON.stringify)
    .intersperse('\n')
    .pipe(outputStream)
} else if (argv.type === 'geojson') {
  const features = maps
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
