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
let _ = require('lodash');
const Handlebars = require('../lib/handlebars.js');
const Utils = require('../lib/utils');

module.exports = class extends Generator {

	constructor(args, opts) {
		super(args, opts);

		if (typeof (opts.bluemix) === 'string') {
			this.bluemix = JSON.parse(opts.bluemix || '{}');
		} else {
			this.bluemix = opts.bluemix;

		}

		if(typeof (opts) === 'string'){
			this.opts = JSON.parse(opts || '{}');
		} else {
			this.opts = opts.cloudContext || opts;
		}
	}


	initializing() {
		this.fileLocations = {
			compat: {source : 'debian/compat_master', target : 'debian/compat', process: true},
			rules: {source : 'debian/rules_master', target : 'debian/rules', process: true},
			fetch: {source : 'terraform/scripts/fetch-state_master.sh', target : 'terraform/scripts/fetch-state.sh', process: true},
			publish: {source : 'terraform/scripts/publish-state_master.sh', target : 'terraform/scripts/publish-state.sh', process: true},
			validate: {source : 'terraform/scripts/validate_master.sh', target : 'terraform/scripts/validate.sh', process: true},
			main: {source : 'terraform/main_master.tf', target : 'terraform/main.tf', process: true},
			output: {source : 'terraform/output_master.tf', target : 'terraform/output.tf', process: true},
		};
	}

	configuring() {
		// work out app name and language

		this.opts.language = _.toLower(this.bluemix.backendPlatform);

		this.opts.chartName = this.opts.applicationName;

		this.deployment = {
			type: 'VSI',
			name: this.bluemix.name,
			lowercaseName: Utils.sanitizeAlphaNumLowerCase(this.bluemix.name),
			language: this.bluemix.backendPlatform || this.opts.bluemix.backendPlatform,
			createType: this.opts.createType || this.bluemix.createType
		};

		//use port if passed in

	}

	writing() {
		//skip writing files if platforms is specified via options and it doesn't include VSI
		if(this.opts.platforms && !this.opts.platforms.includes('VSI')) {
			return;
		}

		this._writeHandlebarsFile('debian/control_master', 'debian/control', {
			deployment: this.deployment
		});

		this._writeHandlebarsFile('terraform/scripts/start_master.sh', 'terraform/scripts/start.sh', {
			deployment: this.deployment
		});

		this._writeHandlebarsFile('terraform/scripts/install_master.sh', 'terraform/scripts/install.sh', {
			deployment: this.deployment
		});

		this._writeHandlebarsFile('terraform/scripts/build_master.sh', 'terraform/scripts/build.sh', {
			deployment: this.deployment
		});

		this._writeHandlebarsFile('terraform/variables_master.tf', 'terraform/variables.tf', {

			deployment: this.deployment
		});

		this._writeHandlebarsFile('debian/install_master', 'debian/install', {
			deployment: this.deployment
		});

		this._writeHandlebarsFile('debian/control_master', 'debian/control', {
			deployment: this.deployment
		});

		this._writeHandlebarsFile('debian/changelog_master', 'debian/changelog', {
			deployment: this.deployment
		});



		// iterate over file names
		let files = Object.keys(this.fileLocations);
		files.forEach(file => {
			let source = this.fileLocations[file].source;
			let target = this.fileLocations[file].target;
			if(this.fileLocations[file].process) {
				this._writeHandlebarsFile(source, target, this.opts);
			} else {
				this.fs.copy(
				this.templatePath(source),
				this.destinationPath(target)
			);
			}
		});

	}

	_writeHandlebarsFile(templateFile, destinationFile, data) {
		let template = this.fs.read(this.templatePath(templateFile));
		let compiledTemplate = Handlebars.compile(template);
		let output = compiledTemplate(data);
		this.fs.write(this.destinationPath(destinationFile), output);
	}
};
