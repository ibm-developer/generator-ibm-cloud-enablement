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
const fs = require('fs');
const yml = require('js-yaml');

const scaffolderSample = require('./samples/scaffolder-sample');
const scaffolderSampleNode = scaffolderSample.getJson('NODE');
const scaffolderSampleNodeNoServer = scaffolderSample.getJsonNoServer('NODE');
const scaffolderSampleSwift = scaffolderSample.getJson('SWIFT');
const scaffolderSampleJava = scaffolderSample.getJson('JAVA');
const scaffolderSampleSpring = scaffolderSample.getJson('SPRING');
const scaffolderSamplePython = scaffolderSample.getJson('PYTHON');
const deploymentMongoSample = fs.readFileSync(path.join(__dirname, 'samples/deployment-with-mongo.yaml'), 'utf-8');
const deploymentMongoJavaSample = fs.readFileSync(path.join(__dirname, 'samples/deployment-with-mongo-java.yaml'), 'utf-8');
const valuesMongoSample = fs.readFileSync(path.join(__dirname, 'samples/values-with-mongo.yaml'), 'utf-8');
const valuesMongoJavaSample = fs.readFileSync(path.join(__dirname, 'samples/values-with-mongo-java.yaml'), 'utf-8');
const valuesMongoSwiftPythonSample = fs.readFileSync(path.join(__dirname, 'samples/values-with-mongo-swift-python.yaml'), 'utf-8');

const applicationName = 'AcmeProject'; // from sample json files
const chartLocation = 'chart/' + applicationName.toLowerCase();

function testOutput() {

	it('has kubernetes config for Chart.yaml', () => {
		let chartFile = chartLocation + '/Chart.yaml';
		assert.file(chartFile);
		let chartyml = yml.safeLoad(fs.readFileSync(chartFile, 'utf8'));
		assertYmlContent(chartyml.name, applicationName.toLowerCase(), 'chartyml.name');
	});

	it('has kubernetes config for values.yaml', () => {
		let valuesFile = chartLocation + '/values.yaml';
		assert.file(valuesFile);
	});

	it('has kubernetes config for deployment', () => {
		assert.file(chartLocation + '/templates/deployment.yaml');
	});

	it('has kubernetes config for service', () => {
		assert.file(chartLocation + '/templates/service.yaml');
	});

	it('has kubernetes config for HPA', () => {
		assert.file(chartLocation + '/templates/hpa.yaml');
	});
}

function assertYmlContent(actual, expected, label) {
	assert.strictEqual(actual, expected, 'Expected ' + label + ' to be ' + expected + ', found ' + actual);
}

function assertYmlContentExists(actual, label) {
	assert.notStrictEqual(actual, undefined, 'Expected ' + label + ' to be defined it was not');
}

