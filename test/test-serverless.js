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
const fs = require('fs');
const path = require('path');

const scaffolderSample = require('./samples/scaffolder-sample');
const scaffolderSampleNode = scaffolderSample.getJsonServerless('NODE');
const scaffolderSamplePython = scaffolderSample.getJsonServerless('PYTHON');
const scaffolderSampleSwift = scaffolderSample.getJsonServerless('SWIFT');

const deploySample = fs.readFileSync(path.join(__dirname, 'samples/serverless-deploy.json'), 'utf-8');
const pipelineSample = fs.readFileSync(path.join(__dirname, 'samples/serverless-pipeline.yml'), 'utf-8');
const pipelineDeploySample = fs.readFileSync(path.join(__dirname, 'samples/serverless-pipeline-DEPLOY.sh'), 'utf-8');
const toolchainSample = fs.readFileSync(path.join(__dirname, 'samples/serverless-toolchain.yml'), 'utf-8');

describe('cloud-enablement:serverless', function () {
	
	describe('cloud-enablement:serverless PYTHON', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSamplePython)});
		});

		it('has all .bluemix files', function () {
			assert.file('.bluemix/deploy.json');
			assert.file('.bluemix/pipeline-DEPLOY.sh');
			assert.file('.bluemix/pipeline.yml');
			assert.file('.bluemix/toolchain.yml');
		});

		it('.bluemix files have correct contents', function () {
			let deployGenerated = fs.readFileSync('.bluemix/deploy.json', 'utf8');
			let pipelineGenerated = fs.readFileSync('.bluemix/pipeline.yml', 'utf8');
			let pipelineDeployGenerated = fs.readFileSync('.bluemix/pipeline-DEPLOY.sh', 'utf8');
			let toolchainGenerated = fs.readFileSync('.bluemix/toolchain.yml', 'utf8');

			assert.equal(deployGenerated, deploySample);
			assert.equal(pipelineGenerated, pipelineSample);
			assert.equal(pipelineDeployGenerated, pipelineDeploySample);
			assert.equal(toolchainGenerated, toolchainSample);
		});

		it('does not have docker files', function () {
			assert.noFile([
				'Dockerfile',
				'Dockerfile-tools',
				'.dockerignore'
			]);
		});

		//note: manifest.yml is a whisk document in serverless apps
		it('manifest.yml has python crud', function () {
			assert.file('manifest.yml');
			assert.fileContent('manifest.yml', 'method: "PUT"');
			assert.fileContent('manifest.yml', 'function: actions/update.py');
			assert.fileContent('manifest.yml', 'method: "GET"');
			assert.fileContent('manifest.yml', 'function: actions/read.py');
			assert.fileContent('manifest.yml', 'runtime: python-jessie:3');
		});

	});

	describe('cloud-enablement:serverless NODE', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleNode)});
		});

		it('has all .bluemix files', function () {
			assert.file('.bluemix/deploy.json');
			assert.file('.bluemix/pipeline-DEPLOY.sh');
			assert.file('.bluemix/pipeline.yml');
			assert.file('.bluemix/toolchain.yml');
		});

		it('.bluemix files have correct contents', function () {
			let deployGenerated = fs.readFileSync('.bluemix/deploy.json', 'utf8');
			let pipelineGenerated = fs.readFileSync('.bluemix/pipeline.yml', 'utf8');
			let pipelineDeployGenerated = fs.readFileSync('.bluemix/pipeline-DEPLOY.sh', 'utf8');
			let toolchainGenerated = fs.readFileSync('.bluemix/toolchain.yml', 'utf8');

			assert.equal(deployGenerated, deploySample);
			assert.equal(pipelineGenerated, pipelineSample);
			assert.equal(pipelineDeployGenerated, pipelineDeploySample);
			assert.equal(toolchainGenerated, toolchainSample);
		});

		it('does not have docker files', function () {
			assert.noFile([
				'Dockerfile',
				'Dockerfile-tools',
				'.dockerignore'
			]);
		});

		//note: manifest.yml is a whisk document in serverless apps
		it('manifest.yml has node crud', function () {
			assert.file('manifest.yml');
			assert.fileContent('manifest.yml', 'method: "POST"');
			assert.fileContent('manifest.yml', 'function: actions/create.js');
			assert.fileContent('manifest.yml', 'method: "DELETE"');
			assert.fileContent('manifest.yml', 'function: actions/delete.js');
			assert.fileContent('manifest.yml', 'runtime: nodejs:8');
		});

	});

	describe('cloud-enablement:serverless SWIFT', function () {
		beforeEach(function () {
			return helpers.run(path.join(__dirname, '../generators/app'))
				.inDir(path.join(__dirname, './tmp'))
				.withOptions({bluemix: JSON.stringify(scaffolderSampleSwift)});
		});

		it('has all .bluemix files', function () {
			assert.file('.bluemix/deploy.json');
			assert.file('.bluemix/pipeline-DEPLOY.sh');
			assert.file('.bluemix/pipeline.yml');
			assert.file('.bluemix/toolchain.yml');
		});

		it('.bluemix files have correct contents', function () {
			let deployGenerated = fs.readFileSync('.bluemix/deploy.json', 'utf8');
			let pipelineGenerated = fs.readFileSync('.bluemix/pipeline.yml', 'utf8');
			let pipelineDeployGenerated = fs.readFileSync('.bluemix/pipeline-DEPLOY.sh', 'utf8');
			let toolchainGenerated = fs.readFileSync('.bluemix/toolchain.yml', 'utf8');

			assert.equal(deployGenerated, deploySample);
			assert.equal(pipelineGenerated, pipelineSample);
			assert.equal(pipelineDeployGenerated, pipelineDeploySample);
			assert.equal(toolchainGenerated, toolchainSample);
		});

		it('does not have docker files', function () {
			assert.noFile([
				'Dockerfile',
				'Dockerfile-tools',
				'.dockerignore'
			]);
		});

		//note: manifest.yml is a whisk document in serverless apps
		it('manifest.yml has swift crud', function () {
			assert.file('manifest.yml');
			assert.fileContent('manifest.yml', 'api/deleteAll:');
			assert.fileContent('manifest.yml', 'function: actions/deleteAll.swift');
			assert.fileContent('manifest.yml', 'api/readAll:');
			assert.fileContent('manifest.yml', 'function: actions/readAll.swift');
			assert.fileContent('manifest.yml', 'runtime: swift:3.1.1');
		});

	});

});


















