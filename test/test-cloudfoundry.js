/*
 Copyright 2017 IBM Corp.
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
const yml = require('js-yaml');
const fs = require('fs');

const scaffolderSample = require('./samples/scaffolder-sample');
const scaffolderSampleNode = scaffolderSample.getJson('NODE');
const scaffolderSampleNodeNoServer = scaffolderSample.getJsonNoServer('NODE');
const scaffolderSampleSwift = scaffolderSample.getJson('SWIFT')
const scaffolderSampleJava = scaffolderSample.getJson('JAVA');
const scaffolderSampleSpring = scaffolderSample.getJson('SPRING');
const scaffolderSampleJavaNoServices = scaffolderSample.getJsonNoServices('JAVA');
const scaffolderSamplePython = scaffolderSample.getJson('PYTHON');

describe('cloud-enablement:cloudfoundry', () => {

	before(function(){
		this.timeout(5000);
	});

	describe('cloud-enablement:cloudfoundry with Python', () => {
		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSamplePython)});
		});

		it('manifest.yml has memory', () => {
			assert.file('manifest.yml');
			assert.fileContent('manifest.yml', 'memory: 1024M');
		});

		it('toolchain.yml repo type is clone', () => {
			assert.file('.bluemix/toolchain.yml');
			assert.fileContent('.bluemix/toolchain.yml', 'type: clone');
		});
	});

	describe('cloud-enablement:cloudfoundry with Swift', () => {
		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleSwift)});
		});

		it('manifest.yml has memory', () => {
			assert.file('manifest.yml');
			assert.fileContent('manifest.yml', 'memory: 1024M');
		});

		it('toolchain.yml repo type is clone', () => {
			assert.file('.bluemix/toolchain.yml');
			assert.fileContent('.bluemix/toolchain.yml', 'type: clone');
		});
	});

	describe('cloud-enablement:cloudfoundry with Node', () => {
		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleNode)});
		});

		it('manifest.yml has memory', () => {
			assert.file('manifest.yml');
			assert.fileContent('manifest.yml', 'memory: 1024M');
		});

		it('toolchain.yml repo type is clone', () => {
			assert.file('.bluemix/toolchain.yml');
			assert.fileContent('.bluemix/toolchain.yml', 'type: clone');
		});
	});
	
	let javaFrameworks = ['JAVA', 'SPRING'];
	let javaBuildTypes = ['maven', 'gradle'];
	let createTypes = ['basic/', 'microservice'];
	
	let assertYmlContent = function(actual, expected, label) {
		assert.strictEqual(actual, expected, 'Expected ' + label + ' to be ' + expected + ', found ' + actual);
	}
	javaFrameworks.forEach(language => {
		javaBuildTypes.forEach(buildType => {
			createTypes.forEach(createType => {

				describe('cloud-enablement:cloudfoundry with ' + language + ' with buildType ' + buildType + ' and createType ' + createType, () => {
					let bluemixJson = language === 'SPRING' ? scaffolderSampleSpring : scaffolderSampleJava;
					let options = {bluemix: JSON.stringify(bluemixJson), buildType : buildType, createType: createType};
					beforeEach(() => {
						return helpers.run(path.join(__dirname, '../generators/app'))
							.inDir(path.join(__dirname, './tmp'))
							.withOptions(options)
					});

					it('manifest.yml is generated with correct content', () => {
						assert.file('manifest.yml');
						let manifestyml = yml.safeLoad(fs.readFileSync('manifest.yml', 'utf8'));

						if ( language === 'JAVA ' ) {
							let targetDir = buildType === 'maven' ? 'target' : 'build'
							assertYmlContent(manifestyml.applications[0].path, './'+targetDir+'/my-application.zip', 'manifestyml.applications[0].path');
							assertYmlContent(manifestyml.applications[0].memory, '512M', 'manifestyml.applications[0].memory')
							assertYmlContent(manifestyml.applications[0].buildpack, 'liberty-for-java', 'manifestyml.applications[0].buildpack')
							assertYmlContent(manifestyml.applications[0].env.services_autoconfig_excludes, 'cloudantNoSQLDB=config Object-Storage=config', 'manifestyml.applications[0].env.services_autoconfig_excludes');
						} 
						
						if ( language === 'SPRING' ) {
							let targetDir = buildType === 'maven' ? 'target' : 'build/libs'
							assertYmlContent(manifestyml.applications[0].path, './'+targetDir+'/my-application.jar', 'manifestyml.applications[0].path');
							assertYmlContent(manifestyml.applications[0].memory, '256M', 'manifestyml.applications[0].memory')
							assertYmlContent(manifestyml.applications[0].buildpack, 'java_buildpack', 'manifestyml.applications[0].buildpack')
						}
					});

					it('deploy.json file is generated', () => {
						assert.file('.bluemix/deploy.json');
					});

					it('.cfignore file is generated', () => {
						assert.file('.cfignore');
						if(language === 'JAVA') {
							assert.fileContent('.cfignore', '/src/main/liberty/config/server.env');
						} else /* language === 'SPRING' */ {
							assert.fileContent('.cfignore', '/src/main/resources/application-local.properties');
						}
					});

					it('toolchain.yml file is generated with correct repo.parameters.type', () => {
						assert.file('.bluemix/toolchain.yml');
						let toolchainyml = yml.safeLoad(fs.readFileSync('.bluemix/toolchain.yml', 'utf8'));
						let repoType = toolchainyml.repo.parameters.type;
						if (createType === 'basic/') {
							assertYmlContent(repoType, 'link', 'toolchainyml.repo.type');
						} else {
							assertYmlContent(repoType, 'clone', 'toolchainyml.repo.type');
						}
					});

					it('pipeline.yml file is generated with correct content', () => {
						assert.file('.bluemix/pipeline.yml');
						let pipelineyml = yml.safeLoad(fs.readFileSync('.bluemix/pipeline.yml', 'utf8'));
						let stages = pipelineyml.stages;
						assert(stages.length === 2, 'Expected piplelineyml to have 2 stages, found ' + stages.length);
						stages.forEach(stage => {
							if(stage.name === 'Build Stage') {
								assertYmlContent(stage.triggers[0].type, 'commit', 'pipelineyml.stages[0].triggers[0].type');
								assertYmlContent(stage.jobs[0].build_type, 'shell', 'pipelineyml.stages[0].jobs[0].build_type');
								let buildCommand = buildType === 'maven' ? 'mvn install' : 'gradle build';
								assert(stage.jobs[0].script.includes('#!/bin/bash'), 'Expected pipelineyml.stages[0].jobs[0].script to include "#!/bin/bash", found : ' + stage.jobs[0].script);
								assert(stage.jobs[0].script.includes('export JAVA_HOME=$JAVA8_HOME'), 'Expected pipelineyml.stages[0].jobs[0].script to include "export JAVA_HOME=$JAVA8_HOME", found : ' + stage.jobs[0].script);
								assert(stage.jobs[0].script.includes(buildCommand), 'Expected pipelineyml.stages[0].jobs[0].script to include "' + buildCommand + '", found : ' + stage.jobs[0].script);
								let postBuildScript = fs.readFileSync(__dirname + '/samples/post-build-script.txt', 'utf8')
								assertYmlContent(postBuildScript, stage.jobs[1].script);
							}
							if(stage.name === 'Deploy Stage') {
								if ( language === 'JAVA ' ) {
									let targetDir = buildType === 'maven' ? 'target' : 'build'
									let deployCommand = 'cf push "${CF_APP}" -p '+targetDir+'/my-application.zip';
									assert(stage.jobs[0].script.includes(deployCommand), 'Expected deploy script to contain ' + deployCommand + ' found ' + stage.jobs[0].script);
								}
								if ( language === 'SPRING' ) {
									let targetDir = buildType === 'maven' ? 'target' : 'build/libs'
									let deployCommand = 'cf push "${CF_APP}" -p '+targetDir+'/my-application.jar'
									assert(stage.jobs[0].script.includes(deployCommand), 'Expected deploy script to contain ' + deployCommand + ' found ' + stage.jobs[0].script);
								}
							}
						})
					});
				});
			})
		});
	});

	describe('cloud-enablement:cloudfoundry with java-liberty with NO services', () => {
		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleJavaNoServices)});
		});

		it('manifest.yml is generated with correct content', () => {
			assert.file('manifest.yml');
			let manifestyml = yml.safeLoad(fs.readFileSync('manifest.yml', 'utf8'));
			if(manifestyml.applications[0].env) {
				assertYmlContent(manifestyml.applications[0].env.services_autoconfig_excludes, undefined, 'manifestyml.applications[0].env.services_autoconfig_excludes');
			}
		});
	});

	describe('cloud-enablement:cloudfoundry with java-liberty with NO platforms', () => {
		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleJava), platforms: []});
		});

		it('no cloud foundry files should be created', () => {
			assert.noFile('manifest.yml');
			assert.noFile('.bluemix/pipeline.yml');
			assert.noFile('.bluemix/toolchain.yml');
			assert.noFile('.bluemix/deploy.json');
			assert.noFile('.cfignore');
		});
	});

	describe('cloud-enablement:cloudfoundry with java-liberty with platforms array specified', () => {
		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleJava), platforms: ['bluemix']});
		});

		it('no cloud foundry files should be created', () => {
			assert.file('manifest.yml');
			assert.file('.bluemix/pipeline.yml');
			assert.file('.bluemix/toolchain.yml');
			assert.file('.bluemix/deploy.json');
			assert.file('.cfignore');
		});
	});

	describe('cloud-enablement:cloudfoundry with java-liberty and createType = bff', () => {
		beforeEach(() => {
			let bluemixJson = scaffolderSampleJava;
			return helpers.run(path.join(__dirname, '../generators/app'))
				.withOptions({ bluemix: JSON.stringify(bluemixJson), createType: 'bff' })
		});
		it('should contain the OPENAPI_SPEC env var', () => {
			let manifestyml = yml.safeLoad(fs.readFileSync('manifest.yml', 'utf8'));
			assertYmlContent(manifestyml.applications[0].env["OPENAPI_SPEC"], '/my-application/swagger/api', 'manifest.yml.env["OPENAPI_SPEC"]');
		});
	});

	describe('cloud-enablement:cloudfoundry with node with NO server', () => {
		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleNodeNoServer), repoType: "link"});
		});

		it('manifest has no server details', () => {
			assert.file('manifest.yml');
			assert.fileContent('manifest.yml', 'name: AcmeProject');
			assert.fileContent('manifest.yml', 'random-route: true');
			assert.noFileContent('manifest.yml', 'env:');
		});

		it('toolchain.yml repo type is link', () => {
			assert.file('.bluemix/toolchain.yml');
			assert.fileContent('.bluemix/toolchain.yml', 'type: link');
		});
	});
});

