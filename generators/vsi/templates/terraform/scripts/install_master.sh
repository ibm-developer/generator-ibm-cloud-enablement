#! /usr/bin/env bash

apt-get update
apt-get install -f
{{#has deployment.language 'NODE'}}
wget -qO- "https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh" | bash -;
source ~/.profile
nvm install 8.16.0
{{/has}}
{{#has deployment.language 'PYTHON'}}
apt-get install -y python3-pip
{{/has}}
{{#has deployment.language 'DJANGO'}}
wget --no-check-certificate https://www.python.org/ftp/python/2.7.11/Python-2.7.11.tgz
tar -xzf Python-2.7.11.tgz
pip install -r requirements.txt
{{/has}}
{{#has deployment.language 'SWIFT'}}
apt-get install -y libatomic1 libpython2.7 libcurl4-openssl-dev
mkdir /opt/swift
cd /opt/swift
wget --no-check-certificate https://swift.org/builds/swift-5.0.1-release/ubuntu1404/swift-5.0.1-RELEASE/swift-5.0.1-RELEASE-ubuntu14.04.tar.gz
tar -xzf swift-5.0.1-RELEASE-ubuntu14.04.tar.gz
if ! grep -q "swift-5.0.1" ~/.profile; then echo "PATH=\"/opt/swift/swift-5.0.1-RELEASE-ubuntu14.04/usr/bin:$PATH\"" >> ~/.profile; fi;
chmod -R 755 /opt/swift/swift-5.0.1-RELEASE-ubuntu14.04/usr/lib/swift/
touch /etc/ld.so.conf.d/swift.conf
ls /opt/swift/swift-5.0.1-RELEASE-ubuntu14.04/usr/lib/swift/linux
if ! grep -q "/opt/swift/swift-5.0.1-RELEASE-ubuntu14.04/usr/lib/swift/linux" /etc/ld.so.conf.d/swift.conf; then echo "/opt/swift/swift-5.0.1-RELEASE-ubuntu14.04/usr/lib/swift/linux" >> /etc/ld.so.conf.d/swift.conf; fi;
ldconfig
cd -
{{/has}}
{{#has deployment.language 'SPRING'}}
echo "deb http://http.debian.net/debian jessie-backports main" >> /etc/apt/sources.list
apt-get update
apt-get install -y -t jessie-backports openjdk-8-jre
{{/has}}
{{#has deployment.language 'JAVA'}}
echo "deb http://http.debian.net/debian jessie-backports main" >> /etc/apt/sources.list
apt-get update
apt-get install -y -t jessie-backports openjdk-8-jre unzip
{{/has}}
