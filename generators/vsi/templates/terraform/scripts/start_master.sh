#! /usr/bin/env bash

{{#has deployment.language 'NODE'}}
pkill node
npm start
{{/has}}
{{#has deployment.language 'PYTHON'}}
pkill python3
tar -zxvf {{deployment.name}}.tgz
pip3 install -r requirements.txt
export FLASK_APP=server/__init__.py
python manage.py start 0.0.0.0:3000
{{/has}}
{{#has deployment.language 'DJANGO'}}
gunicorn -b 0.0.0.0:3000 --env DJANGO_SETTINGS_MODULE={{deployment.name}}.settings.production {{deployment.name}}.wsgi --timeout 120
{{/has}}
{{#has deployment.language 'SWIFT'}}
pkill swift
cd .build/release
./{{deployment.name}}
cd -
{{/has}}
{{#has deployment.language 'SPRING'}}
pkill java
java -Dserver.port=3000 -jar {{deployment.name}}-1.0-SNAPSHOT.jar
{{/has}}
{{#has deployment.language 'JAVA'}}
pkill java
unzip {{deployment.name}}.zip
wlp/bin/server start
{{/has}}
{{#has deployment.language 'GO'}}
cd /usr/src/{{deployment.name}}
PORT_NUMBER=8080
lsof -i tcp:${PORT_NUMBER} | awk 'NR!=1 {print $2}' | xargs kill
./go_executable
{{/has}}