// describe('generator-cf-deploy', function () {
//   // Where options are what generator-cf-deploy LIKES to recieve------------------
//   describe('Node-ExpectedUse', function () {
//     it('Node cf-format test', function () {
//       return helpers.run(path.join(__dirname, '../generators/cloudfoundry'))
//         .withOptions(data.test_node_raw).then(function () {
//           assert.file("manifest.yml");
//           assert.file(".cfignore");
//           //we given our input, we expect to see manifest.yml contain an env OPENAPI_SPEC,
//           //a list of services, a command that corresponds with the NodeJS project; and .cfignore has expected content
//           assert.fileContent([
//             ['manifest.yml', 'OPENAPI_SPEC : /swagger/api'],
//             ['manifest.yml', /services:[\s\r\n\t]*- my-cloudant-service[\s\r\n\t]*- my-watson-service/g],
//             ['manifest.yml', 'command: npm start'],
//             ['.cfignore', /\.git\/[\s\r\n\t]*node_modules\/[\s\r\n\t]*test\/[\s\r\n\t]*vcap-local\.js/g]
//           ]);
//         });
//     });
//   });//end node-raw test

//   describe('Java-ExpectedUse', function () {
//     it('Java cf-format test', function () {
//       return helpers.run(path.join(__dirname, '../generators/cloudfoundry'))
//         .withOptions(data.test_java_raw).then(function () {
//           assert.file("manifest.yml");
//           assert.file(".cfignore");
//           //we given our input, we expect to see manifest.yml contain an env OPENAPI_SPEC with the appname injected,
//           //a list of environment variables, and a path
//           assert.fileContent([
//             ['manifest.yml', 'OPENAPI_SPEC : /angela-app/swagger/api'],
//             ['manifest.yml', /env:[\s\r\n\t]*services_autoconfig_excludes : Object-Storage=config/g],
//             ['manifest.yml', 'path: target/angela-app.zip'],
//             ['.cfignore', 'target/']
//           ]);
//         });
//     });
//   });//end java-raw test


