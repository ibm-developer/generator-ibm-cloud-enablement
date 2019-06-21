#!/bin/bash
#set -o xtrace

################################################################
# Install dependencies
################################################################
echo 'Installing dependencies...'
sudo apt-get -qq update 1>/dev/null
sudo apt-get -qq install jq 1>/dev/null
sudo apt-get -qq install figlet 1>/dev/null


figlet 'wskdeploy'

wskdeployVersion="0.9.9"
tarfile="openwhisk_wskdeploy-$wskdeployVersion-linux-amd64.tgz"
wskdeployArchive="openwhisk_wskdeploy-$wskdeployVersion-linux-amd64.tgz"
wskdeployURL="https://github.com/apache/incubator-openwhisk-wskdeploy/releases/download/$wskdeployVersion/$tarfile"

mkdir -p wskdeploy-install
if curl -L $wskdeployURL -o wskdeploy-install/${tarfile}
then
    echo "Download complete. Preparing..."
else
    echo "Download failed. Quit installation."
    exit 1
fi

tar -xf wskdeploy-install/${tarfile} --directory wskdeploy-install
chmod +x wskdeploy-install/wskdeploy

################################################################
# Fetch auth credentials
################################################################

figlet 'IBM Cloud'

echo 'Retrieving Cloud Functions authorization key...'

ibmcloud fn api list

################################################################
# Deploy 
################################################################

figlet 'Deploy'

echo "Running wskdeploy..."
wskdeploy-install/wskdeploy -m "manifest.yml" --param "services.cloudant.url" "$DATABASE_URL" --param "services.cloudant.database" "$DATABASE"



