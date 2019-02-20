#!/usr/bin/env node

const H = require('highland')
const R = require('ramda')
const csv = require('csv-parser')

const io = require('./lib/io')

const LAT_LNG_DECIMALS = 6

const csvOptions = {
  separator: ';'
}

function roundDecimals (num, decimals) {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

function parseGCP (gcps) {
  const gcp = JSON.parse(gcps.replace(new RegExp('\\\\', 'g'), ''))

  return {
    world: [
      roundDecimals(parseFloat(gcp.geoLng), LAT_LNG_DECIMALS),
      roundDecimals(parseFloat(gcp.geoLat), LAT_LNG_DECIMALS)
    ],
    image: [
      Math.round(parseFloat(gcp.imageGeoLat)),
      Math.round(parseFloat(gcp.imageGeoLng))
    ]
  }
}

const rows = io.input.pipe(csv(csvOptions))

H(rows)
  .map((row) => ({
    veleHandenScanId: row.velehanden_scan_id,
    imageId: row.memorix_id,
    gcp: parseGCP(row.gcps)
  }))
  .group('veleHandenScanId')
  .map(R.toPairs)
  .sequence()
  .map((pair) => ({
    imageId: pair[1][0].imageId,
    veleHandenScanId: pair[1][0].veleHandenScanId,
    gcps: pair[1].map(R.prop('gcp'))
  }))
  .pipe(io.output)
