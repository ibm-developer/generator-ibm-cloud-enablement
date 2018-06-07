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
const exec = require('child_process').exec;

const scaffolderSample = require('./samples/scaffolder-sample');
const scaffolderSampleNode = scaffolderSample.getJson('NODE');
const scaffolderSampleNodeNoServer = scaffolderSample.getJsonNoServer('NODE');
const scaffolderSampleSwift = scaffolderSample.getJson('SWIFT');
const scaffolderSampleJava = scaffolderSample.getJson('JAVA');
const scaffolderSampleSpring = scaffolderSample.getJson('SPRING');
const scaffolderSamplePython = scaffolderSample.getJson('PYTHON');

const applicationName = 'AcmeProject'; // from sample json files
const chartLocation = 'chart/' + applicationName.toLowerCase();

function testOutput() {

	it('has kubernetes config for Chart.yaml', function () {
		let chartFile = chartLocation + '/Chart.yaml';
		assert.file(chartFile);
		let chartyml = yml.safeLoad(fs.readFileSync(chartFile, 'utf8'));
		assertYmlContent(chartyml.name, applicationName.toLowerCase(), 'chartyml.name');
	});

	it('has kubernetes config for values.yaml', function () {
		let valuesFile = chartLocation + '/values.yaml';
		assert.file(valuesFile);
	});

	it('has kubernetes config for bindings.yaml', function () {
		let valuesFile = chartLocation + '/bindings.yaml';
		assert.file(valuesFile);
	});

	it('has kubernetes config for deployment', function () {
		assert.file(chartLocation + '/templates/deployment.yaml');
	});

	it('has kubernetes config for service', function () {
		assert.file(chartLocation + '/templates/service.yaml');
	});

	it('has kubernetes config for HPA', function () {
		assert.file(chartLocation + '/templates/hpa.yaml');
	});
	assertHpaYmlContent();

	it('has kubernetes config for basedeployment', function () {
		assert.file(chartLocation + '/templates/basedeployment.yaml');
	});

	it('has valid helm chart when running helm lint', function (done) {
		exec('helm lint ' + chartLocation + '/', {maxBuffer: 20 * 1024 * 1024}, (error, stdout) => {
			error ? done(new Error(stdout)) : done();
		})
	});

	it('renders a valid chart using helm template', function (done) {
		exec('helm template ' + chartLocation + '/', {maxBuffer: 20 * 1024 * 1024}, (error, stdout) => {
			// Uncomment to view locally rendered helm charts
			// console.log(stdout);
			if ( error ) {
				done(new Error(stdout))
			} else {
				// template command will render two charts: service and Deployment
				let charts = yml.safeLoadAll(stdout);
				assertYmlContent(charts[1].kind, 'Deployment', 'charts[1].kind');
				// bindings (including APM attributes) should have been rendered in-line in deployment.yaml
				assertYmlContent(charts[1].spec.template.spec.containers[0].env[2].name, 'IBM_APM_SERVER_URL',
												'charts[1].spec.template.spec.containers[0].env[2].name');
				done();
			}
		})
	});
}

function assertYmlContent(actual, expected, label) {
	assert.strictEqual(actual, expected, 'Expected ' + label + ' to be ' + expected + ', found ' + actual);
}

function assertYmlContentExists(actual, label) {
	assert.notStrictEqual(actual, undefined, 'Expected ' + label + ' to be defined, it was not');
}

