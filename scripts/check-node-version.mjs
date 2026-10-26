import { readFile } from 'node:fs/promises';

const packageJsonUrl = new URL('../package.json', import.meta.url);
const packageJson = JSON.parse(await readFile(packageJsonUrl, 'utf8'));
const nodeRequirement = packageJson.engines?.node;
const rangeMatch = /^(?:>=)(\d+)\.(\d+)\.(\d+) <(\d+)$/.exec(nodeRequirement ?? '');

if (!rangeMatch) {
  throw new Error(`Unsupported Node.js engine requirement: ${nodeRequirement ?? 'not configured'}`);
}

const minimumVersion = rangeMatch.slice(1, 4).map(Number);
const upperMajorVersion = Number(rangeMatch[4]);
const resolvedVersion = process.versions.node.split('.').map(Number);
const firstDifferentPart = minimumVersion.findIndex(
  (part, index) => part !== resolvedVersion[index],
);
const isAtLeastMinimum =
  firstDifferentPart === -1 ||
  resolvedVersion[firstDifferentPart] > minimumVersion[firstDifferentPart];
const satisfiesRequirement = isAtLeastMinimum && resolvedVersion[0] < upperMajorVersion;

console.log(`Resolved Node.js runtime: ${process.version}`);
console.log(`Required Node.js range: ${nodeRequirement}`);

if (!satisfiesRequirement) {
  throw new Error(
    `Resolved Node.js runtime ${process.version} does not satisfy ${nodeRequirement}.`,
  );
}
