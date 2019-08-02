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
apt-get install -y python3-pip
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
echo "Acquire::Check-Valid-Until \"false\";" > /etc/apt/apt.conf.d/100disablechecks
apt-get -o Acquire::Check-Valid-Until=false update
apt-get install -y -t openjdk-8-jre unzip
{{/has}}
{{#has deployment.language 'JAVA'}}
echo "Acquire::Check-Valid-Until \"false\";" > /etc/apt/apt.conf.d/100disablechecks
apt-get -o Acquire::Check-Valid-Until=false update
apt-get install -y -t openjdk-8-jre unzip
{{/has}}
