#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceDir = process.argv[2] || path.join(root, "data/countries/bd/raw/boundaries");
const outputDir = path.join(root, "data/geojson/bd");
const hierarchy = JSON.parse(fs.readFileSync(path.join(root, "data/countries/bd/administrative.json"), "utf8"));

const readJson = (name) => JSON.parse(fs.readFileSync(path.join(sourceDir, name), "utf8"));
const writeJson = (name, value) => fs.writeFileSync(path.join(outputDir, name), `${JSON.stringify(value)}\n`);

const byPcode = (records, field = "pcode") => new Map(records.filter((record) => record[field]).map((record) => [record[field], record]));
const districts = hierarchy.divisions.flatMap((division) => division.districts);
const upazilas = districts.flatMap((district) => district.upazilas);
const divisionsByPcode = byPcode(hierarchy.divisions);
const districtsByPcode = byPcode(districts);
const upazilasByPcode = byPcode(upazilas);

const common = (record, source, adminLevel, parentPcode) => ({
  id: record?.id ? `bd-${adminLevel}-${record.id}` : `bd-${adminLevel}-${source.pcode}`,
  name: record?.name || source[`${adminLevel}_name`],
  bn_name: record?.bn_name || null,
  country_code: "BD",
  admin_level: adminLevel,
  pcode: source[`${adminLevel}_pcode`],
  parent_pcode: parentPcode || null,
  area_sqkm: source.area_sqkm ?? null,
  center_lat: source.center_lat ?? null,
  center_lon: source.center_lon ?? null,
  source: "HDX COD-AB Bangladesh",
  source_version: source.version ?? null,
});

function importCodLayer(inputName, outputName, adminLevel, pcodeField, nameField, parentField, recordsByPcode) {
  const source = readJson(inputName);
  const features = source.features.map((feature) => {
    const properties = feature.properties;
    const pcode = properties[pcodeField];
    const record = recordsByPcode.get(pcode);
    return {
      type: "Feature",
      properties: {
        ...common(record, { ...properties, pcode, [`${adminLevel}_name`]: properties[nameField], [`${adminLevel}_pcode`]: pcode }, adminLevel, properties[parentField]),
        source_name: properties[nameField],
      },
      geometry: feature.geometry,
    };
  });
  writeJson(outputName, { type: "FeatureCollection", features });
  console.log(`${outputName}: ${features.length} features`);
}

importCodLayer("bgd_admin1.geojson", "divisions.geojson", "admin1", "adm1_pcode", "adm1_name", "adm0_pcode", divisionsByPcode);
importCodLayer("bgd_admin2.geojson", "districts.geojson", "admin2", "adm2_pcode", "adm2_name", "adm1_pcode", districtsByPcode);
importCodLayer("bgd_admin3.geojson", "upazilas.geojson", "admin3", "adm3_pcode", "adm3_name", "adm2_pcode", upazilasByPcode);

const adm4 = readJson("geoBoundaries-BGD-ADM4_simplified.geojson");
writeJson("unions.geojson", {
  type: "FeatureCollection",
  features: adm4.features.map((feature) => ({
    type: "Feature",
    properties: {
      id: `bd-admin4-${feature.properties.shapeID}`,
      name: feature.properties.shapeName,
      country_code: "BD",
      admin_level: "admin4",
      source_id: feature.properties.shapeID,
      source: "geoBoundaries ADM4 Bangladesh",
      source_type: "union_or_pourashava",
    },
    geometry: feature.geometry,
  })),
});
console.log(`unions.geojson: ${adm4.features.length} features`);
