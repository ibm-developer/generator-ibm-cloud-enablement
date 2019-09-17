/*
Copyright 2019 IBM Corp.
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

'use strict';

const Generator = require('yeoman-generator');
const Utils = require('../lib/utils');
const _ = require('lodash');
const DEV_OPS = ".bluemix/";

module.exports = class extends Generator {
	constructor(args, opts) {
		super(args, opts);
		this.opts = opts.cloudContext || opts;
		if (typeof (opts.bluemix) === 'string') {
			this.bluemix = JSON.parse(opts.bluemix || '{}');
		} else if (typeof (opts.bluemix) === 'object') {
			this.bluemix = opts.bluemix;
		}

	}

	configuring() {
		this.toolchainConfig = {};
		this.pipelineConfig = {
			buildJobProps : {artifact_dir: "''"},
			triggersType: 'commit'
		};
		this.deployment = {type: 'Functions'};
		this.deployment.bluemix  = this.bluemix;

		if(!_.isUndefined(this.bluemix.cloudant)){
			this.deployment.my_service=this.bluemix.cloudant[0].serviceInfo.name;
		}

		this.name = this.bluemix.name;
		this.deployment.name = this.bluemix.name;
		this.deployment.packagename = Utils.sanitizeAlphaNumLowerCase(this.bluemix.name);
		this.deployment.type = 'Functions';
		this.deployment.scriptsDir = '.bluemix/scripts';
		this.toolchainConfig.repoType = this.opts.repoType || "clone";

	}

	writing() {

		if(this.opts.platforms && !this.opts.platforms.includes('bluemix')) {
			return;
		}

		// create .bluemix directory for toolchain/devops related files
		Utils.writeHandlebarsFile(this, 'toolchain_master.yml', DEV_OPS+'toolchain.yml',
			{
				name: this.name,
				repoType: this.toolchainConfig.repoType,
				deployment: this.deployment
			});

		Utils.writeHandlebarsFile(this, 'deploy_master.json', DEV_OPS+'deploy.json',
			{deployment: this.deployment});

		Utils.writeHandlebarsFile(this, 'pipeline-DEPLOY.sh', DEV_OPS+'pipeline-DEPLOY.sh',
			{deployment: this.deployment});

		Utils.writeHandlebarsFile(this, 'pipeline_master.yml', DEV_OPS+'pipeline.yml',
			{config: this.pipelineConfig, deployment: this.deployment});

		this.name = this.bluemix.name;

		switch (this.bluemix.backendPlatform) {
			case 'NODE':
				this._configureNode();
				break;
			case 'SWIFT':
				this._configureSwift();
				break;
			case 'PYTHON':
				this._configurePython();
				break;
			default:
				throw new Error(`Language ${this.bluemix.backendPlatform} was not one of the valid languages: NODE, SWIFT, JAVA, SPRING, DJANGO or PYTHON`);
		}

		const srcWskdeployManifest = "./manifest.yml.partial";
		const dstWskdeployManifest = this.destinationPath() + "/manifest.yml";

		//if statement so this doesn't screw up local testing
		if (!this.opts.localsrc) {
			Utils.writeHandlebarsFile(this, srcWskdeployManifest, dstWskdeployManifest,
				{name: this.name, suffix: this.suffix, runtime: this.runtime});
		}
	}

	_configureNode() {
		this.suffix = ".js";
		this.runtime = "nodejs:8";
	}

	_configureSwift() {
		this.suffix = ".swift";
		this.runtime = "swift:3.1.1";
	}

	_configurePython() {
		this.suffix = ".py";
		this.runtime = "python-jessie:3";
	}
};
