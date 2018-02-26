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

const scaffolderSample = require('./samples/scaffolder-sample');

const pipelineKubeSample = fs.readFileSync(path.join(__dirname, 'samples/pipeline-kube.yml'), 'utf-8');
const pipelineKubeSampleSwift = fs.readFileSync(path.join(__dirname, 'samples/pipeline-kube-swift.yml'), 'utf-8');
const pipelineKubeSampleJava = fs.readFileSync(path.join(__dirname, 'samples/pipeline-kube-java.yml'), 'utf-8');
const toolchainKubeSample = fs.readFileSync(path.join(__dirname, 'samples/toolchain-kube.yml'), 'utf-8');

const pipelineCFSample = fs.readFileSync(path.join(__dirname, 'samples/pipeline-cf.yml'), 'utf-8');
const pipelineCFSampleJava = fs.readFileSync(path.join(__dirname, 'samples/pipeline-cf-java.yml'), 'utf-8');
const pipelineCFSampleSpring = fs.readFileSync(path.join(__dirname, 'samples/pipeline-cf-spring.yml'), 'utf-8');
const pipelineCFSampleSwift = fs.readFileSync(path.join(__dirname, 'samples/pipeline-cf-swift.yml'), 'utf-8');
const toolchainCFSample = fs.readFileSync(path.join(__dirname, 'samples/toolchain-cf.yml'), 'utf-8');
const deployCFSample = fs.readFileSync(path.join(__dirname, 'samples/deploy-cf.json'), 'utf-8');

const applicationName = 'AcmeProject'; // from sample json files
const chartLocation = 'chart/' + applicationName.toLowerCase();

describe('cloud-enablement:deployment', function () {
	this.timeout(5000);

	let languages = ['NODE', 'JAVA', 'SPRING', 'SWIFT'];

	languages.forEach(lang => {
		let cfOptions = {
			bluemix: JSON.stringify(scaffolderSample.getJsonServerWithDeployment(lang, 'CF'))
		};
		if(lang === 'JAVA' || lang === 'SPRING') {
			cfOptions.artifactId = 'testArtifact-id';
			cfOptions.version = '0.0.1-SNAPSHOT';
		}

		describe(`cloud-enablement:deployment CF for language ${lang}`, function () {
			beforeEach(function () {
				return helpers.run(path.join(__dirname, '../generators/app'))
					.inDir(path.join(__dirname, './tmp'))
					.withOptions(cfOptions);
			});

			it('has all files', function () {
				assert.file('.bluemix/toolchain.yml');
				assert.file('.bluemix/pipeline.yml');
				assert.file('.bluemix/deploy.json');
				assert.file('.bluemix/scripts/container_build.sh');
				assert.file('.bluemix/scripts/kube_deploy.sh');
			});

			it('has toolchain.yml with correct content', function () {
				assert.fileContent('.bluemix/toolchain.yml', toolchainCFSample);
			});

			it('has pipeline.yml with correct content', function () {
				if (lang === 'JAVA') {
					assert.fileContent('.bluemix/pipeline.yml', pipelineCFSampleJava);
				} else if (lang === 'SPRING') {
					assert.fileContent('.bluemix/pipeline.yml', pipelineCFSampleSpring);
				} else if (lang === 'SWIFT') {
					assert.fileContent('.bluemix/pipeline.yml', pipelineCFSampleSwift);
				} else {
					assert.fileContent('.bluemix/pipeline.yml', pipelineCFSample);
				}
			});

			it('has deploy.json with correct content', function () {
				let deployJson = JSON.parse(fs.readFileSync('.bluemix/deploy.json', 'utf8'));
				assert.deepEqual(deployJson, JSON.parse(deployCFSample));
			});
		});
	});

	languages.forEach(lang => {
		let kubeOptions = {
			bluemix: JSON.stringify(scaffolderSample.getJsonServerWithDeployment(lang, 'Kube'))
		};

		describe(`cloud-enablement:deployment Kube for language ${lang}`, function () {
			beforeEach(function () {
				return helpers.run(path.join(__dirname, '../generators/app'))
					.inDir(path.join(__dirname, './tmp'))
					.withOptions(kubeOptions);
			});

			it('has all files', function () {
				assert.file('.bluemix/toolchain.yml');
				assert.file('.bluemix/pipeline.yml');
				assert.file('.bluemix/deploy.json');
				assert.file('.bluemix/scripts/container_build.sh');
				assert.file('.bluemix/scripts/kube_deploy.sh');
			});

			it('has toolchain.yml with correct content', function () {
				assert.fileContent('.bluemix/toolchain.yml', toolchainKubeSample);
			});

			it('has pipeline.yml with correct content', function () {
				if (lang === 'JAVA' || lang === 'SPRING') {
					assert.fileContent('.bluemix/pipeline.yml', pipelineKubeSampleJava);
				} else if (lang === 'SWIFT') {
					assert.fileContent('.bluemix/pipeline.yml', pipelineKubeSampleSwift);
				} else {
					assert.fileContent('.bluemix/pipeline.yml', pipelineKubeSample);
				}
			});

			it('has deploy.json with correct content', function () {
				let deployJson = JSON.parse(fs.readFileSync('.bluemix/deploy.json', 'utf8'));

				let properties = deployJson.properties;
				assert(properties['api-key']);
				assert(properties['image-registry-token']);
				assert(properties['kube-cluster-name']);

				assert(deployJson.required);
				assert(deployJson.required.includes('api-key'));
				assert(deployJson.required.includes('image-registry-token'));
				assert(deployJson.required.includes('kube-cluster-name'));

				let form = deployJson.form;
				let formApiKey = form.find(function (val) {
					return val.key === 'api-key';
				});
				assert(formApiKey);

				let formRegistryToken = form.find(function (val) {
					return val.key === 'image-registry-token';
				});
				assert(formRegistryToken);

				let clusterName = form.find(function (val) {
					return val.key === 'kube-cluster-name';
				});
				assert(clusterName);
			});

			it('replaces Kube cluster name in hpa.yaml', function () {
				let chartFile = chartLocation + '/templates/hpa.yaml';
				assert.fileContent(chartFile, 'namespace: my_kube_namespace');
			});
		});
	});
});
