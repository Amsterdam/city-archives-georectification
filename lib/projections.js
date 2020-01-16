const proj4 = require('proj4')

const EPSG_28992 = `+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079
  +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725
  +units=m +no_defs`
const project = proj4(EPSG_28992, 'WGS84')

// const sheetDimensions = [950, 750] // in meters

// const after1940 = ([x, y]) => ([
//   x + 155000,
//   y + 463000
// ])

// const before1940 = ([x, y]) => {
//   // Omrekening PW-coordinaten vóór 1940 (rotatie: 2 graden, nulpunt: Prinsenhof):
//   x += 33552
//   y -= 24000

//   const degrees = -2
//   const radians = (degrees / 180) * Math.PI

//   return [
//     x * Math.cos(radians) - y * Math.sin(radians) + 121528,
//     x * Math.sin(radians) + y * Math.cos(radians) + 487081
//   ]
// }

// function cornerToRdBbox (corner) {
//   const corner2 = [
//     corner[0] + sheetDimensions[0],
//     corner[1] + sheetDimensions[1]
//   ]

//   const bbox = [
//     corner,
//     [corner2[0], corner[1]],
//     corner2,
//     [corner[0], corner2[1]],
//     corner
//   ]

//   return argv.method === 'new' ? bbox.map(after1940) : bbox.map(before1940)
// }

module.exports = {
  rdToLatLon: project.forward
}
