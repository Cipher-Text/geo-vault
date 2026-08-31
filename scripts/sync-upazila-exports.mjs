import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const directory = path.join(root, "data/countries/bd/formats/upazilas");
const csvPath = path.join(directory, "upazilas.csv");
const jsonPath = path.join(directory, "upazilas.json");
const sqlPath = path.join(directory, "upazilas.sql");
const administrativePath = path.join(root, "data/countries/bd/administrative.json");

const parseCsvLine = (line) => {
  const values = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (quoted) {
      if (character === '"' && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (character === '"') quoted = false;
      else value += character;
    } else if (character === '"' && value.length === 0) quoted = true;
    else if (character === ",") {
      values.push(value);
      value = "";
    } else value += character;
  }
  values.push(value);
  if (values.length === 5) values.push("false");
  if (values.length === 6) values.splice(5, 0, "", "");
  if (values.length !== 8) throw new Error(`Expected 8 CSV fields, got ${values.length}: ${line}`);
  return values;
};

const rows = fs.readFileSync(csvPath, "utf8").trimEnd().split(/\r?\n/).map(parseCsvLine);
const records = rows.map(([id, districtId, name, bnName, url, lat, lon, isCity]) => ({
  id,
  district_id: districtId,
  name,
  bn_name: bnName,
  url,
  lat,
  lon,
  is_city: isCity,
}));

const json = [
  { type: "header", version: "4.8.5", comment: "Export to JSON plugin for PHPMyAdmin" },
  { type: "database", name: "bd_geo_code" },
  { type: "table", name: "upazilas", database: "bd_geo_code", data: records },
];
fs.writeFileSync(jsonPath, `${JSON.stringify(json, null, 2)}\n`);

const sqlEscape = (value) => value.replaceAll("\\", "\\\\").replaceAll("'", "''");
const sqlNumber = (value) => value === "" ? "NULL" : value;
const values = records.map((record) => `(${record.id}, ${record.district_id}, '${sqlEscape(record.name)}', '${sqlEscape(record.bn_name)}', '${sqlEscape(record.url)}', ${sqlNumber(record.lat)}, ${sqlNumber(record.lon)}, ${record.is_city === "true" ? 1 : 0})`).join(",\n");
const sql = `-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 24, 2019 at 09:45 AM
-- Server version: 5.7.26-0ubuntu0.18.04.1
-- PHP Version: 7.2.19-0ubuntu0.18.04.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: \`bd_geo_code\`
--

-- --------------------------------------------------------

--
-- Table structure for table \`upazilas\`
--

CREATE TABLE \`upazilas\` (
  \`id\` int(3) NOT NULL,
  \`district_id\` int(2) NOT NULL,
  \`name\` varchar(50) NOT NULL,
  \`bn_name\` varchar(100) NOT NULL,
  \`url\` varchar(100) NOT NULL,
  \`lat\` varchar(15) DEFAULT NULL,
  \`lon\` varchar(15) DEFAULT NULL,
  \`is_city\` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table \`upazilas\`
--

INSERT INTO \`upazilas\` (\`id\`, \`district_id\`, \`name\`, \`bn_name\`, \`url\`, \`lat\`, \`lon\`, \`is_city\`) VALUES
${values};

--
-- AUTO_INCREMENT for table \`upazilas\`
--
ALTER TABLE \`upazilas\`
  MODIFY \`id\` int(3) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=${Number(records.at(-1).id) + 1};

--
-- Constraints for dumped tables
--

--
-- Constraints for table \`upazilas\`
--
ALTER TABLE \`upazilas\`
  ADD CONSTRAINT \`upazilas_ibfk_2\` FOREIGN KEY (\`district_id\`) REFERENCES \`districts\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
`;
fs.writeFileSync(sqlPath, sql);

const administrative = JSON.parse(fs.readFileSync(administrativePath, "utf8"));
const ruralById = new Map(records.filter((record) => record.is_city !== "true").map((record) => [record.id, record]));
let administrativeUpdates = 0;
for (const division of administrative.divisions ?? []) {
  for (const district of division.districts ?? []) {
    for (const upazila of district.upazilas ?? []) {
      const source = ruralById.get(upazila.id);
      if (!source) continue;
      Object.assign(upazila, {
        district_id: source.district_id,
        name: source.name,
        bn_name: source.bn_name,
        url: source.url,
      });
      administrativeUpdates += 1;
    }
  }
}
fs.writeFileSync(administrativePath, `${JSON.stringify(administrative, null, 2)}\n`);

const cityCount = records.filter((record) => record.is_city === "true").length;
console.log(`Synced ${records.length} upazila records (${cityCount} city/thana records) to JSON, SQL, and ${administrativeUpdates} administrative records.`);