// We rely on running helm lint to ensure the charts are valid.
// Here, we're commenting out the block processing that helm would
// perform so that we can evaluate content as tho it were normal yaml
function getSafeYaml(fileName) {
	const rawyml = fs.readFileSync(fileName, 'utf8');

	const newyml = rawyml.replace('"+" "_"', '\\"+\\" \\"_\\"')
		.replace(/^{{(-? if)/gm, '#$1')
		.replace(/^{{ else/gm,  '# else')
		.replace(/^{{(-? end)/gm, '#$1')
		.replace(/{{.Files/, '#.Files');

	return  yml.safeLoad(newyml);
}

function assertYmlMongoContent() {
	it('should have env variables for mongo in deployment and values', function () {
		const valuesyml = getSafeYaml(chartLocation + '/values.yaml');

		assert.fileContent(chartLocation + '/templates/deployment.yaml', '- name: MONGO_URL\n            value: {{ .Values.services.mongo.url }}');
		assert.fileContent(chartLocation + '/templates/deployment.yaml', '- name: MONGO_DB_NAME\n            value: {{ .Values.services.mongo.name }}');
		assertYmlContentExists(valuesyml.services.mongo, 'services.mongo');
		assertYmlContent(valuesyml.services.mongo.url, 'mongo', 'services.mongo.url');
		assertYmlContent(valuesyml.services.mongo.name, 'comments', 'services.mongo.name');
		assertYmlContent(valuesyml.services.mongo.env, 'production', 'services.mongo.env');

	});
}

function assertHpaYmlContent() {
	it('has templates/hpa.yaml file with correct contents', function () {
		assert.fileContent(chartLocation + '/templates/hpa.yaml', '{{ if .Values.hpa.enabled }}');
		assert.fileContent(chartLocation + '/templates/hpa.yaml', '{{ if and (eq .Capabilities.KubeVersion.Major "1") (ge .Capabilities.KubeVersion.Minor "8") }}');
		assert.fileContent(chartLocation + '/templates/hpa.yaml', 'apiVersion: autoscaling/v2beta1\n{{ else }}\napiVersion: autoscaling/v2alpha1\n{{ end }}');
		assert.fileContent(chartLocation + '/templates/hpa.yaml', 'name: "{{ .Chart.Name }}-hpa-policy"');
		assert.fileContent(chartLocation + '/templates/hpa.yaml', 'minReplicas: {{ .Values.hpa.minReplicas }}');
		assert.fileContent(chartLocation + '/templates/hpa.yaml', 'maxReplicas: {{ .Values.hpa.maxReplicas }}');
		assert.fileContent(chartLocation + '/templates/hpa.yaml', 'targetAverageUtilization: {{ .Values.hpa.metrics.cpu.targetAverageUtilization }}');
		assert.fileContent(chartLocation + '/templates/hpa.yaml', 'targetAverageUtilization: {{ .Values.hpa.metrics.memory.targetAverageUtilization }}');
	});
}

describe('cloud-enablement:kubernetes', function () {
	this.timeout(5000);

	let languages = ['JAVA', 'SPRING', 'NODE'];
	languages.forEach(language => {
		describe('kubernetes:app with Java-' + language + ' project', function () {
			let bluemix = language === 'SPRING' ? JSON.stringify(scaffolderSampleSpring) : language === 'JAVA' ? JSON.stringify(scaffolderSampleJava) : JSON.stringify(scaffolderSampleNode);
			beforeEach(function () {
				return helpers.run(path.join(__dirname, '../generators/app'))
					.inDir(path.join(__dirname, './tmp'))
					.withOptions({bluemix: bluemix});
			});

			testOutput();
			it('has deployment.yaml with correct readinessProbe', function () {
				let deploymentyml = getSafeYaml(chartLocation + '/templates/deployment.yaml');
				let readinessProbe = deploymentyml.spec.template.spec.containers[0].readinessProbe;
				if (language === 'JAVA') {
					assertYmlContent(readinessProbe.httpGet.path, '/AcmeProject/health', 'readinessProbe.httpGet.path');
					assertYmlContent(readinessProbe.httpGet.port, 9080, 'readinessProbe.httpGet.port');
				}
				if (language === 'SPRING') {
					assertYmlContent(readinessProbe.httpGet.path, '/health', 'readinessProbe.httpGet.path');
					assertYmlContent(readinessProbe.httpGet.port, 8080, 'readinessProbe.httpGet.port');
				}
			});

			it('has deployment.yaml with correct hpa settings', () => {
				let deploymentyml = getSafeYaml(chartLocation + '/templates/deployment.yaml');
				let resources = deploymentyml.spec.template.spec.containers[0].resources;
				assertYmlContentExists(resources.requests.cpu, 'resources.requests.cpu');
				assertYmlContentExists(resources.requests.memory, 'resources.requests.memory');
			});

			it('has deployment.yaml with correct env settings for APM', () => {
				let deploymentyml = getSafeYaml(chartLocation + '/templates/deployment.yaml');
				let spec = deploymentyml.spec.template.spec;
				assertYmlContent(spec.containers[0].env[1].name, 'APPLICATION_NAME', 'spec.containers[0].env[1].name');

				let bindingsyml = getSafeYaml(chartLocation + '/bindings.yaml');
				assertYmlContent(bindingsyml[0].name, 'IBM_APM_SERVER_URL', 'bindingsyml[0].name');
				assertYmlContent(bindingsyml[1].name, 'IBM_APM_KEYFILE', 'bindingsyml[1].name');
				assertYmlContent(bindingsyml[2].name, 'IBM_APM_KEYFILE_PASSWORD', 'bindingsyml[2].name');
				assertYmlContent(bindingsyml[3].name, 'IBM_APM_INGRESS_URL', 'bindingsyml[3].name');
				assertYmlContent(bindingsyml[4].name, 'IBM_APM_ACCESS_TOKEN', 'bindingsyml[4].name');
			});

			it('has service.yaml with correct content', function () {
				let serviceyml = getSafeYaml(chartLocation + '/templates/service.yaml');
				if (language === 'JAVA') {
					assertYmlContent(serviceyml.spec.ports[0].name, 'http', 'serviceyml.spec.ports[0].name');
					assertYmlContent(serviceyml.spec.ports[1].name, 'https', 'serviceyml.spec.ports[1].name');
				}
				if (language === 'SPRING') {
					assertYmlContent(serviceyml.spec.ports[0].name, 'http', 'serviceyml.spec.ports[0].name');
					assertYmlContent(serviceyml.spec.ports[1], undefined, 'serviceyml.spec.ports[1]');
				}
				if (language === 'NODE') {
					assertYmlContent(serviceyml.spec.ports[0].name, 'http', 'serviceyml.spec.ports[0].name');
				}
			});

			it('has values.yaml with correct content', function () {
				let valuesyml = getSafeYaml(chartLocation + '/values.yaml');
				if (language === 'JAVA') {
					assertYmlContent(valuesyml.service.servicePort, 9080, 'valuesyml.service.servicePort');
					assertYmlContent(valuesyml.service.servicePortHttps, 9443, 'valuesyml.service.servicePortHttps');
				}
				if (language === 'SPRING') {
					assertYmlContent(valuesyml.service.servicePort, 8080, 'valuesyml.service.servicePort');
					assertYmlContent(valuesyml.service.servicePortHttps, undefined, 'valuesyml.service.servicePortHttps');
				}
				assertYmlContent(valuesyml.hpa.enabled, false, 'valuesyml.hpa.enabled');
				assertYmlContent(valuesyml.base.enabled, false, 'valuesyml.base.enabled');
				assertYmlContent(valuesyml.image.resources.requests.cpu, '200m', 'valuesyml.image.resources.requests.cpu');
			});

			it('has basedeployment.yaml with correct content', function () {
				let basedeploymentyml = getSafeYaml(chartLocation + '/templates/basedeployment.yaml');

				assert.fileContent(chartLocation + '/templates/basedeployment.yaml', 'replicas: {{ .Values.base.replicaCount }}');

				assertYmlContent(basedeploymentyml.metadata.name, '{{  .Chart.Name }}-basedeployment', 'basedeploymentyml.metadata.name');
				assertYmlContent(basedeploymentyml.spec.template.spec.containers[0].image, '{{ .Values.image.repository }}:{{ .Values.base.image.tag }}',
					'basedeploymentyml.spec.template.spec.containers.image');
				assertYmlContent(basedeploymentyml.spec.template.metadata.labels.version, 'base', 'basedeploymentyml.spec.template.metadata.labels.version');
			});

			it('has manifests/kube.deploy.yml with correct content', function () {
				if (language === 'JAVA' || language === 'SPRING') {
					assert.file('manifests/kube.deploy.yml');
					let i = 0;
					yml.safeLoadAll(fs.readFileSync('manifests/kube.deploy.yml', 'utf8'), data => {
						switch (i) {
							case 0:
								assertYmlContent(data.metadata.name, applicationName.toLowerCase() + '-service', 'doc0.data.metadata.name');
								if (language === 'JAVA') {
									assertYmlContent(data.spec.ports[0].port, 9080, 'doc0.spec.ports[0].port');
									assertYmlContent(data.spec.ports[1].port, 9443, 'doc0.spec.ports[1].port');
								}
								if (language === 'SPRING') {
									assertYmlContent(data.spec.ports[0].port, 8080, 'doc0.spec.ports[0].port');
								}
								i++;
								break;
							case 1:
								assertYmlContent(data.metadata.name, applicationName.toLowerCase() + '-deployment', 'doc1.metadata.name');
								if (language === 'JAVA') {
									assertYmlContent(data.spec.template.spec.containers[0].readinessProbe.httpGet.path, '/' + applicationName + '/health', 'doc1.spec.template.spec.containers[0].readinessProbe.httpGet.path');
								}
								if (language === 'SPRING') {
									assertYmlContent(data.spec.template.spec.containers[0].readinessProbe.httpGet.path, '/health', 'doc1.data.spec.template.spec.containers[0].readinessProbe.httpGet.path');
								}
								i++;
								break;
							default:
								assert.fail(i, 'i < 2', 'Yaml file contains more documents than expected');
						}
					});
					assert.strictEqual(i, 2, 'Expected to find exactly 2 documents, instead found ' + i);
				}
			});
			if (language === 'JAVA' || language === 'NODE' || language == 'SPRING') {
				it('Java, Node and Spring have Jenkinsfile with correct content', function () {
					assert.fileContent('Jenkinsfile', 'image = \'' + applicationName.toLowerCase() + '\'');
				});
			}
		});
	});

	describe('kubernetes:app with Java project and custom health endpoint', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleSpring), healthEndpoint: 'customHealth'})
		});
		it('has manifests/kube.deploy.yml with correct content', function () {
			assert.file('manifests/kube.deploy.yml');
			let i = 0;
			yml.safeLoadAll(fs.readFileSync('manifests/kube.deploy.yml', 'utf8'), data => {
				switch (i) {
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

	describe('kubernetes:app with Java-liberty project and NO platforms specified', function () {

		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleJava), platforms: []})
		});

		it('should not have kubernetes files', function () {
			assert.noFile(chartLocation + '/templates/service.yaml');
			assert.noFile(chartLocation + '/templates/deployment.yaml');
			assert.noFile(chartLocation + '/templates/hpa.yaml');
			assert.noFile(chartLocation + '/templates/mongodb.deploy.yaml');
			assert.noFile(chartLocation + '/templates/istio.yaml');
			assert.noFile(chartLocation + '/values.yaml');
			assert.noFile(chartLocation + '/Chart.yaml');
			assert.noFile('Jenkinsfile');
			assert.noFile('manifests/kube.deploy.yml');

		});
	});

	describe('kubernetes:app with Java-liberty project and mongo and platforms specified including kube', function () {

		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleJava), platforms: ['kube'], services: JSON.stringify(['mongodb'])})
		});

		it('should not have kubernetes files', function () {
			assert.file(chartLocation + '/templates/service.yaml');
			assert.file(chartLocation + '/templates/deployment.yaml');
			assert.file(chartLocation + '/templates/hpa.yaml');
			assert.file(chartLocation + '/templates/mongodb.deploy.yaml');
			assert.file(chartLocation + '/templates/istio.yaml');
			assert.file(chartLocation + '/bindings.yaml');
			assert.file(chartLocation + '/values.yaml');
			assert.file(chartLocation + '/Chart.yaml');
			assert.file('Jenkinsfile');
			assert.file('manifests/kube.deploy.yml');

		});
	});

	describe('kubernetes:app with Java project and mongo deployment', function () {

		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleJava), services: JSON.stringify(['mongodb'])})
		});

		it('should have mongodb.deploy.yaml', function () {
			assert.file(chartLocation + '/templates/mongodb.deploy.yaml');
		});

		it('should have deployment.yaml', function () {
			assert.file(chartLocation + '/templates/deployment.yaml');
		});

		assertYmlMongoContent();
	});

	describe('kubernetes:app with Java project and  unsupported deployment', function () {
		const WRONG_DEPLOY = 'NOTAVALIDSTORAGE';

		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleJava), services: JSON.stringify(['mongodb'])})
		});

		it('should not have ' + WRONG_DEPLOY + '.deploy.yaml', function () {
			assert.noFile(chartLocation + '/' + WRONG_DEPLOY + '.deploy.yaml');
		});

	});

	describe('kubernetes:app with Java project and mongo deployment with opts as a string', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleJava), services: JSON.stringify(['mongodb'])})
		});

		it('should have mongodb.deploy.yaml', function () {
			assert.file(chartLocation + '/templates/mongodb.deploy.yaml');
		});

		assertYmlMongoContent();

	});

	describe('kubernetes:app with Node project', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleNode)});
		});

		testOutput();
	});

	describe('kubernetes:app with Node project and mongo deployment', function () {

		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleNode), services: JSON.stringify(['mongodb'])})
		});

		it('should have mongodb.deploy.yaml', function () {
			assert.file(chartLocation + '/templates/mongodb.deploy.yaml');
		});

		it('should have deployment.yaml', function () {
			assert.file(chartLocation + '/templates/deployment.yaml');
		});

		assertYmlMongoContent();
	});

	describe('kubernetes:app with Node project and  unsupported deployment', function () {
		const WRONG_DEPLOY = 'NOTAVALIDSTORAGE';

		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleNode), services: JSON.stringify(['mongodb'])})
		});

		it('should not have ' + WRONG_DEPLOY + '.deploy.yaml', function () {
			assert.noFile(chartLocation + '/' + WRONG_DEPLOY + '.deploy.yaml');
		});

	});

	describe('kubernetes:app with Node project and mongo deployment with opts as a string', function () {

		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleNode), services: JSON.stringify(['mongodb'])})
		});

		it('should have mongodb.deploy.yaml', function () {
			assert.file(chartLocation + '/templates/mongodb.deploy.yaml');
		});

		assertYmlMongoContent();
	});

	describe('kubernetes:app with Swift project', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleSwift)})
		});

		testOutput();
	});

	describe('kubernetes:app with Swift project and mongo deployment', function () {

		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleSwift), services: JSON.stringify(['mongodb'])})
		});

		it('should have mongodb.deploy.yaml', function () {
			assert.file(chartLocation + '/templates/mongodb.deploy.yaml');
		});

		it('should have deployment.yaml', function () {
			assert.file(chartLocation + '/templates/deployment.yaml');
		});

		assertYmlMongoContent();
	});

	describe('kubernetes:app with Swift project and  unsupported deployment', function () {
		const WRONG_DEPLOY = 'NOTAVALIDSTORAGE';

		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleSwift), services: JSON.stringify(['mongodb'])})
		});

		it('should not have ' + WRONG_DEPLOY + '.deploy.yaml', function () {
			assert.noFile(chartLocation + '/' + WRONG_DEPLOY + '.deploy.yaml');
		});

	});

	describe('kubernetes:app with Swift project and mongo deployment with opts as a string', function () {

		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleSwift), services: JSON.stringify(['mongodb'])})
		});

		it('should have mongodb.deploy.yaml', function () {
			assert.file(chartLocation + '/templates/mongodb.deploy.yaml');
		});

		assertYmlMongoContent();

	});

	describe('kubernetes:app with Python project and mongo deployment', function () {

		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSamplePython), services: JSON.stringify(['mongodb'])})
		});

		it('should have mongodb.deploy.yaml', function () {
			assert.file(chartLocation + '/templates/mongodb.deploy.yaml');
		});

		it('should have deployment.yaml', function () {
			assert.file(chartLocation + '/templates/deployment.yaml');
		});

		assertYmlMongoContent();
	});

	describe('kubernetes:app with Python project and  unsupported deployment', function () {
		const WRONG_DEPLOY = 'NOTAVALIDSTORAGE';

		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSamplePython), services: JSON.stringify(['mongodb'])})
		});

		it('should not have ' + WRONG_DEPLOY + '.deploy.yaml', function () {
			assert.noFile(chartLocation + '/' + WRONG_DEPLOY + '.deploy.yaml');
		});

	});

	describe('kubernetes:app with Python project and mongo deployment with opts as a string', function () {

		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSamplePython), services: JSON.stringify(['mongodb'])})
		});

		it('should have mongodb.deploy.yaml', function () {
			assert.file(chartLocation + '/templates/mongodb.deploy.yaml');
		});

		assertYmlMongoContent();

	});

	describe('kubernetes:app with Node with NO server', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleNodeNoServer)});
		});

		testOutput();
	});
	describe('cloud-enablement:kubernetes with empty bluemix object', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/kubernetes'))
				.withOptions({
					bluemix: JSON.stringify(
						{
							backendPlatform: "NODE",
							server: {cloudDeploymentOptions: {imageRegistryNamespace: 'some-test-namespace'}}
						}
					), port: '9876'
				})
		});
		it('should give us the default output with no project name', function () {
			assert.file('chart/app');
		});

		it('should use a custom port if set', function () {
			assert.fileContent('chart/app/values.yaml', 'servicePort: 9876');
		});

		it('should use a custom namespace if set', function () {
			assert.fileContent('chart/app/values.yaml', 'some-test-namespace');
		});
	});
});
