#!/bin/bash
set -e

# create opensearch directory
mkdir /tmp/opensearch

OPENSEARCH_VERSION="1.3.17"
FILENAME="opensearch-${OPENSEARCH_VERSION}-linux-x86_64.tar.gz"
STRIP_COMPONENTS=1

# download OpenSearch from OpenSearch.org
wget -O - "https://artifacts.opensearch.org/downloads/opensearch/${FILENAME}" \
  | tar xz --directory=/tmp/opensearch --strip-components="${STRIP_COMPONENTS}"

# install ICU plugin
/tmp/opensearch/bin/opensearch-plugin install analysis-icu

# start OpenSearch server
/tmp/opensearch/bin/opensearch --daemonize -Epath.data=/tmp/opensearch -Ediscovery.type=single-node

# wait for server to boot up
# logs show that on CI servers, it can take some time to boot up the server
source "${BASH_SOURCE%/*}/opensearch_wait.sh"
(opensearch_wait)

# set the correct dbclient.apiVersion in pelias.json
v=( ${OPENSEARCH_VERSION//./ } ) # split version number on '.'

# generate a pelias.json config
PELIAS_CONFIG=$(
  jq -n \
    --arg apiVersion "${v[0]}.${v[1]}" \
    '{
      dbclient: {
        apiVersion: $apiVersion
      }
    } | del(.. | select(. == ""))'
);

# write to filesystem
echo "${PELIAS_CONFIG}" > ~/pelias.json

# debugging
echo "--- pelias.json ---"
cat ~/pelias.json

echo "--- opensearch.yml ---"
cat /tmp/opensearch/config/opensearch.yml
