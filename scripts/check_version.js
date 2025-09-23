const _ = require('lodash');
const semver = require('semver');
const { Client } = require('@opensearch-project/opensearch');
const config = require('pelias-config').generate();
const cli = require('./cli');

const client = new Client({
  node: 'http://opensearch:9200'
});

// pass target elastic version semver as the first CLI arg
const targetVersion = process.argv[2];
if (!targetVersion) {
  console.error('you must pass a target elasticsearch version semver as the first argument');
  process.exit(1);
}

(async function run() {
  cli.header(`checking elasticsearch server version matches "${targetVersion}"`);

  try {
    // OpenSearch client uses promises, so we can await
    const res = await client.info();

    // OpenSearch response puts version under `body.version.number`
    const version = _.get(res, 'body.version.number', '0.0.0');

    if (!semver.satisfies(version, targetVersion)) {
      console.log(`${cli.status.failure} ${version}\n`);
      process.exit(1);
    }

    console.log(`${cli.status.success} ${version}\n`);
    process.exit(0);

  } catch (err) {
    console.error('Error checking OpenSearch version:', err);
    process.exit(1);
  }
})();