//   describe('Swift-ExpectedUse', function () {
//     it('Node cf-format test', function () {
//       return helpers.run(path.join(__dirname, '../generators/cloudfoundry'))
//         .withOptions(data.test_swift_raw).then(function () {
//           assert.file("manifest.yml");
//           assert.file(".cfignore");
//           //we given our input, we expect to see manifest.yml contain the start command with the app name injected
//           //and the two entries in the .cfignore file
//           assert.fileContent([
//             ['manifest.yml', 'angela-app --bind 0.0.0.0:'],
//             ['.cfignore', /\.build\/\*[\s\r\n\t]*Packages\/\*/g]
//           ]);
//         });
//     });
//   });//end swift-raw test

//   //End where options are what generator-cf-deploy LIKES to recieve---------------
//   //Where options are what scaffolder is expected to pass ------------------------

//   describe('Node-ScaffolderUse', function () {
//     it('Node cf-format-scaffolder test', function () {
//       return helpers.run(path.join(__dirname, '../generators/cloudfoundry'))
//         .withOptions(data.test_node_spec).then(function () {
//           assert.file("manifest.yml");
//           assert.file(".cfignore");
//           assert.fileContent([
//             ['manifest.yml', 'command: npm start'],
//             ['manifest.yml', ' buildpack: sdk-for-nodejs'],
//             ['.cfignore', /\.git\/[\s\r\n\t]*node_modules\/[\s\r\n\t]*test\/[\s\r\n\t]*vcap-local\.js/g]
//           ]);
//         });
//     });
//   });//end node-spec test

