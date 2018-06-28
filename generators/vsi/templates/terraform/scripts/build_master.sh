{{#has deployment.language 'NODE'}}
npm install
{{/has}}
{{#has deployment.language 'PYTHON'}}
tar -zcvf {{deployment.name}}.tgz Pipfile requirements.txt manage.py setup.py public server
mv setup.py setup.py.OLD
{{/has}}
{{#has deployment.language 'DJANGO'}}
pip install -r requirements.txt
{{/has}}
{{#has deployment.language 'SWIFT'}}
swift build
{{/has}}
{{#has deployment.language 'SPRING'}}
mvn clean install
{{/has}}
{{#has deployment.language 'JAVA'}}
mvn clean install
sed -i 's/default.http.port=9080/default.http.port=3000/g' target/liberty/wlp/usr/servers/defaultServer/bootstrap.properties
target/liberty/wlp/bin/server package defaultServer --archive="{{deployment.name}}" --include=minify
{{/has}}
