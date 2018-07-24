/*
 © Copyright IBM Corp. 2017, 2018
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/* eslint-env mocha */

'use strict';

const helpers = require('yeoman-test');
const assert = require('yeoman-assert');
const path = require('path');

const scaffolderSample = require('./samples/scaffolder-sample');
const scaffolderSampleNode = scaffolderSample.getJson('NODE');


function testOutput() {

	it('has vsi config for debian/changelog', function () {
		let changelogFile = 'debian/changelog';
		assert.file(changelogFile);
	});

	it('has vsi config for debian/compat', function () {
		let compatFile = 'debian/compat';
		assert.file(compatFile);
	});

	it('has vsi config for debian/control', function () {
		let controlFile = 'debian/control';
		assert.file(controlFile);
	});

	it('has vsi config for debian/install', function () {
		let installFile = 'debian/install';
		assert.file(installFile);
	});

	it('has vsi config for debian/rules', function () {
		let rulesFile = 'debian/rules';
		assert.file(rulesFile);
	});

	it('has vsi config for terraform/scripts/build.sh', function () {
		let buildScript = 'terraform/scripts/build.sh';
		assert.file(buildScript);
	});

	it('has vsi config for terraform/scripts/install.sh', function () {
		let installScript = 'terraform/scripts/install.sh';
		assert.file(installScript);
	});

	it('has vsi config for terraform/scripts/fetch-state.sh', function () {
		let fetchScript = 'terraform/scripts/fetch-state.sh';
		assert.file(fetchScript);
	});

	it('has vsi config for terraform/scripts/publish-state.sh', function () {
		let publishScript = 'terraform/scripts/publish-state.sh';
		assert.file(publishScript);
	});

	it('has vsi config for terraform/scripts/start.sh', function () {
		let startScript = 'terraform/scripts/start.sh';
		assert.file(startScript);
	});

	it('has vsi config for terraform/scripts/validate.sh', function () {
		let validateScript = 'terraform/scripts/validate.sh';
		assert.file(validateScript);
	});

	it('has vsi config for terraform/main.tf', function () {
		let mainTerraformFile = 'terraform/main.tf';
		assert.file(mainTerraformFile);
	});

	it('has vsi config for terraform/output.tf', function () {
		let outputTerraformFile = 'terraform/output.tf';
		assert.file(outputTerraformFile);
	});

	it('has vsi config for terraform/variables.tf', function () {
		let variablesTerraformFile = 'terraform/variables.tf';
		assert.file(variablesTerraformFile);
	});


}


// We rely on running helm lint to ensure the charts are valid.
// Here, we're commenting out the block processing that helm would
// perform so that we can evaluate content as tho it were normal yaml