describe('cloud-enablement:kubernetes', () => {

	before(function(){
		this.timeout(5000);
	});

	let languages = ['JAVA', 'SPRING'];
	languages.forEach(language => {
		describe('kubernetes:app with Java-' + language +' project',() => {
			let bluemix = language === 'SPRING' ? JSON.stringify(scaffolderSampleSpring) : JSON.stringify(scaffolderSampleJava);
			beforeEach(() => {
				return helpers.run(path.join(__dirname, '../generators/app'))
					.inDir(path.join(__dirname, './tmp'))
					.withOptions({bluemix: bluemix})
			});

			testOutput();
			it('has deployment.yaml with correct readinessProbe', () => {
				let rawdeploymentyml = fs.readFileSync(chartLocation + '/templates/deployment.yaml', 'utf8');
				let newdeploymentyml = rawdeploymentyml.replace('"+" "_"', '\\"+\\" \\"_\\"');
				let deploymentyml = yml.safeLoad(newdeploymentyml);
				let readinessProbe = deploymentyml.spec.template.spec.containers[0].readinessProbe;
				if(language === 'JAVA') {
					assertYmlContent(readinessProbe.httpGet.path, '/AcmeProject/health', 'readinessProbe.httpGet.path');
					assertYmlContent(readinessProbe.httpGet.port, 9080, 'readinessProbe.httpGet.port');
				}
				if(language === 'SPRING') {
					assertYmlContent(readinessProbe.httpGet.path, '/health', 'readinessProbe.httpGet.path');
					assertYmlContent(readinessProbe.httpGet.port, 8080, 'readinessProbe.httpGet.port');
				}
			});
			it('has deployment.yaml with correct hpa settings', () => {
				let rawdeploymentyml = fs.readFileSync(chartLocation + '/templates/deployment.yaml', 'utf8');
				let newdeploymentyml = rawdeploymentyml.replace('"+" "_"', '\\"+\\" \\"_\\"');
				let deploymentyml = yml.safeLoad(newdeploymentyml);
				let resources = deploymentyml.spec.template.spec.containers[0].resources;
				assertYmlContentExists(resources.requests.cpu, 'resources.requests.cpu');
				assertYmlContentExists(resources.requests.memory, 'resources.requests.memory');
			});
			it('has values.yaml with correct content', () => {
				let valuesyml = yml.safeLoad(fs.readFileSync(chartLocation + '/values.yaml', 'utf8'));
				if(language === 'JAVA') {
					assertYmlContent(valuesyml.service.servicePort, 9080, 'valuesyml.service.servicePort');
					assertYmlContent(valuesyml.service.servicePortHttps, 9443, 'valuesyml.service.servicePortHttps');
				}
				if(language === 'SPRING') {
					assertYmlContent(valuesyml.service.servicePort, 8080, 'valuesyml.service.servicePort');
					assertYmlContent(valuesyml.service.servicePortHttps, undefined, 'valuesyml.service.servicePortHttps');
				}
				assertYmlContent(valuesyml.hpa.enabled, false, 'valuesyml.hpa.enabled');
				assertYmlContent(valuesyml.image.resources.requests.cpu, '200m', 'valuesyml.image.resources.requests.cpu');
			});
			it('has manifests/kube.deploy.yml with correct content', () => {
				assert.file('manifests/kube.deploy.yml');
				let i = 0;
				yml.safeLoadAll(fs.readFileSync('manifests/kube.deploy.yml', 'utf8'), data => {
					switch(i) {
						case 0:
							assertYmlContent(data.metadata.name, applicationName.toLowerCase() + '-service', 'doc0.data.metadata.name');
							if(language === 'JAVA') {
								assertYmlContent(data.spec.ports[0].port, 9080, 'doc0.spec.ports[0].port');
								assertYmlContent(data.spec.ports[1].port, 9443, 'doc0.spec.ports[1].port');
							}
							if(language === 'SPRING') {
								assertYmlContent(data.spec.ports[0].port, 8080, 'doc0.spec.ports[0].port');
							}
							i++;
							break;
						case 1:
							assertYmlContent(data.metadata.name, applicationName.toLowerCase() + '-deployment', 'doc1.metadata.name');
							if(language === 'JAVA') {
								assertYmlContent(data.spec.template.spec.containers[0].readinessProbe.httpGet.path, '/' + applicationName + '/health', 'doc1.spec.template.spec.containers[0].readinessProbe.httpGet.path');
							}
							if(language === 'SPRING') {
								assertYmlContent(data.spec.template.spec.containers[0].readinessProbe.httpGet.path, '/health', 'doc1.data.spec.template.spec.containers[0].readinessProbe.httpGet.path');
							}
							i++;
							break;
						default:
							assert.fail(i, 'i < 2', 'Yaml file contains more documents than expected');
					}
				});
				assert.strictEqual(i, 2, 'Expected to find exactly 2 documents, instead found ' + i);
			});
			if(language === 'JAVA') {
				it('has Jenkinsfile with correct content', () => {
					assert.fileContent('Jenkinsfile', 'image = \''+ applicationName.toLowerCase() + '\'');
				});
			}
			if(language === 'SPRING') {
				it('does not have a Jenkinsfile', () => {
					assert.noFile('Jenkinsfile');
				});
			}
		});
	});

	describe('kubernetes:app with Java project and custom health endpoint', () => {
		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleSpring), healthEndpoint: 'customHealth'})
		});

		it('has deployment.yml with correct readinessProbe health endpoint', () => {
			let rawdeploymentyml = fs.readFileSync(chartLocation + '/templates/deployment.yaml', 'utf8');
			let newdeploymentyml = rawdeploymentyml.replace('"+" "_"', '\\"+\\" \\"_\\"');
			let deploymentyml = yml.safeLoad(newdeploymentyml);
			let readinessProbe = deploymentyml.spec.template.spec.containers[0].readinessProbe;
			assertYmlContent(readinessProbe.httpGet.path, '/customHealth', 'readinessProbe.httpGet.path');
		});

		it('has manifests/kube.deploy.yml with correct content', () => {
			assert.file('manifests/kube.deploy.yml');
			let i = 0;
			yml.safeLoadAll(fs.readFileSync('manifests/kube.deploy.yml', 'utf8'), data => {
				switch(i) {
					case 0:
						i++;
						break;
					case 1:
						assertYmlContent(data.spec.template.spec.containers[0].readinessProbe.httpGet.path, '/customHealth', 'doc1.data.spec.template.spec.containers[0].readinessProbe.httpGet.path');
						i++;
						break;
					default:
						assert.fail(i, 'i < 2', 'Yaml file contains more documents than expected');
				}
			});
			assert.strictEqual(i, 2, 'Expected to find exactly 2 documents, instead found ' + i);
		});
	});

	describe('kubernetes:app with Java-liberty project and NO platforms specified', () => {

		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleJava), platforms: []})
		});

		it('should not have kubernetes files', () => {
			assert.noFile(chartLocation + '/templates/service.yaml');
			assert.noFile(chartLocation + '/templates/deployment.yaml');
			assert.noFile(chartLocation + '/templates/hpa.yaml');
			assert.noFile(chartLocation + '/templates/mongo.deploy.yaml');
			assert.noFile(chartLocation + '/values.yaml');
			assert.noFile(chartLocation + '/Chart.yaml');
			assert.noFile('Jenkinsfile');
			assert.noFile('manifests/kube.deploy.yml');
			
		});
	});

	describe('kubernetes:app with Java-liberty project and mongo and platforms specified including kube', () => {

		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleJava), platforms: ['kube'], storages: ['mongo']})
		});

		it('should not have kubernetes files', () => {
			assert.file(chartLocation + '/templates/service.yaml');
			assert.file(chartLocation + '/templates/deployment.yaml');
			assert.file(chartLocation + '/templates/hpa.yaml');
			assert.file(chartLocation + '/templates/mongo.deploy.yaml');
			assert.file(chartLocation + '/values.yaml');
			assert.file(chartLocation + '/Chart.yaml');
			assert.file('Jenkinsfile');
			assert.file('manifests/kube.deploy.yml');
			
		});
	});

	describe('kubernetes:app with Java project and mongo deployment', () => {

		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleJava), storages: ['mongo']})
		});

		it('should have mongo.deploy.yaml', () => {
			assert.file(chartLocation + '/templates/mongo.deploy.yaml');
		});

		it('should have deployment.yaml', () => {
			assert.file(chartLocation + '/templates/deployment.yaml');
		});

		it('should have env variables for mongo in deployment ', () => {
			assert.fileContent(chartLocation + '/templates/deployment.yaml', deploymentMongoJavaSample);
			assert.fileContent(chartLocation + '/values.yaml', valuesMongoJavaSample);
		});
	});

	describe('kubernetes:app with Java project and  unsupported deployment', () => {
		const WRONG_DEPLOY = 'NOTAVALIDSTORAGE';

		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleJava), storages: ['mongo']})
		});

		it('should not have ' + WRONG_DEPLOY + '.deploy.yaml', () => {
			assert.noFile(chartLocation + '/' + WRONG_DEPLOY + '.deploy.yaml');
		});

	});

	describe('kubernetes:app with Java project and mongo deployment with opts as a string', () => {
		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleJava), storages: "[\"mongo\"]"})
		});

		it('should have mongo.deploy.yaml', () => {
			assert.file(chartLocation + '/templates/mongo.deploy.yaml');
		});

		it('should have env variables for mongo in deployment and values', () => {
			assert.fileContent(chartLocation + '/templates/deployment.yaml', deploymentMongoJavaSample);
			assert.fileContent(chartLocation + '/values.yaml', valuesMongoJavaSample);
		});

	});

	describe('kubernetes:app with Node project', () => {
		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleNode)});
		});

		testOutput();
	});

	describe('kubernetes:app with Node project and mongo deployment', () => {

		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleNode), storages: ['mongo']})
		});

		it('should have mongo.deploy.yaml', () => {
			assert.file(chartLocation + '/templates/mongo.deploy.yaml');
		});

		it('should have deployment.yaml', () => {
			assert.file(chartLocation + '/templates/deployment.yaml');
		});

		it('should have env variables for mongo in deployment ', () => {
			assert.fileContent(chartLocation + '/templates/deployment.yaml', deploymentMongoSample)
		});
	});

	describe('kubernetes:app with Node project and  unsupported deployment', () => {
		const WRONG_DEPLOY = 'NOTAVALIDSTORAGE';

		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleNode), storages: ['mongo']})
		});

		it('should not have ' + WRONG_DEPLOY + '.deploy.yaml', () => {
			assert.noFile(chartLocation + '/' + WRONG_DEPLOY + '.deploy.yaml');
		});

	});

	describe('kubernetes:app with Node project and mongo deployment with opts as a string', () => {

		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleNode), storages: "[\"mongo\"]"})
		});

		it('should have mongo.deploy.yaml', () => {
			assert.file(chartLocation + '/templates/mongo.deploy.yaml');
		});

		it('should have env variables for mongo in deployment and values', () => {
			assert.fileContent(chartLocation + '/templates/deployment.yaml', deploymentMongoSample)
			assert.fileContent(chartLocation + '/values.yaml', valuesMongoSample);
		});

	});

	describe('kubernetes:app with Swift project', () => {
		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleSwift)})
		});

		testOutput();
	});

	describe('kubernetes:app with Swift project and mongo deployment', () => {

		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleSwift), storages: ['mongo']})
		});

		it('should have mongo.deploy.yaml', () => {
			assert.file(chartLocation+ '/templates/mongo.deploy.yaml');
		});

		it('should have deployment.yaml', () => {
			assert.file(chartLocation + '/templates/deployment.yaml');
		});

		it('should have env variables for mongo in deployment ', () => {
			assert.fileContent(chartLocation + '/templates/deployment.yaml', deploymentMongoSample);
			assert.fileContent(chartLocation + '/values.yaml', valuesMongoSwiftPythonSample);
		});
	});

	describe('kubernetes:app with Swift project and  unsupported deployment', () => {
		const WRONG_DEPLOY = 'NOTAVALIDSTORAGE';

		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleSwift), storages: ['mongo']})
		});

		it('should not have ' + WRONG_DEPLOY + '.deploy.yaml', () => {
			assert.noFile(chartLocation + '/' + WRONG_DEPLOY + '.deploy.yaml');
		});

	});

	describe('kubernetes:app with Swift project and mongo deployment with opts as a string', () => {

		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleSwift), storages: "[\"mongo\"]"})
		});

		it('should have mongo.deploy.yaml', () => {
			assert.file(chartLocation + '/templates/mongo.deploy.yaml');
		});

		it('should have env variables for mongo in deployment and values', () => {
			assert.fileContent(chartLocation + '/templates/deployment.yaml', deploymentMongoSample);
			assert.fileContent(chartLocation + '/values.yaml', valuesMongoSwiftPythonSample);
		});

	});


	describe('kubernetes:app with Python project', () => {
		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSamplePython)})
		});

		testOutput();
	});

	describe('kubernetes:app with Python project and mongo deployment', () => {

		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSamplePython), storages: ['mongo']})
		});

		it('should have mongo.deploy.yaml', () => {
			assert.file(chartLocation + '/templates/mongo.deploy.yaml');
		});

		it('should have deployment.yaml', () => {
			assert.file(chartLocation + '/templates/deployment.yaml');
		});

		it('should have env variables for mongo in deployment ', () => {
			assert.fileContent(chartLocation + '/templates/deployment.yaml', deploymentMongoSample);
			assert.fileContent(chartLocation + '/values.yaml', valuesMongoSwiftPythonSample);
		});
	});

	describe('kubernetes:app with Python project and  unsupported deployment', () => {
		const WRONG_DEPLOY = 'NOTAVALIDSTORAGE';

		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSamplePython), storages: ['mongo']})
		});

		it('should not have ' + WRONG_DEPLOY + '.deploy.yaml', () => {
			assert.noFile(chartLocation + '/' + WRONG_DEPLOY + '.deploy.yaml');
		});

	});

	describe('kubernetes:app with Python project and mongo deployment with opts as a string', () => {

		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSamplePython), storages: "[\"mongo\"]"})
		});

		it('should have mongo.deploy.yaml', () => {
			assert.file(chartLocation + '/templates/mongo.deploy.yaml');
		});

		it('should have env variables for mongo in deployment and values', () => {
			assert.fileContent(chartLocation + '/templates/deployment.yaml', deploymentMongoSample);
			assert.fileContent(chartLocation + '/values.yaml', valuesMongoSwiftPythonSample);
		});

	});

	describe('kubernetes:app with Node with NO server', () => {
		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleNodeNoServer)});
		});

		testOutput();
	});
	describe('cloud-enablement:kubernetes with empty bluemix object', () => {
		beforeEach(() => {
			return helpers.run(path.join(__dirname, '../generators/kubernetes'))
				.withOptions({ bluemix: JSON.stringify(
					{ backendPlatform: "NODE", server: { namespace: 'some-test-namespace' } }
				), port: '9876' })
		});
		it('should give us the default output with no project name', () => {
			assert.file('chart/app');
		});

		it('should use a custom port if set', () => {
			assert.fileContent('chart/app/values.yaml', 'servicePort: 9876');
		});

		it('should use a custom namespace if set', () => {
			assert.fileContent('chart/app/values.yaml', 'some-test-namespace');
		});
	});
});
