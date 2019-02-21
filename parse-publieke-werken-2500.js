#!/usr/bin/env node

const H = require('highland')
const csv = require('csv-parser')

const io = require('./lib/io')
const projections = require('./lib/projections')

const csvOptions = {
  separator: ';'
}

function makeGcp (row, prefix, height) {
  const xw = parseFloat(row[`${prefix}xw`])
  const yw = parseFloat(row[`${prefix}yw`])

  // GCPs from CSV are in the old RD projection
  // To convert to EPSG:28992, move the center of the projection to Amersfoort!
  return {
    world: projections.rdToLatLon([xw + 155000, yw + 463000]),
    image: [parseFloat(row[`${prefix}xi`]), height - parseFloat(row[`${prefix}yi`])]
  }
}

const rows = io.input.pipe(csv(csvOptions))

H(rows)
  .filter((row) => row.imgfn)
  .map((row) => ({
    id: parseInt(row.versienr),
    sheet: row.kaartnr,
    period: row.datering.split('-').map((year) => parseInt(year)),
    design: row.uitvoering,
    colors: row.kleuren.split(','),
    gcps: [
      makeGcp(row, 'ul', parseInt(row.hoogte)),
      makeGcp(row, 'ur', parseInt(row.hoogte)),
      makeGcp(row, 'lr', parseInt(row.hoogte)),
      makeGcp(row, 'll', parseInt(row.hoogte))
    ],
    imageId: row.imgfn,
    scanWidth: parseInt(row.breedte),
    scanHeight: parseInt(row.hoogte)
  }))
  .pipe(io.output)