describe('cloud-enablement:vsi', function () {
	this.timeout(5000);

	let languages = [ 'NODE'];
	languages.forEach(language => {
		describe('vsi-' + language + ' project', function () {
			let bluemix = JSON.stringify(scaffolderSampleNode);
			beforeEach(function () {
				return helpers.run(path.join(__dirname, '../generators/vsi'))
					.inDir(path.join(__dirname, './vsi-tmp'))
					.withOptions({bluemix: bluemix});
			});

			testOutput();

		});
	});

	describe('VSI project with correct file content for Node', function () {

		beforeEach(function () {
			let bluemix= {};
			bluemix.name = "appname";
			bluemix.cloudDeploymentType = "VSI";
			bluemix.backendPlatform = 'NODE';
			bluemix.createType = 'webbasic';

			return helpers.run(path.join(__dirname, '../generators/vsi/index.js'))
				.inDir(path.join(__dirname, './vsi-tmp'))
				.withOptions({bluemix: JSON.stringify(bluemix)})

		});

		it('should have correct file content', function () {
			assert.fileContent('debian/install', 'node_modules');
			assert.fileContent('terraform/scripts/start.sh', 'npm start');
			assert.fileContent('terraform/scripts/build.sh', 'npm install');
			assert.fileContent('terraform/scripts/install.sh', 'apt-get install -y nodejs');
			assert.fileContent('debian/control', 'appname');
		});
	});

	describe('MERN project with correct file content for Node', function () {

		beforeEach(function () {
			let bluemix= {};
			bluemix.name = "appname";
			bluemix.cloudDeploymentType = "VSI";
			bluemix.backendPlatform = 'NODE';
			bluemix.createType = 'mern';

			return helpers.run(path.join(__dirname, '../generators/vsi/index.js'))
				.inDir(path.join(__dirname, './vsi-tmp'))
				.withOptions({bluemix: JSON.stringify(bluemix)})

		});

		it('should have correct file content', function () {
			assert.fileContent('debian/install', 'node_modules');
			assert.fileContent('terraform/scripts/start.sh', 'npm start');
			assert.fileContent('terraform/scripts/build.sh', 'npm install');
			assert.fileContent('terraform/scripts/install.sh', 'apt-get install -y nodejs');
			assert.fileContent('debian/control', 'appname');

			assert.fileContent('debian/install', 'Procfile-dev');
			assert.fileContent('debian/install', 'webpack.common.js');
			assert.fileContent('debian/install', 'webpack.dev-proxy.js');
			assert.fileContent('debian/install', 'webpack.dev-standalone.js');
			assert.fileContent('debian/install', 'webpack.prod.js');
			assert.fileContent('debian/install', 'client');
		});
	});

	describe('MEAN project with correct file content for Node', function () {

		beforeEach(function () {
			let bluemix= {};
			bluemix.name = "appname";
			bluemix.cloudDeploymentType = "VSI";
			bluemix.backendPlatform = 'NODE';
			bluemix.createType = 'mean';

			return helpers.run(path.join(__dirname, '../generators/vsi/index.js'))
				.inDir(path.join(__dirname, './vsi-tmp'))
				.withOptions({bluemix: JSON.stringify(bluemix)})

		});

		it('should have correct file content', function () {
			assert.fileContent('debian/install', 'node_modules');
			assert.fileContent('terraform/scripts/start.sh', 'npm start');
			assert.fileContent('terraform/scripts/build.sh', 'npm install');
			assert.fileContent('terraform/scripts/install.sh', 'apt-get install -y nodejs');
			assert.fileContent('debian/control', 'appname');

			assert.fileContent('debian/install', 'webpack.common.js');
			assert.fileContent('debian/install', 'webpack.dev-proxy.js');
			assert.fileContent('debian/install', 'webpack.dev-standalone.js');
			assert.fileContent('debian/install', 'webpack.prod.js');
			assert.fileContent('debian/install', 'client');
		});
	});

	describe('Django project with correct file content for Python', function () {

		beforeEach(function () {
			let bluemix= {};
			bluemix.name = "appname";
			bluemix.cloudDeploymentType = "VSI";
			bluemix.backendPlatform = 'DJANGO';
			bluemix.createType = 'webbasic';

			return helpers.run(path.join(__dirname, '../generators/vsi/index.js'))
				.inDir(path.join(__dirname, './vsi-tmp'))
				.withOptions({bluemix: JSON.stringify(bluemix)})

		});
		it('should have correct file content', function () {
			assert.fileContent('debian/install', 'requirements.txt');
			assert.fileContent('terraform/scripts/start.sh', 'gunicorn -b 0.0.0.0:3000 --env DJANGO_SETTINGS_MODULE');
			assert.fileContent('terraform/scripts/build.sh', 'pip install -r requirements.txt');
			assert.fileContent('terraform/scripts/install.sh', 'wget --no-check-certificate https://www.python.org/ftp/python/2.7.11/Python-2.7.11.tgz');
			assert.fileContent('debian/control', 'appname');

			assert.fileContent('debian/install', 'appname');
			assert.fileContent('debian/install', 'staticfiles');
			assert.fileContent('debian/install', 'manage.py');
			assert.fileContent('debian/install', 'app');
			assert.fileContent('debian/install', 'Pipfile');
			assert.fileContent('debian/install', 'run-dev');
		});
	});

	describe('Flask project with correct file content for Python', function () {

		beforeEach(function () {
			let bluemix= {};
			bluemix.name = "appname";
			bluemix.cloudDeploymentType = "VSI";
			bluemix.backendPlatform = 'PYTHON';
			bluemix.createType = 'webbasic';

			return helpers.run(path.join(__dirname, '../generators/vsi/index.js'))
				.inDir(path.join(__dirname, './vsi-tmp'))
				.withOptions({bluemix: JSON.stringify(bluemix)})

		});

		it('should have correct file content', function () {
			assert.fileContent('debian/install', 'appname.tgz');
			assert.fileContent('terraform/scripts/start.sh', 'pip3 install -r requirements.txt');
			assert.fileContent('terraform/scripts/start.sh', 'export FLASK_APP=server/__init__.py');
			assert.fileContent('terraform/scripts/start.sh', 'python manage.py start 0.0.0.0:3000');
			assert.fileContent('terraform/scripts/build.sh', 'tar -zcvf appname.tgz Pipfile requirements.txt manage.py setup.py public server');
			assert.fileContent('terraform/scripts/build.sh', 'mv setup.py setup.py.OLD');
			assert.fileContent('terraform/scripts/install.sh', 'apt-get install -y python3-pip');
			assert.fileContent('debian/control', 'appname');
		});
	});

	describe('VSI project with correct file content for Swift', function () {

		beforeEach(function () {
			let bluemix= {};
			bluemix.name = "appname";
			bluemix.cloudDeploymentType = "VSI";
			bluemix.backendPlatform = 'SWIFT';
			bluemix.createType = 'webbasic';

			return helpers.run(path.join(__dirname, '../generators/vsi/index.js'))
				.inDir(path.join(__dirname, './vsi-tmp'))
				.withOptions({bluemix: JSON.stringify(bluemix)})

		});

		it('should have correct file content', function () {
			assert.fileContent('debian/install', '.build/');
			assert.fileContent('terraform/scripts/start.sh', './appname');
			assert.fileContent('terraform/scripts/build.sh', 'swift build');
			assert.fileContent('terraform/scripts/install.sh', 'apt-get install -y libatomic1 libpython2.7');
			assert.fileContent('terraform/scripts/install.sh', 'tar -xzf swift-4.1.2-RELEASE-ubuntu14.04.tar.gz');
			assert.fileContent('debian/control', 'appname');
		});
	});

	describe('Spring project with correct file content for Java', function () {

		beforeEach(function () {
			let bluemix= {};
			bluemix.name = "appname";
			bluemix.cloudDeploymentType = "VSI";
			bluemix.backendPlatform = 'SPRING';
			bluemix.createType = 'webbasic';

			return helpers.run(path.join(__dirname, '../generators/vsi/index.js'))
				.inDir(path.join(__dirname, './vsi-tmp'))
				.withOptions({bluemix: JSON.stringify(bluemix)})

		});

		it('should have correct file content', function () {
			assert.fileContent('debian/install', 'target/appname-1.0-SNAPSHOT.jar');
			assert.fileContent('terraform/scripts/start.sh', 'java -Dserver.port=3000 -jar appname-1.0-SNAPSHOT.jar');
			assert.fileContent('terraform/scripts/build.sh', 'mvn clean install');
			assert.fileContent('terraform/scripts/install.sh', 'apt-get install -y -t jessie-backports openjdk-8-jre');
			assert.fileContent('debian/control', 'appname');
		});
	});

	describe('Liberty project with correct file content for Java', function () {

		beforeEach(function () {
			let bluemix= {};
			bluemix.name = "appname";
			bluemix.cloudDeploymentType = "VSI";
			bluemix.backendPlatform = 'JAVA';
			bluemix.createType = 'webbasic';

			return helpers.run(path.join(__dirname, '../generators/vsi/index.js'))
				.inDir(path.join(__dirname, './vsi-tmp'))
				.withOptions({bluemix: JSON.stringify(bluemix)})

		});

		it('should have correct file content', function () {
			assert.fileContent('debian/install', 'target/liberty/wlp/usr/servers/defaultServer/appname.zip');
			assert.fileContent('terraform/scripts/start.sh', 'wlp/bin/server start');
			assert.fileContent('terraform/scripts/build.sh', 'mvn clean install');
			assert.fileContent('terraform/scripts/install.sh', 'apt-get install -y -t jessie-backports openjdk-8-jre');
			assert.fileContent('debian/control', 'appname');
		});
	});

	describe('VSI parameter passed in correctly', function () {

		beforeEach(function () {
			let bluemix= {};
			bluemix.name = "appname";
			bluemix.cloudDeploymentType = "VSI";
			bluemix.backendPlatform = 'NODE';
			bluemix.createType = 'webbasic';

			return helpers.run(path.join(__dirname, '../generators/vsi/index.js'))
				.inDir(path.join(__dirname, './vsi-tmp'))
				.withOptions({bluemix: JSON.stringify(bluemix)})

		});

		it('should have correct file content', function () {
			it('has vsi config for debian/changelog', function () {
				let changelogFile = 'debian/changelog';
				assert.file(changelogFile);
			});

			it('has vsi config for debian/compat', function () {
				let compatFile = 'debian/compat';
				assert.file(compatFile);
			});

			it('has vsi config for debian/control', function () {
				let controlFile = 'debian/control';
				assert.file(controlFile);
			});

			it('has vsi config for debian/install', function () {
				let installFile = 'debian/install';
				assert.file(installFile);
			});

			it('has vsi config for debian/rules', function () {
				let rulesFile = 'debian/rules';
				assert.file(rulesFile);
			});

			it('has vsi config for terraform/scripts/build.sh', function () {
				let buildScript = 'terraform/scripts/build.sh';
				assert.file(buildScript);
			});

			it('has vsi config for terraform/scripts/install.sh', function () {
				let installScript = 'terraform/scripts/install.sh';
				assert.file(installScript);
			});

			it('has vsi config for terraform/scripts/fetch-state.sh', function () {
				let fetchScript = 'terraform/scripts/fetch-state.sh';
				assert.file(fetchScript);
			});

			it('has vsi config for terraform/scripts/publish-state.sh', function () {
				let publishScript = 'terraform/scripts/publish-state.sh';
				assert.file(publishScript);
			});

			it('has vsi config for terraform/scripts/start.sh', function () {
				let startScript = 'terraform/scripts/start.sh';
				assert.file(startScript);
			});

			it('has vsi config for terraform/scripts/validate.sh', function () {
				let validateScript = 'terraform/scripts/validate.sh';
				assert.file(validateScript);
			});

			it('has vsi config for terraform/main.tf', function () {
				let mainTerraformFile = 'terraform/main.tf';
				assert.file(mainTerraformFile);
			});

			it('has vsi config for terraform/output.tf', function () {
				let outputTerraformFile = 'terraform/output.tf';
				assert.file(outputTerraformFile);
			});

			it('has vsi config for terraform/variables.tf', function () {
				let variablesTerraformFile = 'terraform/variables.tf';
				assert.file(variablesTerraformFile);
			});

			it('has customHealth endpoint for pipeline.yml', function () {
				let pipelineFile = '.bluemix/pipeline.yml';
				assert.file(pipelineFile);

				assert.fileContent(pipelineFile, 'http://${VSI_HOST}:${PORT}/health')
			});

		});
	});

	describe('healthEndpoint parameter passed in correctly', function () {

		beforeEach(function () {
			let bluemix= {};
			bluemix.name = "appname";
			bluemix.cloudDeploymentType = "VSI";
			bluemix.backendPlatform = 'NODE';
			bluemix.createType = 'webbasic';

			return helpers.run(path.join(__dirname, '../generators/vsi/index.js'))
				.inDir(path.join(__dirname, './vsi-tmp'))
				.withOptions({bluemix: JSON.stringify(bluemix), healthEndpoint: 'customHealth'})

		});

		it('should have correct file content', function () {
			it('has customHealth endpoint for pipeline.yml', function () {
				let pipelineFile = '.bluemix/pipeline.yml';
				assert.file(pipelineFile);

				assert.fileContent(pipelineFile, 'http://${VSI_HOST}:${PORT}/customHealth')
			});
		});
	});

});
