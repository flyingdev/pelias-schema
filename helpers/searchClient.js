// helpers/searchClient.js
const config = require('pelias-config').generate();
const { Client: OpenSearchClient } = require('@opensearch-project/opensearch');
const { Client: ElasticClient } = require('elasticsearch');

/**
 * Create a search client for either OpenSearch or Elasticsearch.
 * 
 * OpenSearch selection rules:
 *  - If PELIAS_OPENSEARCH=true, prefer OPENSEARCH_NODE env
 *  - Else fall back to pelias.json esclient.hosts[0]
 */
function createSearchClient() {
  if (process.env.PELIAS_OPENSEARCH === 'true') {
    // Build node URL
    let node = process.env.OPENSEARCH_NODE;
    if (!node && config.esclient?.hosts?.[0]) {
      const { protocol, host, port } = config.esclient.hosts[0];
      node = `${protocol}://${host}:${port}`;
    }

    if (!node) {
      throw new Error(
        '[searchClient] No OpenSearch node found. Set OPENSEARCH_NODE or configure esclient.hosts in pelias.json.'
      );
    }

    console.log(`[searchClient] Using OpenSearch node: ${node}`);
    return new OpenSearchClient({ node });
  }

  // Default: Elasticsearch client
  console.log('[searchClient] Using Elasticsearch config from pelias.json');
  return new ElasticClient(config.esclient || {});
}

module.exports = { createSearchClient };
