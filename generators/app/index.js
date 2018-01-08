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

'use strict';

const Generator = require('yeoman-generator');
const _ = require('lodash');
const path = require('path');
const os = require('os');

const OPTION_BLUEMIX = 'bluemix';
const OPTION_STARTER = 'starter';

module.exports = class extends Generator {
	constructor(args, opts) {
		super(args, opts);

		this._sanitizeOption(this.options, OPTION_BLUEMIX);
		this._sanitizeOption(this.options, OPTION_STARTER);

		this.opts = opts;

		this.shouldPrompt = this.opts.bluemix ? false : true;

		/*
		Yeoman copies the opts when doing compose with so create own object reference 
		that can be updated in prompting
		*/
		if(this.opts.bluemix) {
			this.bluemix = this.opts.bluemix;
		} else {
			this.bluemix = {};
			this.opts.bluemix = this.bluemix;
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
				'SWIFT'
			]
		});
		prompts.push({
			type: 'input',
			name: 'dockerRegistry',
			message: 'Docker Registry (space for none)',
			default: 'registry.ng.bluemix.net/' + os.userInfo().username
		});

		return this.prompt(prompts).then(this._processAnswers.bind(this));
	}

	configuring() {
	}

	_processAnswers(answers) {
		this.bluemix.backendPlatform = answers.language;
		this.bluemix.name = answers.name;
		answers.dockerRegistry = answers.dockerRegistry.trim();
		this.bluemix.dockerRegistry = answers.dockerRegistry.length > 0 ? answers.dockerRegistry : '';
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
