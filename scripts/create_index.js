const child_process = require('child_process');
const config = require('pelias-config').generate();
const { Client } = require('@opensearch-project/opensearch');
const cli = require('./cli');
const schema = require('../schema');

const SUPPORTED_ES_VERSIONS = '>=7.4.2';

cli.header("create index");

console.log("config esclient", config.esclient);

const client = new Client({
  node: 'http://opensearch:9200'
});

// check minimum elasticsearch versions before continuing
try {
  child_process.execSync(`node ${__dirname}/check_version.js "${SUPPORTED_ES_VERSIONS}"`);
} catch (e) {
  console.error(`unsupported elasticsearch version. try: ${SUPPORTED_ES_VERSIONS}\n`);
  process.exit(1);
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

// 👇 wrap async work in an IIFE
(async function run() {
  try {
    await client.indices.create(req);
    console.log(`Index '${indexName}' created successfully.`);
    process.exit(0);
  } catch (err) {
    console.error(`Error creating index '${indexName}':`, err);
    process.exit(1);
  }
})();
