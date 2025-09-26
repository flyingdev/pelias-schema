const { createSearchClient } = require('../helpers/searchClient');
const client = createSearchClient();
client.info( {}, console.log.bind(console) );