//   describe('Swift-ScaffolderUse', function () {
//     it('Swift cf-format-scaffolder test', function () {
//       return helpers.run(path.join(__dirname, '../generators/cloudfoundry'))
//         .withOptions(data.test_swift_spec).then(function () {
//           assert.file("manifest.yml");
//           assert.file(".cfignore");
//           assert.fileContent([
//             ['manifest.yml', ' buildpack: swift_buildpack'],
//             ['manifest.yml', 'my-application --bind 0.0.0.0:'],
//             ['.cfignore', /\.build\/\*[\s\r\n\t]*Packages\/\*/g]
//           ]);
//         });
//     });
//   });//end swift-spec test

//   describe('java-ScaffolderUse', function () {
//     it('java cf-format-scaffolder test', function () {
//       return helpers.run(path.join(__dirname, '../generators/cloudfoundry'))
//         .withOptions(data.test_java_spec).then(function () {
//           assert.file("manifest.yml");
//           assert.file(".cfignore");
//           assert.fileContent([
//             ['manifest.yml', 'buildpack: liberty-for-java'],
//             ['manifest.yml', 'OPENAPI_SPEC : /my-application/swagger/api'],
//             ['manifest.yml', /services_autoconfig_excludes : Object-Storage=config/g],
//             ['manifest.yml', 'path: ./target/my-application.zip'],
//             ['.cfignore', 'target/']
//           ]);
//         });
//     });
//   });//end java-spec test
//   //End Where options are what scaffolder is expected to pass --------------------
// });//end generator-cf-deploy
