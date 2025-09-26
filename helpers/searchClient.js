// helpers/searchClient.js
const config = require('pelias-config').generate();
const { Client: OpenSearchClient } = require('@opensearch-project/opensearch');
const { Client: ElasticClient } = require('elasticsearch');

function createSearchClient() {
  // Decide backend: OpenSearch vs Elasticsearch
  if (process.env.PELIAS_OPENSEARCH === 'true') {
    const node = process.env.OPENSEARCH_NODE ||
      `${config.esclient.hosts[0].protocol}://${config.esclient.hosts[0].host}:${config.esclient.hosts[0].port}`;

    console.log(`[searchClient] Using OpenSearch node: ${node}`);
    return new OpenSearchClient({ node });
  } else {
    console.log(`[searchClient] Using Elasticsearch config from pelias.json`);
    return new ElasticClient(config.esclient);
  }
}

module.exports = {
  createSearchClient
};
