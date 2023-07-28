#!/usr/bin/env sh
curl https://localhost:7264/swagger/v1/swagger.json -o swagger.json
autorest --typescript --input-file=swagger.json --clear-output-folder --generate-metadata=false --source-code-folder-path=/ --output-folder=src/api --add-credentials=false
