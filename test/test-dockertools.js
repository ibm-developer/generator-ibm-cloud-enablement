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

const scaffolderSample = require('./samples/scaffolder-sample');
const scaffolderSampleNode = scaffolderSample.getJson('NODE');
const scaffolderSampleSwift = scaffolderSample.getJson('SWIFT');
const scaffolderSampleJava = scaffolderSample.getJson('JAVA');
const scaffolderSampleSpring = scaffolderSample.getJson('SPRING');
const scaffolderSamplePython = scaffolderSample.getJson('PYTHON');

const applicationName = "AcmeProject"; // From all scaffolder samples

describe('cloud-enablement:dockertools', function () {
	this.timeout(5000);

	describe('cloud-enablement:dockertools with Swift project', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleSwift)});
		});

		it('create Dockerfile for running', function () {
			assert.file([
				'Dockerfile'
			]);
			assert.fileContent('Dockerfile', 'RUN apt-get update && apt-get dist-upgrade -y && apt-get install -y \\');
			assert.fileContent('Dockerfile', '  libpq-dev \\');
		});

		it('should have the executableName property set in Dockerfile', function () {
			assert.fileContent('Dockerfile', `CMD [ "sh", "-c", "cd /swift-project && .build-ubuntu/release/${applicationName}" ]`);
		});

		it('create Dockerfile-tools for compilation', function () {
			assert.file([
				'Dockerfile-tools'
			]);
			assert.fileContent('Dockerfile-tools', 'RUN apt-get update && apt-get dist-upgrade -y && apt-get install -y \\');
			assert.fileContent('Dockerfile', '  libpq-dev \\');
		});

		it('create cli-config for CLI tool', function () {
			assert.file(['cli-config.yml']);
			assert.fileContent('cli-config.yml', `chart-path : "chart/${applicationName.toLowerCase()}"`);
			assert.fileContent('cli-config.yml', 'run-cmd : ""');
			assert.fileContent('cli-config.yml', 'container-port-map-debug : "2048:1024,2049:1025"');
		});

		it('create dockerignore file', function () {
			assert.file([
				'.dockerignore'
			]);
		});

		it('should have the chart-path property set in cli-config.yml', function () {
			assert.fileContent('cli-config.yml', `chart-path : "chart/${applicationName.toLowerCase()}"`);
		});

		it('no swift-build-linux file', function () {
			assert.noFile([
				'.swift-build-linux'
			]);
		});

		it('no swift-test-linux file', function () {
			assert.noFile([
				'.swift-test-linux'
			]);
		});
	});

	describe('cloud-enablement:dockertools with NodeJS project', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleNode)})
		});

		it('create Dockerfile for running', function () {
			assert.file(['Dockerfile', 'cli-config.yml', 'Dockerfile-tools']);
		});

		it('has correct default port', function () {
			assert.fileContent('cli-config.yml', '3000:3000');
		});

		it('create dockerignore file', function () {
			assert.file([
				'.dockerignore'
			]);
		});

		it('should have the chart-path property set in cli-config.yml', function () {
			assert.fileContent('cli-config.yml', `chart-path : "chart/${applicationName.toLowerCase()}"`);
		});
	});

	describe('cloud-enablement:dockertools with NodeJS project and storage', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleNode)})
		});

		it('create Dockerfile for running', function () {
			assert.file(['Dockerfile', 'cli-config.yml', 'Dockerfile-tools']);
		});

		it('has correct port', function () {
			assert.fileContent('cli-config.yml', '3000:3000');
		});

		it('create dockerignore file', function () {
			assert.file([
				'.dockerignore'
			]);
		});

		it('should have the chart-path property set in cli-config.yml', function () {
			assert.fileContent('cli-config.yml', `chart-path : "chart/${applicationName.toLowerCase()}"`);
		});
	});

	/* Common Java Project characteristics: Spring or Liberty, maven or gradle */
	let javaBuildTypes = ['maven', 'gradle'];
	let javaFrameworks = ['JAVA', 'SPRING'];
	javaBuildTypes.forEach(buildType => {
		javaFrameworks.forEach(language => {
			describe('cloud-enablement:dockertools for ['+ language +'] project using [' + buildType + ']', function () {
				let bluemixJson = language === 'SPRING' ? scaffolderSampleSpring : scaffolderSampleJava;
				let javaVersion = '1.0-SNAPSHOT';
				let options = {bluemix: JSON.stringify(bluemixJson), buildType: buildType, version: javaVersion};
				
				beforeEach(function () {
					return helpers.run(path.join(__dirname, '../generators/app'))
						.inDir(path.join(__dirname, './tmp'))
						.withOptions(options)
				});

				it('create Dockerfile for running', function () {
					assert.file('Dockerfile');
				});
				it('create dockerignore file', function () {
					assert.file('.dockerignore');
				});
				it('create Dockerfile-tools for compilation', function () {
					assert.file('Dockerfile-tools');
				});
				it('create cli-config for CLI tool', function () {
					assert.file('cli-config.yml');
				});
				it('create cli-config chart path includes application name', function () {
					assert.fileContent('cli-config.yml', `chart-path : "chart/${applicationName.toLowerCase()}"`);
				});
				
				if ( language === "SPRING" ) {
					it('Dockerfile contains full jar name and app.jar', function () {
						assert.fileContent('Dockerfile', `${applicationName}-${javaVersion}.jar /app.jar`);
					});
					it('.dockerignore does not contain wlp', function () {
						assert.noFileContent('.dockerignore', 'wlp');
					});
					it('Dockerfile-tools does not contain wlp', function () {
						assert.noFileContent('Dockerfile-tools', 'wlp/bin');
					});
					it('cli-config file run-cmd includes version', function () {
						assert.noFileContent('cli-config.yml', `run-cmd : "java -Dspring.profiles.active=local -jar ${applicationName}-${javaVersion}.jar"`);
					});
				} else  /* language === 'JAVA' */ {
					it('.dockerignore ignores workarea and logs', function () {
						assert.fileContent('.dockerignore', 'workarea');
						assert.fileContent('.dockerignore', 'logs');
					});
					it('Dockerfile contains installUtility', function () {
						assert.fileContent('Dockerfile', 'installUtility');
					});
					it('Dockerfile contains LICENSE_JAR_URL', function () {
						assert.fileContent('Dockerfile', 'LICENSE_JAR_URL');
					});
                    			it('Dockerfile contains apmDataCollector-7.4', function () {
                        			assert.fileContent('Dockerfile', 'apmDataCollector-7.4');
                    			});
                    			it('Dockerfile contains config_liberty_dc.sh', function () {
                        			assert.fileContent('Dockerfile', 'config_liberty_dc.sh');
                    			});
					it('Dockerfile-tools contains wlp path', function () {
						assert.fileContent('Dockerfile-tools', 'wlp/bin');
					});
				}
				
				if ( buildType === "gradle" ) {
					it('Dockerfile references build directory', function () {
						assert.fileContent('Dockerfile', 'build');
						assert.noFileContent('Dockerfile', 'target');
					});
					it('Dockerfile-tools references gradle', function () {
						assert.fileContent('Dockerfile-tools', 'gradle');
						assert.noFileContent('Dockerfile-tools', 'maven');
					});
					it('CLI config references gradle', function () {
						assert.fileContent('cli-config.yml', 'gradle');
						assert.noFileContent('cli-config.yml', 'maven');
					});
				} else /* buildType === 'maven' */ {
					it('Dockerfile references target directory', function () {
						assert.fileContent('Dockerfile', 'target');
						assert.noFileContent('Dockerfile', 'build');
					});
					it('Dockerfile-tools references maven', function () {
						assert.fileContent('Dockerfile-tools', 'maven');
						assert.noFileContent('Dockerfile-tools', 'gradle');
					});
					it('CLI config references maven', function () {
						assert.fileContent('cli-config.yml', 'maven');
						assert.noFileContent('cli-config.yml', 'gradle');
					});
				}
			});
			
			/* Verify CLI platform included */
			describe('cloud-enablement:dockertools for ['+language+'] project using [' + buildType + '] (cli included)', function () {
				let bluemixJson = language === 'SPRING' ? scaffolderSampleSpring : scaffolderSampleJava;
				let options = {bluemix: JSON.stringify(bluemixJson), buildType: buildType, platforms: ['cli']};
				beforeEach(function () {
					return helpers.run(path.join(__dirname, '../generators/app'))
						.inDir(path.join(__dirname, './tmp'))
						.withOptions(options)
				});

				it('creates a creates a Dockerfile, .dockerignore, Dockerfile-tools and cli-config.yml', function () {
					assert.file(['Dockerfile', '.dockerignore', 'Dockerfile-tools', 'cli-config.yml']);
				});
			});
			
			/* Verify CLI platform excluded */
			describe('cloud-enablement:dockertools for ['+language+'] project using [' + buildType + '] (cli excluded)', function () {
				let bluemixJson = language === 'SPRING' ? scaffolderSampleSpring : scaffolderSampleJava;
				let options = {bluemix: JSON.stringify(bluemixJson), buildType: buildType, platforms: []};
				beforeEach(function () {
					return helpers.run(path.join(__dirname, '../generators/app'))
						.inDir(path.join(__dirname, './tmp'))
						.withOptions(options)
				});

				it('creates a Dockerfile and .dockerignore', function () {
					assert.file(['Dockerfile', '.dockerignore']);
				});
				it('does not create a Dockerfile-tools or cli-config.yml', function () {
					assert.noFile(['Dockerfile-tools', 'cli-config.yml']);
				});
			});
			
			/* Java Metrics enabled */
			describe('cloud-enablement:dockertools for ['+ language +'] project using [' + buildType + '] with javametrics enabled', function () {
				let bluemixJson = language === 'SPRING' ? scaffolderSampleSpring : scaffolderSampleJava;
				let options = {bluemix: JSON.stringify(bluemixJson), buildType: buildType, javametrics: true};
				beforeEach(function () {
					return helpers.run(path.join(__dirname, '../generators/app'))
						.inDir(path.join(__dirname, './tmp'))
						.withOptions(options)
				});

				/* TODO: spring and gradle builds do not support javametrics yet */
				if ( language === "SPRING" || buildType === 'gradle' ) {
					it('does not create javametrics COPY lines with gradle or SPRING', function () {
						assert.noFileContent('Dockerfile','COPY /target/liberty/wlp/usr/shared/resources /config/resources/');
						assert.noFileContent('Dockerfile','COPY /src/main/liberty/config/jvmbx.options /config/jvm.options');
					});
				} else {
					it('creates COPY lines for javametrics options with maven', function () {
						assert.fileContent('Dockerfile','COPY /target/liberty/wlp/usr/shared/resources /config/resources/');
						assert.fileContent('Dockerfile','COPY /src/main/liberty/config/jvmbx.options /config/jvm.options');
					});
				}
			});

			/* Java Metrics disabled */
			describe('cloud-enablement:dockertools for ['+ language +'] project using [' + buildType + '] with javametrics disabled', function () {
				let bluemixJson = language === 'SPRING' ? scaffolderSampleSpring : scaffolderSampleJava;
				let options = {bluemix: JSON.stringify(bluemixJson), buildType: buildType, javametrics: false};
				beforeEach(function () {
					return helpers.run(path.join(__dirname, '../generators/app'))
						.inDir(path.join(__dirname, './tmp'))
						.withOptions(options)
				});

				it('creates all docker without javametrics options', function () {
					assert.noFileContent('Dockerfile','COPY /target/liberty/wlp/usr/shared/resources /config/resources/');
					assert.noFileContent('Dockerfile','COPY /src/main/liberty/config/jvmbx.options /config/jvm.options');
				});
			});
		});
	});

	describe('cloud-enablement:dockertools with Python project', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSamplePython)})
		});

		it('create Dockerfile with gunicorn', function () {
			assert.file(['Dockerfile']);
			assert.fileContent('Dockerfile', 'gunicorn');
		});

		it('create Dockerfile-tools with flask', function () {
			assert.file(['Dockerfile-tools']);
		})

		it('create CLI-config file', function () {
			assert.file(['cli-config.yml']);
			assert.fileContent('cli-config.yml', 'flask run');
			assert.fileContent('cli-config.yml', 'acmeproject-flask-run');
			assert.fileContent('cli-config.yml', `chart-path : "chart/${applicationName.toLowerCase()}"`);
		});

		it('create dockerignore file', function () {
			assert.file([
				'.dockerignore'
			]);
		});
	});

	describe('cloud-enablement:dockertools with Python project and storage', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSamplePython)})
		});

		it('create Dockerfile with gunicorn', function () {
			assert.file(['Dockerfile']);
			assert.fileContent('Dockerfile', 'gunicorn');
		});

		it('create Dockerfile-tools with flask', function () {
			assert.file(['Dockerfile-tools']);
		})

		it('create CLI-config file', function () {
			assert.file(['cli-config.yml']);
			assert.fileContent('cli-config.yml', 'flask run');
			assert.fileContent('cli-config.yml', 'acmeproject-flask-run');
			assert.fileContent('cli-config.yml', `chart-path : "chart/${applicationName.toLowerCase()}"`);
		});

		it('create dockerignore file', function () {
			assert.file([
				'.dockerignore'
			]);
		});
	});

	describe('cloud-enablement:dockertools with empty bluemix object', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/dockertools'))
				.withOptions({ bluemix: '{"backendPlatform":"NODE"}' })
		});
		it('should give us the default output with no project name', function () {
			assert.file('Dockerfile');
			assert.fileContent('cli-config.yml', 'container-name-run : "app-express-run"');
		});
	});
});
