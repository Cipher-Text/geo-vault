# Google Maps union coordinates

- `missing-unions.csv` contains unions in the Bangladesh administrative hierarchy that currently have no latitude or longitude.
- `geocode-unions.mjs` sends those unions to the Google Maps Geocoding API.
- `verified-unions.csv` is written by the script and contains successfully geocoded results.

Install the client before running:

```sh
npm install @googlemaps/google-maps-services-js
GOOGLE_MAPS_API_KEY=YOUR_KEY node data/bd/google-map/geocode-unions.mjs
```

The script uses the address format `<union> Union, <upazila>, <zila>, Bangladesh`, waits 200 ms between requests, and does not modify the main administrative datasets automatically.
