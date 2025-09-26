const _ = require('lodash');
const child_process = require('child_process');
const config = require('pelias-config').generate();
const cli = require('./cli');
const schema = require('../schema');
const { createSearchClient } = require('../helpers/searchClient');

const client = createSearchClient();

const SUPPORTED_ES_VERSIONS = '>=7.4.2';
const SUPPORTED_OS_VERSIONS = '>=1.0.0';   // OpenSearch forked at ES 7.10.2, so treat >=1.0.0 as valid

cli.header("create index");

(async function run() {
  // check minimum elasticsearch versions before continuing
  if (process.env.PELIAS_OPENSEARCH === 'true') {
    try {
      child_process.execSync(`node ${__dirname}/check_version.js "${SUPPORTED_OS_VERSIONS}"`);
    } catch (e) {
      console.error(`unsupported elasticsearch version. try: ${SUPPORTED_OS_VERSIONS}\n`);
      process.exit(1);
    }
  } else {
    try {
      child_process.execSync(`node ${__dirname}/check_version.js "${SUPPORTED_ES_VERSIONS}"`);
    } catch (e) {
      console.error(`unsupported elasticsearch version. try: ${SUPPORTED_ES_VERSIONS}\n`);
      process.exit(1);
    }
  }

  // check mandatory plugins are installed before continuing
  try {
    child_process.execSync(`node ${__dirname}/check_plugins.js`);
  } catch (e) {
    console.error("please install mandatory plugins before continuing.\n");
    process.exit(1);
  }

  const indexName = config.schema.indexName;
  const req = {
    index: indexName,
    body: schema,
  };

  try {
    await client.indices.create(req);
    console.log(`Index '${indexName}' created successfully.`);
    process.exit(0);
  } catch (err) {
    console.error(`Error creating index '${indexName}':`, err);
    process.exit(1);
  }
})();
