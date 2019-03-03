# City Archives Georectification

Scripts to parse georectified map data from the Amsterdam City Archives and produce GeoJSON files with GCP data and image IDs. Data comes from different sources:

## Vele Handen

_Vele Handen_ is the name of the proprietary crowdsourcing platform used by the Amsterdam City Archives to do a one-off georectification project in 2015. To convert the CSV with source data to GeoJSON, run:

    node parse-vele-handen.js -t geojson source-data/vele-handen.csv > vele-handen.geojson

__Note: make sure to install Node.js and the dependencies of the script first!__

## Dienst der Publieke Werken 1:2500

The 1:2500 Dienst der Publieke Werken maps are georectified by [Jan Hartmann](http://www.uva.nl/profiel/h/a/j.l.h.hartmann/j.l.h.hartmann.html). To convert the source CSV to GeoJSON, run:

    node parse-publieke-werken-2500.js -t geojson source-data/publieke-werken-2500-paspunten.csv > publieke-werken-2500.geojson

## Atlas Loman

The [19th century neighbourhood maps from publisher J.C. Loman](https://archief.amsterdam/inventarissen/inventaris/10043.nl.html?p=3:315&t=346) are georectified by [Jan Hartmann](http://www.uva.nl/profiel/h/a/j.l.h.hartmann/j.l.h.hartmann.html). To convert the source CSV to GeoJSON, run:

    node parse-atlas-loman.js -t geojson source-data/atlas-loman.csv > atlas-loman.geojson
