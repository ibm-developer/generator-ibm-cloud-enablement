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
const scaffolderSampleSwift = scaffolderSample.getJson('SWIFT');
const scaffolderSampleJava = scaffolderSample.getJson('JAVA');
const scaffolderSampleSpring = scaffolderSample.getJson('SPRING');
const scaffolderSamplePython = scaffolderSample.getJson('PYTHON');
const scaffolderSamplePythonNoServices = scaffolderSample.getJsonNoServices('PYTHON');
const scaffolderSampleDjango = scaffolderSample.getJson('DJANGO');
const scaffolderSampleDjangoNoServices = scaffolderSample.getJsonNoServices('DJANGO');
const scaffolderSampleGo = scaffolderSample.getJson('GO');
const scaffolderSampleGoNoServices = scaffolderSample.getJsonNoServices('GO');

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
			assert.fileContent('cli-config.yml', 'dockerfile-run : "Dockerfile"');
			assert.fileContent('cli-config.yml', 'dockerfile-tools : "Dockerfile-tools"');
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

	describe('cloud-enablement:dockertools with Swift project with mongo', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleSwift), services: JSON.stringify(['mongodb'])})
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

		it('create docker-compose and docker-compose-tools django', function () {
			assert.file(['docker-compose.yml', 'docker-compose-tools.yml']);
			assert.fileContent('docker-compose.yml', `container_name: "${applicationName.toLowerCase()}-swift-run"`);
			assert.fileContent('docker-compose.yml', 'MONGO_URL');
			assert.fileContent('docker-compose.yml', '2048:1024');
			assert.fileContent('docker-compose-tools.yml', 'MONGO_URL');
			assert.fileContent('docker-compose.yml', `image: "${applicationName.toLowerCase()}-swift-run"`);
			assert.fileContent('docker-compose-tools.yml', `container_name: "${applicationName.toLowerCase()}-swift-tools"`);
			assert.fileContent('docker-compose-tools.yml', `image: "${applicationName.toLowerCase()}-swift-tools"`);
		})

		it('create CLI-config file', function () {
			assert.file(['cli-config.yml']);
			assert.fileContent('cli-config.yml', `chart-path : "chart/${applicationName.toLowerCase()}"`);
			assert.fileContent('cli-config.yml', 'run-cmd : ""');
			assert.fileContent('cli-config.yml', 'container-port-map-debug : "2048:1024,2049:1025"');
			assert.fileContent('cli-config.yml', 'dockerfile-run : "docker-compose.yml"');
			assert.fileContent('cli-config.yml', 'dockerfile-tools : "docker-compose-tools.yml"');
		});

		it('create dockerignore file', function () {
			assert.file([
				'.dockerignore'
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

		it('create run-debug and run-dev if not present', function () {
			assert.file(['run-dev', 'run-debug']);
		});

		it('should have Dockerfile and Dockerfile-tools as the docker run commands', function() {
			assert.fileContent('cli-config.yml', 'dockerfile-run : "Dockerfile"');
			assert.fileContent('cli-config.yml', 'dockerfile-tools : "Dockerfile-tools"');
		});

		it('should have the correct EXPOSE instruction for Dockerfile and Dockerfile-tools', function() {
			assert.fileContent('Dockerfile' , 'EXPOSE 3000');
			assert.fileContent('Dockerfile-tools', 'EXPOSE 9229');
		});

		it('should have the correct run, stop and debug cmds for containers', function() {
			assert.fileContent('cli-config.yml', 'debug-cmd : "npm run debug"');
			assert.fileContent('cli-config.yml', 'stop-cmd : "npm stop"');
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

	describe('cloud-enablement:dockertools with NodeJS project with mongo', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleNode), services: JSON.stringify(['mongodb'])})
		});

		it('create Dockerfile for running', function () {
			assert.file(['Dockerfile', 'cli-config.yml', 'Dockerfile-tools']);
		});

		it('should have the correct EXPOSE instruction for Dockerfile and Dockerfile-tools', function() {
			assert.fileContent('Dockerfile' , 'EXPOSE 3000');
			assert.fileContent('Dockerfile-tools', 'EXPOSE 9229');
		});

		it('has correct port', function () {
			assert.fileContent('cli-config.yml', '3000:3000');
		});

		it('create dockerignore file', function () {
			assert.file([
				'.dockerignore'
			]);
		});

		it('should have the dockerfile-run property set as compose files cli-config.yml', function () {
			assert.fileContent('cli-config.yml', `dockerfile-run : "docker-compose.yml"`);
			assert.fileContent('cli-config.yml', `dockerfile-tools : "docker-compose-tools.yml"`);
			assert.fileContent('docker-compose.yml', `container_name: "${applicationName.toLowerCase()}-express-run"`);
			assert.fileContent('docker-compose.yml', `image: "${applicationName.toLowerCase()}-express-run"`);
			assert.fileContent('docker-compose-tools.yml', `container_name: "${applicationName.toLowerCase()}-express-tools"`);
			assert.fileContent('docker-compose-tools.yml', `image: "${applicationName.toLowerCase()}-express-tools"`);
			assert.fileContent('docker-compose-tools.yml', `MONGO_URL`);

		});

		it('create docker-compose.yml and docker-compose-tools.yml for running', function () {
			assert.file(['docker-compose.yml', 'docker-compose-tools.yml']);
		});

		it('should have the chart-path property set in cli-config.yml', function () {
			assert.fileContent('cli-config.yml', `chart-path : "chart/${applicationName.toLowerCase()}"`);
		});
	});

	/* Common Java Project characteristics: Spring or Liberty, maven or gradle */
	let javaBuildTypes = ['maven', 'gradle'];
	let javaFrameworks = ['JAVA', 'libertyBeta', 'SPRING'];
	javaBuildTypes.forEach(buildType => {
		javaFrameworks.forEach(language => {
			describe('cloud-enablement:dockertools for ['+ language +'] project using [' + buildType + ']', function () {
				let bluemixJson = language === 'SPRING' ? scaffolderSampleSpring : scaffolderSampleJava;
				let artifactId = 'testArtifact-id';
				let javaVersion = '1.0-SNAPSHOT';
				let options = {bluemix: JSON.stringify(bluemixJson), buildType: buildType, artifactId: artifactId, version: javaVersion};

				if (language === 'libertyBeta') {
					options.libertyVersion = 'beta'
				}

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
						assert.fileContent('Dockerfile', `${artifactId}-${javaVersion}.jar /app.jar`);
					});
					it('.dockerignore does not contain wlp', function () {
						assert.noFileContent('.dockerignore', 'wlp');
					});
					it('Dockerfile-tools does not contain wlp', function () {
						assert.noFileContent('Dockerfile-tools', 'wlp/bin');
					});
					it('cli-config file does not have a run-cmd', function () {
						assert.noFileContent('cli-config.yml', 'run-cmd');
					});
				}
				if (language === 'JAVA' || language === 'libertyBeta') {
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
					it('Dockerfile contains LD_LIBRARY_PATH', function () {
						assert.fileContent('Dockerfile', 'LD_LIBRARY_PATH');
					});
					it('Dockerfile contains JVM_ARGS', function () {
						assert.fileContent('Dockerfile', 'JVM_ARGS');
					});
					it('Dockerfile-tools contains wlp path', function () {
						assert.fileContent('Dockerfile-tools', 'wlp/bin');
					});
				}
				if (language === 'JAVA') {
					it('Dockerfile contains correct Liberty image', function() {
						assert.fileContent('Dockerfile', 'FROM websphere-liberty:webProfile7')
					})
				}
				if (language === 'libertyBeta') {
					it('Dockerfile contains correct Liberty beta image', function() {
						assert.fileContent('Dockerfile', 'FROM websphere-liberty:beta')
					})
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

		it('create Dockerfile with start command', function () {
			assert.file(['Dockerfile']);
			assert.fileContent('Dockerfile', '"python", "manage.py", "start"');
			assert.fileContent('Dockerfile', 'ENV FLASK_APP=server/__init__.py');
		});

		it('create Dockerfile-tools with flask', function () {
			assert.file(['Dockerfile-tools']);
		})


		it('should have Dockerfile and Dockerfile-tools as the docker run commands', function() {
			assert.fileContent('cli-config.yml', 'dockerfile-run : "Dockerfile"');
			assert.fileContent('cli-config.yml', 'dockerfile-tools : "Dockerfile-tools"');
		});

		it('create CLI-config file', function () {
			assert.file(['cli-config.yml']);
			assert.fileContent('cli-config.yml', 'python manage.py');
			assert.fileContent('cli-config.yml', 'acmeproject-flask-run');
			assert.fileContent('cli-config.yml', `chart-path : "chart/${applicationName.toLowerCase()}"`);
		});

		it('create manage.py file for flask', function () {
			assert.file(['manage.py']);
			assert.fileContent('manage.py', 'flask run');
		})

		it('create dockerignore file', function () {
			assert.file([
				'.dockerignore'
			]);
		});
	});

	describe('cloud-enablement:dockertools with Python project -- ibmcloud dev enable', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({
					bluemix: JSON.stringify(scaffolderSamplePython),
					enable: true
				})
		});

		it('create Dockerfile with informative echo prompt', function () {
			assert.file(['Dockerfile']);
			assert.fileContent('Dockerfile', 'echo');
		});

		it('create Dockerfile-tools with flask', function () {
			assert.file(['Dockerfile-tools']);
		})

		it('create CLI-config file with informative echo prompt', function () {
			assert.file(['cli-config.yml']);
			assert.fileContent('cli-config.yml', 'echo');
			assert.fileContent('cli-config.yml', 'acmeproject-flask-run');
			assert.fileContent('cli-config.yml', `chart-path : "chart/${applicationName.toLowerCase()}"`);
		});

		it('should have Dockerfile and Dockerfile-tools as the docker run commands', function() {
			assert.fileContent('cli-config.yml', 'dockerfile-run : "Dockerfile"');
			assert.fileContent('cli-config.yml', 'dockerfile-tools : "Dockerfile-tools"');
		});

		it('does not create manage.py file for flask', function () {
			assert.noFile(['manage.py']);
		})

		it('create dockerignore file', function () {
			assert.file([
				'.dockerignore'
			]);
		});
	});

	describe('cloud-enablement:dockertools with Python project with no services', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSamplePythonNoServices)})
		});

		it('create Dockerfile with start command and service package', function () {
			assert.file(['Dockerfile']);
			assert.fileContent('Dockerfile', '"python", "manage.py", "start"');
			assert.noFileContent('Dockerfile', 'postgresql-dev \\');
		});
		it('should have Dockerfile and Dockerfile-tools as the docker run commands', function() {
			assert.fileContent('cli-config.yml', 'dockerfile-run : "Dockerfile"');
			assert.fileContent('cli-config.yml', 'dockerfile-tools : "Dockerfile-tools"');
		});


		it('create Dockerfile-tools with flask	and service package', function () {
			assert.file(['Dockerfile-tools']);
			assert.noFileContent('Dockerfile', 'postgresql-dev \\');
		});

		it('create CLI-config file', function () {
			assert.file(['cli-config.yml']);
			assert.fileContent('cli-config.yml', 'python manage.py');
			assert.fileContent('cli-config.yml', 'acmeproject-flask-run');
			assert.fileContent('cli-config.yml', `chart-path : "chart/${applicationName.toLowerCase()}"`);
		});

		it('create manage.py file for flask', function () {
			assert.file(['manage.py']);
			assert.fileContent('manage.py', 'flask run');
		})

		it('create dockerignore file', function () {
			assert.file([
				'.dockerignore'
			]);
		});
	});

	describe('cloud-enablement:dockertools with Python project with PostgreSQL', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSamplePython)})
		});

		it('create Dockerfile with start command and service package', function () {
			assert.file(['Dockerfile']);
			assert.fileContent('Dockerfile', '"python", "manage.py", "start"');
			assert.fileContent('Dockerfile', 'postgresql-dev \\');
		});

		it('create Dockerfile-tools with flask	and service package', function () {
			assert.file(['Dockerfile-tools']);
			assert.fileContent('Dockerfile', 'postgresql-dev \\');
		});

		it('create CLI-config file', function () {
			assert.file(['cli-config.yml']);
			assert.fileContent('cli-config.yml', 'python manage.py');
			assert.fileContent('cli-config.yml', 'acmeproject-flask-run');
			assert.fileContent('cli-config.yml', `chart-path : "chart/${applicationName.toLowerCase()}"`);
			assert.fileContent('cli-config.yml', 'dockerfile-run : "Dockerfile"');
			assert.fileContent('cli-config.yml', 'dockerfile-tools : "Dockerfile-tools"');
		});

		it('create manage.py file for flask', function () {
			assert.file(['manage.py']);
			assert.fileContent('manage.py', 'flask run');
		})

		it('create dockerignore file', function () {
			assert.file([
				'.dockerignore'
			]);
		});
	});

	describe('cloud-enablement:dockertools with Python project with mongo', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSamplePython), services: JSON.stringify(['mongodb'])})
		});

		it('create Dockerfile with start command', function () {
			assert.file(['Dockerfile']);
			assert.fileContent('Dockerfile', '"python", "manage.py", "start"');
		});

		it('should have the dockerfile-run property set as compose files cli-config.yml', function () {
			assert.fileContent('cli-config.yml', `dockerfile-run : "docker-compose.yml"`);
			assert.fileContent('cli-config.yml', `dockerfile-tools : "docker-compose-tools.yml"`);
		});

		it('create Dockerfile-tools with flask', function () {
			assert.file(['Dockerfile-tools']);
		})
		it('create docker-compose.yml with flask', function () {
			assert.file(['docker-compose.yml']);
			assert.fileContent('docker-compose.yml', `MONGO_URL`);
		});

		it('should have the correct image name and container name for docker-compose and docker-compose-tools', function() {
			assert.fileContent('docker-compose.yml', `container_name: "${applicationName.toLowerCase()}-flask-run"`);
			assert.fileContent('docker-compose.yml', `image: "${applicationName.toLowerCase()}-flask-run"`);
			assert.fileContent('docker-compose-tools.yml', `container_name: "${applicationName.toLowerCase()}-flask-tools"`);
			assert.fileContent('docker-compose-tools.yml', `image: "${applicationName.toLowerCase()}-flask-tools"`);
			assert.fileContent('docker-compose-tools.yml', `MONGO_URL`);
		});


		it('docker-compose-tools.yml with flask', function () {
			assert.file(['docker-compose-tools.yml']);
		})

		it('create CLI-config file', function () {
			assert.file(['cli-config.yml']);
			assert.fileContent('cli-config.yml', 'python manage.py');
			assert.fileContent('cli-config.yml', 'acmeproject-flask-run');
			assert.fileContent('cli-config.yml', `chart-path : "chart/${applicationName.toLowerCase()}"`);
		});

		it('create manage.py file for flask', function () {
			assert.file(['manage.py']);
			assert.fileContent('manage.py', 'flask run');
		})

		it('create dockerignore file', function () {
			assert.file([
				'.dockerignore'
			]);
		});
	});


	describe('cloud-enablement:dockertools with Django project', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleDjango)})
		});

		it('create Dockerfile with gunicorn', function () {
			assert.file(['Dockerfile']);
			assert.fileContent('Dockerfile', 'gunicorn');
		});

		it('create Dockerfile-tools with django', function () {
			assert.file(['Dockerfile-tools']);
		})

		it('create CLI-config file', function () {
			assert.file(['cli-config.yml']);
			assert.fileContent('cli-config.yml', 'python manage.py runserver --noreload');
			assert.fileContent('cli-config.yml', 'acmeproject-django-run');
			assert.fileContent('cli-config.yml', `chart-path : "chart/${applicationName.toLowerCase()}"`);
			assert.fileContent('cli-config.yml', 'dockerfile-run : "Dockerfile"');
			assert.fileContent('cli-config.yml', 'dockerfile-tools : "Dockerfile-tools"');
		});

		it('create dockerignore file', function () {
			assert.file([
				'.dockerignore'
			]);
		});
	});

	describe('cloud-enablement:dockertools with Django project -- ibmcloud dev enable', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({
					bluemix: JSON.stringify(scaffolderSampleDjango),
					enable: true
				})
		});

		it('create Dockerfile with informative echo prompt', function () {
			assert.file(['Dockerfile']);
			assert.fileContent('Dockerfile', 'echo');
		});

		it('create Dockerfile-tools with django', function () {
			assert.file(['Dockerfile-tools']);
		})


		it('should have Dockerfile and Dockerfile-tools as the docker run commands', function() {
			assert.fileContent('cli-config.yml', 'dockerfile-run : "Dockerfile"');
			assert.fileContent('cli-config.yml', 'dockerfile-tools : "Dockerfile-tools"');
		});


		it('create CLI-config file with informative echo prompt', function () {
			assert.file(['cli-config.yml']);
			assert.fileContent('cli-config.yml', 'echo');
			assert.fileContent('cli-config.yml', 'acmeproject-django-run');
			assert.fileContent('cli-config.yml', `chart-path : "chart/${applicationName.toLowerCase()}"`);
		});

		it('create dockerignore file', function () {
			assert.file([
				'.dockerignore'
			]);
		});
	});

	describe('cloud-enablement:dockertools with Django project with no services', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleDjangoNoServices)})
		});

		it('create Dockerfile with gunicorn and service package', function () {
			assert.file(['Dockerfile']);
			assert.fileContent('Dockerfile', 'gunicorn');
			assert.noFileContent('Dockerfile', 'postgresql-dev \\');
		});

		it('create Dockerfile-tools with django  and service package', function () {
			assert.file(['Dockerfile-tools']);
			assert.noFileContent('Dockerfile', 'postgresql-dev \\');
		});

		it('create CLI-config file', function () {
			assert.file(['cli-config.yml']);
			assert.fileContent('cli-config.yml', 'python manage.py runserver --noreload');
			assert.fileContent('cli-config.yml', 'acmeproject-django-run');
			assert.fileContent('cli-config.yml', `chart-path : "chart/${applicationName.toLowerCase()}"`);
			assert.fileContent('cli-config.yml', 'dockerfile-run : "Dockerfile"');
			assert.fileContent('cli-config.yml', 'dockerfile-tools : "Dockerfile-tools"');
		});

		it('create dockerignore file', function () {
			assert.file([
				'.dockerignore'
			]);
		});
	});

	describe('cloud-enablement:dockertools with Django project with PostgreSQL', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleDjango)})
		});

		it('create Dockerfile with gunicorn and service package', function () {
			assert.file(['Dockerfile']);
			assert.fileContent('Dockerfile', 'gunicorn');
			assert.fileContent('Dockerfile', 'postgresql-dev \\');
		});

		it('create Dockerfile-tools with django  and service package', function () {
			assert.file(['Dockerfile-tools']);
			assert.fileContent('Dockerfile', 'postgresql-dev \\');
		});

		it('create CLI-config file', function () {
			assert.file(['cli-config.yml']);
			assert.fileContent('cli-config.yml', 'python manage.py runserver --noreload');
			assert.fileContent('cli-config.yml', 'acmeproject-django-run');
			assert.fileContent('cli-config.yml', `chart-path : "chart/${applicationName.toLowerCase()}"`);
			assert.fileContent('cli-config.yml', 'dockerfile-run : "Dockerfile"');
			assert.fileContent('cli-config.yml', 'dockerfile-tools : "Dockerfile-tools"');
		});

		it('create dockerignore file', function () {
			assert.file([
				'.dockerignore'
			]);
		});
	});

	describe('cloud-enablement:dockertools with Django project with mongo', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleDjango), services: JSON.stringify(['mongodb'])})
		});

		it('create Dockerfile with gunicorn', function () {
			assert.file(['Dockerfile']);
			assert.fileContent('Dockerfile', 'gunicorn');
		});

		it('create Dockerfile-tools with django', function () {
			assert.file(['Dockerfile-tools']);
		})

		it('create docker-compose and docker-compose-tools django', function () {
			assert.file(['docker-compose.yml', 'docker-compose-tools.yml']);
			assert.fileContent('docker-compose.yml', `container_name: "${applicationName.toLowerCase()}-django-run"`);
			assert.fileContent('docker-compose.yml', `image: "${applicationName.toLowerCase()}-django-run"`);
			assert.fileContent('docker-compose-tools.yml', `container_name: "${applicationName.toLowerCase()}-django-tools"`);
			assert.fileContent('docker-compose-tools.yml', `image: "${applicationName.toLowerCase()}-django-tools"`);
		})

		it('create CLI-config file', function () {
			assert.file(['cli-config.yml']);
			assert.fileContent('cli-config.yml', 'python manage.py runserver --noreload');
			assert.fileContent('cli-config.yml', 'acmeproject-django-run');
			assert.fileContent('cli-config.yml', `dockerfile-run : "docker-compose.yml"`);
			assert.fileContent('cli-config.yml', `dockerfile-tools : "docker-compose-tools.yml"`);
			assert.fileContent('cli-config.yml', `chart-path : "chart/${applicationName.toLowerCase()}"`);
		});

		it('create dockerignore file', function () {
			assert.file([
				'.dockerignore'
			]);
		});
	});

	describe('cloud-enablement:dockertools with Go project', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleGo)})
		});

		it('create Dockerfile for running', function () {
			assert.file(['Dockerfile', 'cli-config.yml', 'Dockerfile-tools']);
		});

		it('should have Dockerfile and Dockerfile-tools as the docker run commands', function() {
			assert.fileContent('cli-config.yml', 'dockerfile-run : "Dockerfile"');
			assert.fileContent('cli-config.yml', 'dockerfile-tools : "Dockerfile-tools"');
		});

		it('should have the correct EXPOSE instruction for Dockerfile and Dockerfile-tools', function() {
			assert.fileContent('Dockerfile' , 'EXPOSE 8080');
			assert.fileContent('Dockerfile-tools', 'EXPOSE 8181');
		});

		it('should have the correct build, test and debug cmds for containers', function() {
			assert.fileContent('cli-config.yml', 'build-cmd-run : "go build"');
			assert.fileContent('cli-config.yml', 'debug-cmd : "dlv debug --headless --listen=0.0.0.0:8181"');
			assert.fileContent('cli-config.yml', 'test-cmd : "go test ./..."');
		});

		it('has correct default port', function () {
			assert.fileContent('cli-config.yml', '8080:8080');
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

	describe('cloud-enablement:dockertools with Go project with no services', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleGoNoServices)})
		});

		it('create Dockerfile with dep ensure and no service package', function () {
			assert.file(['Dockerfile']);
			assert.fileContent('Dockerfile', 'dep ensure');
			assert.fileContent('Dockerfile', '8080');
			assert.fileContent('Dockerfile-tools', '8181');
			assert.noFileContent('Dockerfile', 'postgresql-dev \\');
		});

		it('create Dockerfile-tools with go and no service package', function () {
			assert.file(['Dockerfile-tools']);
			assert.noFileContent('Dockerfile', 'postgresql-dev \\');
		});

		it('create CLI-config file', function () {
			assert.file(['cli-config.yml']);
			assert.fileContent('cli-config.yml', 'go build');
			assert.fileContent('cli-config.yml', 'acmeproject-go-run');
			assert.fileContent('cli-config.yml', `chart-path : "chart/${applicationName.toLowerCase()}"`);
			assert.fileContent('cli-config.yml', 'dockerfile-run : "Dockerfile"');
			assert.fileContent('cli-config.yml', 'dockerfile-tools : "Dockerfile-tools"');
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
				.withOptions({ bluemix: JSON.stringify({backendPlatform: 'NODE' })
				});
		});
		it('should give us the default output with no project name', function () {
			assert.file('Dockerfile');
			assert.fileContent('cli-config.yml', 'container-name-run : "app-express-run"');
		});
	});
});
