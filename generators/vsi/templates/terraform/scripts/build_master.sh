#! /usr/bin/env bash

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
swift build -c release
{{/has}}
{{#has deployment.language 'SPRING'}}
mvn clean install
{{/has}}
{{#has deployment.language 'JAVA'}}
mvn clean install
target/liberty/wlp/bin/server package defaultServer --archive="{{deployment.name}}" --include=minify
{{/has}}
{{#has deployment.language 'GO'}}
# get project name from manifest.yml
export project_name="$(cat manifest.yml | grep -w "GOPACKAGENAME :" | sed 's/    GOPACKAGENAME : //')"
# get the original folder name from the pwd command 
original_folder_name="$(echo $(pwd) | sed 's/\/home\/pipeline\///')"
# go into the directory above the folder w/ all the go files 
cd /home/pipeline
# zip the entire project  
tar -czvf zippedProject.tar.gz $original_folder_name
# create a project folder w/ the actual project name in GOPATH
mkdir /go/src/$project_name
# move the files there 
mv -v zippedProject.tar.gz /go/src
# go to that directory in GOPATH
cd /go/src/
# rename the folder to the project name 
tar -xzvf zippedProject.tar.gz
mv $original_folder_name $project_name
# go into that folder and move everything up one directory 
cd $project_name
mv  -v $original_folder_name/* /go/src/$project_name/ 
# get/run dep 
go get -u github.com/golang/dep/cmd/dep
dep init 
dep ensure
# create and check if binary is created
go install
cd /go/bin/
# move the binary back to the project folder
mv $project_name /home/pipeline/$original_folder_name
# cd into the original folder 
cd /home/pipeline/$original_folder_name
# rename the executable
mv $project_name go_executable
{{/has}}
