#!/bin/bash
set -x

echo "Running pre-release checks and scans"
CURRENT_PKG_VER=`node -e "console.log(require('./package.json').version);"`
echo "Determining current version: ${CURRENT_PKG_VER}"
LINE="bumping version in package.json from ${CURRENT_PKG_VER} to"
PKG_VER_NEXT=$(standard-version --dry-run | grep 'package.json from' | awk -v FS="${LINE}" -v OFS="" '{$1 = ""; print}')
PKG_VER_NEXT="$(echo -e "${PKG_VER_NEXT}" | tr -d '[:space:]')"

echo "Determining next version: ${PKG_VER_NEXT}"

git config user.email "travisci@travis.com"
git config user.name "Travis CI"
git config push.default simple

echo "Creating git branch"
BRANCH="updateTo${PKG_VER_NEXT}"
git checkout -b $BRANCH

npm run version
git remote rm origin
git remote add origin $GITHUB_URL_SECURED
git push --follow-tags --set-upstream origin $BRANCH
hub pull-request -b development -m "chore: Merging CHANGELOG and package.json changes"
