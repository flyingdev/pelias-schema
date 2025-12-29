// helpers/searchClient.js
require('dotenv').config();
const peliasConfig = require('pelias-config').generate();
const { Client: OpenSearchClient } = require('@opensearch-project/opensearch');
const { Client: ElasticClient } = require('elasticsearch');

function getDatabaseConfig() {
  const config = peliasConfig.get('dbclient') || peliasConfig.get('esclient');
  
  if (!config) {
    throw new Error('Database configuration missing in pelias.json');
  }

  const engine = config.engine || (process.env.PELIAS_OPENSEARCH === 'true' ? 'opensearch' : 'elasticsearch');

  return { ...config, config, engine };
}

/**
 * Create a search client for either OpenSearch or Elasticsearch.
 */
function createSearchClient() {
  const { config, engine, hosts } = getDatabaseConfig();
  if (engine === 'opensearch') {
    if (!hosts || hosts.length == 0) {
      throw new Error(
        '[searchClient] No OpenSearch node found. Set OPENSEARCH_NODE or configure dbclient.hosts in pelias.json.'
      );
    }
    const hostConfig = hosts[0];
    const { protocol, host, port } = hostConfig;
    const node = `${protocol}://${host}:${port}`;

    console.log(`[searchClient] Using OpenSearch node: ${node}`);
    return new OpenSearchClient({ node });
  }

  // Default: Elasticsearch client
  console.log('[searchClient] Using Elasticsearch config from pelias.json');
  return new ElasticClient(config || {});
}

module.exports = { getDatabaseConfig, createSearchClient };
