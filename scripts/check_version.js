const _ = require('lodash');
const semver = require('semver');
const { createSearchClient } = require('../helpers/searchClient');
const client = createSearchClient();
const config = require('pelias-config').generate();
const cli = require('./cli');

if (!config.esclient.hosts || config.esclient.hosts.length < 1 || !config.esclient.hosts[0].host) {
  console.error(`Insufficient config`);
  process.exit(1);
}

const clientType = (process.env.PELIAS_OPENSEARCH === 'true') ? 'opensearch' : 'elasticsearch';

// pass target elastic version semver as the first CLI arg
const targetVersion = process.argv[2];
if (!targetVersion) {
  console.error(`you must pass a target ${clientType} version semver as the first argument`);
  process.exit(1);
}

(async function run() {
  cli.header(`checking ${clientType} server version matches "${targetVersion}"`);

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
