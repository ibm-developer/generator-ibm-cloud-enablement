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

describe('cloud-enablement:dockertools', () => {

	before(function(){
		this.timeout(5000);
	});

	describe('cloud-enablement:dockertools with Swift project', () => {
		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleSwift)});
		});

		it('create Dockerfile for running', () => {
			assert.file([
				'Dockerfile'
			]);
		});

		it('should have the executableName property set in Dockerfile', () => {
			assert.fileContent('Dockerfile', `CMD [ "sh", "-c", "cd /swift-project && .build-ubuntu/release/${applicationName}" ]`);
		});

		it('create Dockerfile-tools for compilation', () => {
			assert.file([
				'Dockerfile-tools'
			]);
		});

		it('create cli-config for CLI tool', () => {
			assert.file(['cli-config.yml']);
			assert.fileContent('cli-config.yml', `chart-path : "chart/${applicationName.toLowerCase()}"`);
			assert.fileContent('cli-config.yml', 'run-cmd : ""');
		});

		it('create dockerignore file', () => {
			assert.file([
				'.dockerignore'
			]);
		});

		it('should have the chart-path property set in cli-config.yml', () => {
			assert.fileContent('cli-config.yml', `chart-path : "chart/${applicationName.toLowerCase()}"`);
		});
	});

	describe('cloud-enablement:dockertools with NodeJS project', () => {
		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleNode)})
		});

		it('create Dockerfile for running', () => {
			assert.file(['Dockerfile', 'cli-config.yml', 'Dockerfile-tools']);
		});

		it('has correct default port', () => {
			assert.fileContent('cli-config.yml', '3000:3000');
		});

		it('create dockerignore file', () => {
			assert.file([
				'.dockerignore'
			]);
		});

		it('should have the chart-path property set in cli-config.yml', () => {
			assert.fileContent('cli-config.yml', `chart-path : "chart/${applicationName.toLowerCase()}"`);
		});
	});

	describe('cloud-enablement:dockertools with NodeJS project and storage', () => {
		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleNode)})
		});

		it('create Dockerfile for running', () => {
			assert.file(['Dockerfile', 'cli-config.yml', 'Dockerfile-tools']);
		});

		it('has correct port', () => {
			assert.fileContent('cli-config.yml', '3000:3000');
		});

		it('create dockerignore file', () => {
			assert.file([
				'.dockerignore'
			]);
		});

		it('should have the chart-path property set in cli-config.yml', () => {
			assert.fileContent('cli-config.yml', `chart-path : "chart/${applicationName.toLowerCase()}"`);
		});
	});

	/* Common Java Project characteristics: Spring or Liberty, maven or gradle */
	let javaBuildTypes = ['maven', 'gradle'];
	let javaFrameworks = ['JAVA', 'SPRING'];
	javaBuildTypes.forEach(buildType => {
		javaFrameworks.forEach(language => {
			describe('cloud-enablement:dockertools for ['+ language +'] project using [' + buildType + ']', () => {
				let bluemixJson = language === 'SPRING' ? scaffolderSampleSpring : scaffolderSampleJava;
				let options = {bluemix: JSON.stringify(bluemixJson), buildType: buildType};
				
				beforeEach(() => {
					return helpers.run(path.join(__dirname, '../generators/app'))
						.inDir(path.join(__dirname, './tmp'))
						.withOptions(options)
				});

				it('create Dockerfile for running', () => {
					assert.file('Dockerfile');
				});
				it('create dockerignore file', () => {
					assert.file('.dockerignore');
				});
				it('create Dockerfile-tools for compilation', () => {
					assert.file('Dockerfile-tools');
				});
				it('create cli-config for CLI tool', () => {
					assert.file('cli-config.yml');
				});
				it('create cli-config chart path includes application name', () => {
					assert.fileContent('cli-config.yml', `chart-path : "chart/${applicationName.toLowerCase()}"`);
				});
				
				if ( language === "SPRING" ) {
					it('Dockerfile contains app.jar', () => {
						assert.fileContent('Dockerfile', '/app.jar');
					});
					it('.dockerignore does not contain wlp', () => {
						assert.noFileContent('.dockerignore', 'wlp');
					});
					it('Dockerfile-tools does not contain wlp', () => {
						assert.noFileContent('Dockerfile-tools', 'wlp/bin');
					});
				} else  /* language === 'JAVA' */ {
					it('.dockerignore ignores workarea and logs', () => {
						assert.fileContent('.dockerignore', 'workarea');
						assert.fileContent('.dockerignore', 'logs');
					});
					it('Dockerfile contains installUtility', () => {
						assert.fileContent('Dockerfile', 'installUtility');
					});
					it('Dockerfile-tools contains wlp path', () => {
						assert.fileContent('Dockerfile-tools', 'wlp/bin');
					});
				}
				
				if ( buildType === "gradle" ) {
					it('Dockerfile references build directory', () => {
						assert.fileContent('Dockerfile', 'build');
						assert.noFileContent('Dockerfile', 'target');
					});
					it('Dockerfile-tools references gradle', () => {
						assert.fileContent('Dockerfile-tools', 'gradle');
						assert.noFileContent('Dockerfile-tools', 'maven');
					});
					it('CLI config references gradle', () => {
						assert.fileContent('cli-config.yml', 'gradle');
						assert.noFileContent('cli-config.yml', 'maven');
					});
				} else /* buildType === 'maven' */ {
					it('Dockerfile references target directory', () => {
						assert.fileContent('Dockerfile', 'target');
						assert.noFileContent('Dockerfile', 'build');
					});
					it('Dockerfile-tools references maven', () => {
						assert.fileContent('Dockerfile-tools', 'maven');
						assert.noFileContent('Dockerfile-tools', 'gradle');
					});
					it('CLI config references maven', () => {
						assert.fileContent('cli-config.yml', 'maven');
						assert.noFileContent('cli-config.yml', 'gradle');
					});
				}
			});
			
			/* Verify CLI platform included */
			describe('cloud-enablement:dockertools for ['+language+'] project using [' + buildType + '] (cli included)', () => {
				let bluemixJson = language === 'SPRING' ? scaffolderSampleSpring : scaffolderSampleJava;
				let options = {bluemix: JSON.stringify(bluemixJson), buildType: buildType, platforms: ['cli']};
				beforeEach(() => {
					return helpers.run(path.join(__dirname, '../generators/app'))
						.inDir(path.join(__dirname, './tmp'))
						.withOptions(options)
				});

				it('creates a Dockerfile and .dockerignore', () => {
					assert.file(['Dockerfile', '.dockerignore', 'Dockerfile-tools', 'cli-config.yml']);
				});
			});
			
			/* Verify CLI platform excluded */
			describe('cloud-enablement:dockertools for ['+language+'] project using [' + buildType + '] (cli excluded)', () => {
				let bluemixJson = language === 'SPRING' ? scaffolderSampleSpring : scaffolderSampleJava;
				let options = {bluemix: JSON.stringify(bluemixJson), buildType: buildType, platforms: []};
				beforeEach(() => {
					return helpers.run(path.join(__dirname, '../generators/app'))
						.inDir(path.join(__dirname, './tmp'))
						.withOptions(options)
				});

				it('creates a Dockerfile and .dockerignore', () => {
					assert.file(['Dockerfile', '.dockerignore']);
				});
				it('does not create a Dockerfile-tools or cli-config.yml', () => {
					assert.noFile(['Dockerfile-tools', 'cli-config.yml']);
				});
			});
			
			/* Java Metrics enabled */
			describe('cloud-enablement:dockertools for ['+ language +'] project using [' + buildType + '] with javametrics enabled', () => {
				let bluemixJson = language === 'SPRING' ? scaffolderSampleSpring : scaffolderSampleJava;
				let options = {bluemix: JSON.stringify(bluemixJson), buildType: buildType, javametrics: true};
				beforeEach(() => {
					return helpers.run(path.join(__dirname, '../generators/app'))
						.inDir(path.join(__dirname, './tmp'))
						.withOptions(options)
				});

				/* TODO: spring and gradle builds do not support javametrics yet */
				if ( language === "SPRING" || buildType === 'gradle' ) {
					it('creates does not create coremetrics COPY lines with gradle', () => {
						assert.noFileContent('Dockerfile','COPY /target/liberty/wlp/usr/shared/resources /config/resources/');
						assert.noFileContent('Dockerfile','COPY /src/main/liberty/config/jvmbx.options /config/jvm.options');
					});
				} else {
					it('creates COPY lines for javametrics options with maven', () => {
						assert.fileContent('Dockerfile','COPY /target/liberty/wlp/usr/shared/resources /config/resources/');
						assert.fileContent('Dockerfile','COPY /src/main/liberty/config/jvmbx.options /config/jvm.options');
					});
				}
			});

			/* Java Metrics disabled */
			describe('cloud-enablement:dockertools for ['+ language +'] project using [' + buildType + '] with javametrics disabled', () => {
				let bluemixJson = language === 'SPRING' ? scaffolderSampleSpring : scaffolderSampleJava;
				let options = {bluemix: JSON.stringify(bluemixJson), buildType: buildType, javametrics: false};
				beforeEach(() => {
					return helpers.run(path.join(__dirname, '../generators/app'))
						.inDir(path.join(__dirname, './tmp'))
						.withOptions(options)
				});

				it('creates all docker without javametrics options', () => {
					assert.noFileContent('Dockerfile','COPY /target/liberty/wlp/usr/shared/resources /config/resources/');
					assert.noFileContent('Dockerfile','COPY /src/main/liberty/config/jvmbx.options /config/jvm.options');
				});
			});
		});
	});

	describe('cloud-enablement:dockertools with Python project', () => {
		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSamplePython)})
		});

		it('create Dockerfile with gunicorn', () => {
			assert.file(['Dockerfile']);
			assert.fileContent('Dockerfile', 'gunicorn');
		});

		it('create Dockerfile-tools with flask', () => {
			assert.file(['Dockerfile-tools']);
		})

		it('create CLI-config file', () => {
			assert.file(['cli-config.yml']);
			assert.fileContent('cli-config.yml', 'flask run');
			assert.fileContent('cli-config.yml', 'acmeproject-flask-run');
			assert.fileContent('cli-config.yml', `chart-path : "chart/${applicationName.toLowerCase()}"`);
		});

		it('create dockerignore file', () => {
			assert.file([
				'.dockerignore'
			]);
		});
	});

	describe('cloud-enablement:dockertools with Python project and storage', () => {
		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSamplePython)})
		});

		it('create Dockerfile with gunicorn', () => {
			assert.file(['Dockerfile']);
			assert.fileContent('Dockerfile', 'gunicorn');
		});

		it('create Dockerfile-tools with flask', () => {
			assert.file(['Dockerfile-tools']);
		})

		it('create CLI-config file', () => {
			assert.file(['cli-config.yml']);
			assert.fileContent('cli-config.yml', 'flask run');
			assert.fileContent('cli-config.yml', 'acmeproject-flask-run');
			assert.fileContent('cli-config.yml', `chart-path : "chart/${applicationName.toLowerCase()}"`);
		});

		it('create dockerignore file', () => {
			assert.file([
				'.dockerignore'
			]);
		});
	});

	describe('cloud-enablement:dockertools with empty bluemix object', () => {
		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/dockertools'))
				.withOptions({ bluemix: '{"backendPlatform":"NODE"}' })
		});
		it('should give us the default output with no project name', () => {
			assert.file('Dockerfile');
			assert.fileContent('cli-config.yml', 'container-name-run : "app-express-run"');
		});
	});
});