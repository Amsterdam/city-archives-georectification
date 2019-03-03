#!/usr/bin/env node

const H = require('highland')
const csv = require('csv-parser')

const io = require('./lib/io')
const projections = require('./lib/projections')

const csvOptions = {
  separator: ','
}

function makeGcp (row, prefix, height) {
  const xw = parseFloat(row[`${prefix}xw`])
  const yw = parseFloat(row[`${prefix}yw`])

  return {
    world: projections.rdToLatLon([xw, yw]),
    image: [parseFloat(row[`${prefix}xi`]), height - parseFloat(row[`${prefix}yi`])]
  }
}

const rows = io.input.pipe(csv(csvOptions))

H(rows)
  .filter((row) => row.ulxw)
  .map((row) => ({
    imageId: row.id,
    neighbourhood: row.buurt,
    series: parseInt(row.volgnr),
    period: row.jaar.split('-').map((jaar) => parseInt(jaar)),
    details: row.omschr,
    number: parseInt(row.nr),
    description: row.beschrijving,
    scanWidth: parseInt(row.breedte),
    scanHeight: parseInt(row.hoogte),
    gcps: [
      makeGcp(row, 'ul', parseInt(row.hoogte)),
      makeGcp(row, 'ur', parseInt(row.hoogte)),
      makeGcp(row, 'lr', parseInt(row.hoogte)),
      makeGcp(row, 'll', parseInt(row.hoogte))
    ]
  }))
  .pipe(io.output)
