#!/usr/bin/env bash

echo "Running pre-release checks and scans"
echo "Determining current version"
CURRENT_PKG_VER_MAJOR=`node -e "console.log(require('./package.json').version.split('.')[0]);"`
CURRENT_PKG_VER_MINOR=`node -e "console.log(require('./package.json').version.split('.')[1]);"`
CURRENT_PKG_VER_FIX=`node -e "console.log(require('./package.json').version.split('.')[2]);"`

git config user.email "travisci@travis.ibm.com"
git config user.name "Travis CI"
git config push.default simple

npm run version

echo "Determining next version"
PKG_VER_NEXT=$(node -e "console.log(require('./package.json').version);")
NEXT_PKG_VER_MAJOR=$(node -e "console.log(require('./package.json').version.split('.')[0]);")
NEXT_PKG_VER_MINOR=$(node -e "console.log(require('./package.json').version.split('.')[1]);")
NEXT_PKG_VER_FIX=$(node -e "console.log(require('./package.json').version.split('.')[2]);")

echo "Creating git branch"
BRANCH="updateTo${PKG_VER_NEXT}"
git checkout -b $BRANCH

if [[ $CURRENT_PKG_VER_MAJOR !=  $NEXT_PKG_VER_MAJOR ]]; then
    echo "Major version change detected, running OSS scan"
    npm run changelog
    if [ $? != 0 ]; then
        echo "WARNING : scan failed, see logs for more details"
    fi


MSG="[Travis - npm version update] Increment version to ${PKG_VERS_NEXT}"

git status
git commit -m "${MSG}"
#this branch will need to be reviewed and approved in the usual manner
git push --follow-tags origin $BRANCH