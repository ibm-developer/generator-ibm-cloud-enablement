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
const scaffolderSampleDeploymentKube = scaffolderSample.getJsonServerWithDeployment('NODE', 'Kube');

const applicationName = 'AcmeProject'; // from sample json files
const chartLocation = 'chart/' + applicationName.toLowerCase();

describe('cloud-enablement:deployment', function () {
	this.timeout(5000);

	describe('cloud-enablement:deployment Kube', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleDeploymentKube)});
		});

		it('has all files', function () {
			assert.file('.bluemix/toolchain.yml');
			assert.file('.bluemix/pipeline.yml');
			assert.file('.bluemix/deploy.json');
		});

		it('has toolchain.yml with correct content', function () {
			assert.fileContent('.bluemix/toolchain.yml', 'repo_url: "{{#zip_url}}{{zip_url}}{{/zip_url}}{{^zip_url}}{{repository}}{{/zip_url}}"');
			assert.fileContent('.bluemix/toolchain.yml', 'KUBE_CLUSTER_NAME: "{{deploy.parameters.kube-cluster-name}}"');
			assert.fileContent('.bluemix/toolchain.yml', 'API_KEY: "{{deploy.parameters.api-key}}"');
			assert.fileContent('.bluemix/toolchain.yml', 'kube-cluster-name: my_kube_cluster');
			assert.fileContent('.bluemix/toolchain.yml', 'api-key: "{{api-key}}"');
		});

		it('has toolchain.yml with correct structure', function () {
			let toolchainyml = yml.safeLoad(fs.readFileSync('.bluemix/toolchain.yml', 'utf8'));
			assert.ok(toolchainyml.build.parameters.configuration.env.KUBE_CLUSTER_NAME);
			assert.ok(toolchainyml.build.parameters.configuration.env.API_KEY);
			assert.ok(toolchainyml.deploy.parameters['kube-cluster-name']);
			assert.ok(toolchainyml.deploy.parameters['api-key']);
		});

		it('has pipeline.yml with correct content', function () {
			let pipeline = yml.safeLoad(fs.readFileSync('.bluemix/pipeline.yml', 'utf8'));
			let containerBuildJob = pipeline.stages[0].jobs[1];
			assert.equal(containerBuildJob.name, 'Container Build');
			assert.equal(containerBuildJob.extension_id, 'ibm.devops.services.pipeline.container.builder');
			assert.equal(containerBuildJob.IMAGE_NAME, 'myapplication');

			let containerBuildScript = fs.readFileSync(__dirname + '/samples/container-build-script.txt', 'utf8');
			assert.equal(containerBuildJob.COMMAND, containerBuildScript);

			// let containerBuildScript = fs.readFileSync(__dirname + '/samples/container-build-script.txt', 'utf8');
			let deployStage = pipeline.stages[1];
			let input = deployStage.inputs[0];
			assert.equal(input.type, 'job');
			assert.equal(input.stage, 'Build Stage');
			assert.equal(input.job, 'Container Build');

			let deployJob = deployStage.jobs[0];
			assert.equal(deployJob.target.api_key, '${API_KEY}');
			assert.equal(deployJob.target.kubernetes_cluster, '${KUBE_CLUSTER_NAME}');

			let deployScript = fs.readFileSync(__dirname + '/samples/kube-deploy-script.txt', 'utf8');
			assert.equal(deployJob.script, deployScript);
		});

		it('has deploy.json with correct content', function () {
			let deployJson = JSON.parse(fs.readFileSync('.bluemix/deploy.json', 'utf8'));

			let properties = deployJson.properties;
			assert(properties['api-key']);
			assert(properties['kube-cluster-name']);

			assert(deployJson.required);
			assert(deployJson.required.includes('api-key'));
			assert(deployJson.required.includes('kube-cluster-name'));

			let form = deployJson.form;
			let formApiKey = form.find(function (val) {
				return val.key === 'api-key';
			});
			assert(formApiKey);

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