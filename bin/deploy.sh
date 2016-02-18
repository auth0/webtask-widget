#!/usr/bin/env bash

set -e

BIN="./node_modules/.bin"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
VERSION=$(node -e "console.log(require('$DIR/../package.json').version)")
PACKAGE=$(node -e "console.log(require('$DIR/../package.json').name)")
VERSIONS=$(node -e "var s = require('semver').parse(require('./package.json').version); if (!s.prerelease.length) { console.log([s.major].join('.')); console.log([s.major,s.minor].join('.')); } console.log(s.version);")
CDN_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" https://cdn.auth0.com/js/$PACKAGE-$VERSION.min.js | grep 200 || true)
PATH_PREFIX="js/$PACKAGE"

if [ ! -z "$CDN_EXISTS" ]; then
    echo "There is already a version $VERSION in the CDN. Skipping CDN publish."
else
    echo "Deploying $VERSION to cdn"
    for i in $VERSIONS; do
        aws s3 cp --region us-west-1 ./dist/webtask.js s3://assets.us.auth0.com/$PATH_PREFIX-$i.js;
        aws s3 cp --region us-west-1 ./dist/webtask.min.js s3://assets.us.auth0.com/$PATH_PREFIX-$i.min.js;
        curl -fs -XDELETE https://cdn.auth0.com/$PATH_PREFIX-$i.js;
        curl -fs -XDELETE https://cdn.auth0.com/$PATH_PREFIX-$i.min.js;
    done;
fi