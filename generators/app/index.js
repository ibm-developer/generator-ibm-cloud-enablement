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

'use strict';

const Generator = require('yeoman-generator');
const _ = require('lodash');
const path = require('path');
const os = require('os');
const Utils = require('../lib/utils');

const OPTION_BLUEMIX = 'bluemix';
const OPTION_STARTER = 'starter';

module.exports = class extends Generator {
	constructor(args, opts) {
		super(args, opts);

		this._sanitizeOption(this.options, OPTION_BLUEMIX);
		this._sanitizeOption(this.options, OPTION_STARTER);

		this.opts = opts;

		if (this.options.libertyVersion === 'beta') {
			this.options.libertyBeta = true
		}

		this.shouldPrompt = this.opts.bluemix ? false : true;

		/*
		Yeoman copies the opts when doing compose with so create own object reference
		that can be updated in prompting
		*/
		if (this.opts.bluemix) {
			this.bluemix = this.opts.bluemix;
		} else {
			this.bluemix = {};
			this.opts.bluemix = this.bluemix;
		}

		if (this.opts.bluemix.name && !this.opts.bluemix.sanitizedName) {
			this.opts.bluemix.sanitizedName = Utils.sanitizeAlphaNumDash(this.opts.bluemix.name);
		}

		// Find cloud deployment type to composeWith correct generators
		if (this.bluemix.server) {
			this.cloudDeploymentType = this.bluemix.server.cloudDeploymentType;
		} else {
			this.cloudDeploymentType = this.bluemix.cloudDeploymentType;
		}
	}

	initializing() {
		this.composeWith(require.resolve('../dockertools'), this.opts);
		this.composeWith(require.resolve('../kubernetes'), this.opts);
		this.composeWith(require.resolve('../deployment'), this.opts);
	}

	prompting() {
		if (!this.shouldPrompt) {
			return;
		}
		const prompts = [];
		prompts.push({
			type: 'input',
			name: 'name',
			message: 'Project name',
			default: path.basename(process.cwd())
		});
		prompts.push({
			type: 'list',
			name: 'language',
			message: 'Language Runtime',
			choices: [
				'JAVA',
				'SPRING',
				'NODE',
				'PYTHON',
				'SWIFT',
				'DJANGO',
				'GO'
			]
		});
		prompts.push({
			type: 'input',
			name: 'dockerRegistry',
			message: 'Docker Registry (space for none)',
			default: 'registry.ng.bluemix.net/' + os.userInfo().username
		});

		prompts.push({
			type: 'input',
			name: 'deploymentType',
			message: 'Deployment Type (Kube, CF, etc.)',
			default: path.basename(process.cwd())
		});

		prompts.push({
			type: 'input',
			name: 'kubeClusterNamespace',
			message: 'Kube Cluster Namespace',
			default: 'default'
		});

		prompts.push({
			type: 'list',
			name: 'kubeDeploymentType',
			message: 'Kube Deployment Type',
			choices: [
				'HELM',
				'KNATIVE'
			]
		});

		prompts.push({
			type: 'input',
			name: 'createType',
			message: 'App Type ie basic, blank, ect.',
			default: path.basename(process.cwd())
		});

		return this.prompt(prompts).then(this._processAnswers.bind(this));
	}

	configuring() {}

	_processAnswers(answers) {
		if (!this.bluemix.server) {
			this.bluemix.server = {};
			this.bluemix.server.cloudDeploymentOptions = {};
		}
		this.bluemix.backendPlatform = answers.language;
		this.bluemix.name = answers.name;
		this.bluemix.sanitizedName = Utils.sanitizeAlphaNumDash(answers.name);
		answers.dockerRegistry = answers.dockerRegistry.trim();
		this.bluemix.dockerRegistry = answers.dockerRegistry.length > 0 ? answers.dockerRegistry : '';
		if (this.bluemix.dockerRegistry.length > 0) {
			this.bluemix.server.cloudDeploymentOptions.imageRegistryNamespace = this.bluemix.dockerRegistry;
		}
		this.bluemix.cloudDeploymentType = answers.deploymentType;
		this.bluemix.server.cloudDeploymentType = answers.deploymentType;
		this.bluemix.server.cloudDeploymentOptions.kubeDeploymentType = answers.kubeDeploymentType;
		if (this.bluemix.server && this.bluemix.server.cloudDeploymentOptions) {
			this.bluemix.server.cloudDeploymentOptions.kubeClusterNamespace = answers.kubeClusterNamespace;
		}
		this.opts.createType = answers.createType;
	}

	_sanitizeOption(options, name) {
		const optionValue = options[name];
		if (optionValue && _.isFunction(optionValue.indexOf) && optionValue.indexOf('file:') === 0) {
			const fileName = optionValue.replace('file:', '');
			const filePath = this.destinationPath(`./${fileName}`);
			console.info(`Reading ${name} parameter from local file ${filePath}`);
			this.options[name] = this.fs.readJSON(filePath);
			return;
		}

		try {
			this.options[name] = typeof (this.options[name]) === 'string' ?
				JSON.parse(this.options[name]) : this.options[name];
		} catch (e) {
			throw Error(`${name} parameter is expected to be a valid stringified JSON object`);
		}
	}
};
