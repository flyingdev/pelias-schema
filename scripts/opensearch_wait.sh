set -e

function opensearch_status(){
  curl \
    --output /dev/null \
    --silent \
    --write-out "%{http_code}" \
    "http://${OPENSEARCH_HOST:-localhost:9200}" || true;
}

function opensearch_wait(){
  echo 'waiting for opensearch service to come up';
  retry_count=30

  i=1
  while [[ "$i" -le "$retry_count" ]]; do
    if [[ $(opensearch_status) -eq 200 ]]; then
      echo
      exit 0
    fi
    sleep 2
    printf "."
    i=$(($i + 1))
  done

  echo
  echo "OpenSearch did not come up, check configuration"
  exit 1
}
