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
const Handlebars = require('../lib/helpers').handlebars;
const Utils = require('../lib/utils');

const FILENAME_CLI_CONFIG = "cli-config.yml";
const FILENAME_DOCKERFILE = "Dockerfile";
const FILENAME_DOCKERFILE_TOOLS = "Dockerfile-tools";
const FILENAME_DOCKER_IGNORE = ".dockerignore";

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

	configuring() {
	}

	writing() {
		switch (this.bluemix.backendPlatform) {
			case 'NODE':
				this._generateNodeJS();
				break;
			case 'JAVA':
				this._generateJava();
				break;
			case 'SPRING':
				this._generateJava();
				break;
			case 'SWIFT':
				this._generateSwift();
				break;
			case 'PYTHON':
				this._generatePython();
				break;
			default:
				throw new Error(`No language ${this.bluemix.backendPlatform} found`);
		}
	}

	_generateSwift() {
		// Files to contain custom build and test commands
		const FILENAME_SWIFT_BUILD = ".swift-build-linux";
		const FILENAME_SWIFT_TEST = ".swift-test-linux";

		// Define metadata for all services that
		// require custom logic in Dockerfiles
		const services = require('./resources/swift/services.json');

		// Get array with all the keys for the services objects
		const servKeys = Object.keys(services);
		const serviceItems = [];

		// Iterate over service keys to search for provisioned services
		let compilationOptions = "";
		for (let index in servKeys) {
			const servKey = servKeys[index];
			if(this.bluemix.hasOwnProperty(servKey)) {
				serviceItems.push(services[servKey]);
				if (services[servKey].hasOwnProperty("compilationOptions")) {
					compilationOptions = compilationOptions + " " + services[servKey].compilationOptions;
				}
			}
		}
		compilationOptions = compilationOptions.trim();

		const applicationName = Utils.sanitizeAlphaNum(this.bluemix.name);
		const executableName = applicationName;

		const cliConfig = {
			containerNameRun: `${applicationName.toLowerCase()}-swift-run`,
			containerNameTools: `${applicationName.toLowerCase()}-swift-tools`,
			hostPathRun: '.',
			hostPathTools: '.',
			containerPathRun: '/swift-project',
			containerPathTools: '/swift-project',
			containerPortMap: '8080:8080',
			containerPortMapDebug: '2048:1024,2049:1025',
			dockerFileRun: 'Dockerfile',
			dockerFileTools: 'Dockerfile-tools',
			imageNameRun: `${applicationName.toLowerCase()}-swift-run`,
			imageNameTools: `${applicationName.toLowerCase()}-swift-tools`,
			buildCmdRun: '/swift-utils/tools-utils.sh build release',
			testCmd: '/swift-utils/tools-utils.sh test',
			buildCmdDebug: '/swift-utils/tools-utils.sh build debug',
			runCmd: '',
			stopCmd: '',
			debugCmd: `/swift-utils/tools-utils.sh debug ${executableName} 1024`,
			chartPath: `chart/${applicationName.toLowerCase()}`
		};

		// Create Docker config object for Swift
		const dockerConfig = {
			executableName: `${executableName}`,
			serviceItems: serviceItems
		}

		this._copyTemplateIfNotExists(FILENAME_CLI_CONFIG, 'cli-config-common.yml', {
			cliConfig
		});

		this._copyTemplateIfNotExists(FILENAME_DOCKERFILE, 'swift/' + FILENAME_DOCKERFILE, {
			dockerConfig
		});

		this._copyTemplateIfNotExists(FILENAME_DOCKERFILE_TOOLS, 'swift/' + FILENAME_DOCKERFILE_TOOLS, {
			dockerConfig
		});

		if (compilationOptions.length > 0) {
			this._copyTemplateIfNotExists(FILENAME_SWIFT_BUILD, 'swift/' + FILENAME_SWIFT_BUILD, {
				compilationOptions: compilationOptions
			});

			this._copyTemplateIfNotExists(FILENAME_SWIFT_TEST, 'swift/' + FILENAME_SWIFT_TEST, {
				compilationOptions: compilationOptions
			});
		}

		this.fs.copy(
			this.templatePath('swift/dockerignore'),
			this.destinationPath('.dockerignore')
		);
	}

	_generateNodeJS() {
		const applicationName = Utils.sanitizeAlphaNum(this.bluemix.name);
		const port = this.opts.port ? this.opts.port : '3000';


		const cliConfig = {
			containerNameRun: `${applicationName.toLowerCase()}-express-run`,
			containerNameTools: `${applicationName.toLowerCase()}-express-tools`,
			hostPathRun: '.',
			hostPathTools: '.',
			containerPathRun: '/app',
			containerPathTools: '/app',
			containerPortMap: `${port}:${port}`,
			containerPortMapDebug: '5858:5858',
			dockerFileRun: 'Dockerfile',
			dockerFileTools: 'Dockerfile-tools',
			imageNameRun: `${applicationName.toLowerCase()}-express-run`,
			imageNameTools: `${applicationName.toLowerCase()}-express-tools`,
			buildCmdRun: 'npm install --production --unsafe-perm',
			testCmd: 'npm run test',
			buildCmdDebug: 'npm install --unsafe-perm',
			runCmd: '',
			stopCmd: "npm stop",
			chartPath: `chart/${applicationName.toLowerCase()}`
		};

		if (this.fs.exists(this.destinationPath(FILENAME_CLI_CONFIG))){
			console.info(FILENAME_CLI_CONFIG, "already exists, skipping.");
		} else {
			this.fs.copyTpl(
				this.templatePath('cli-config-common.yml'),
				this.destinationPath(FILENAME_CLI_CONFIG), {
					cliConfig
				}
			);
		}

		if (this.fs.exists(this.destinationPath(FILENAME_DOCKERFILE))){
			console.info(FILENAME_DOCKERFILE, "already exists, skipping.");
		} else {
			this.fs.copyTpl(
				this.templatePath('node/Dockerfile'),
				this.destinationPath(FILENAME_DOCKERFILE), {
					port: port,
				}
			);
		}

		if (this.fs.exists(this.destinationPath(FILENAME_DOCKERFILE_TOOLS))){
			console.info(FILENAME_DOCKERFILE_TOOLS, "already exists, skipping.");
		} else {
			this.fs.copyTpl(
				this.templatePath('node/Dockerfile-tools'),
				this.destinationPath(FILENAME_DOCKERFILE_TOOLS), {
					port: port,
				}
			);
		}

		this.fs.copyTpl(
			this.templatePath('node/dockerignore'),
			this.destinationPath('.dockerignore')
		);
	}

	_generateJava() {
		if(!this.opts.appName) {
			this.opts.appName = Utils.sanitizeAlphaNum(this.bluemix.name);
		}
		let dir = this.bluemix.backendPlatform.toLowerCase();

		if(!this.opts.platforms || this.opts.platforms.includes('cli')) {
			/* Common cli-config template */
			if (this.fs.exists(this.destinationPath(FILENAME_CLI_CONFIG))){
				console.info(FILENAME_CLI_CONFIG, "already exists, skipping.");
			} else {
				this._writeHandlebarsFile(
					dir + '/cli-config.yml.template',
					FILENAME_CLI_CONFIG,
					this.opts
				);
			}

			if (this.fs.exists(this.destinationPath(FILENAME_DOCKERFILE_TOOLS))){
				console.info(FILENAME_DOCKERFILE_TOOLS, "already exists, skipping.");
			} else {
				this._writeHandlebarsFile(
					dir + '/Dockerfile-tools.template',
					FILENAME_DOCKERFILE_TOOLS,
					this.opts
				);
			}
		}

		if (this.fs.exists(this.destinationPath(FILENAME_DOCKERFILE))){
			console.info(FILENAME_DOCKERFILE, "already exists, skipping.");
		} else {
			this._writeHandlebarsFile(
				dir + '/Dockerfile.template',
				FILENAME_DOCKERFILE,
				this.opts
			);
		}

		if (this.fs.exists(this.destinationPath(FILENAME_DOCKER_IGNORE))){
			console.info(FILENAME_DOCKER_IGNORE, "already exists, skipping.");
		} else {
			this._writeHandlebarsFile(
				dir + '/dockerignore.template',
				FILENAME_DOCKER_IGNORE,
				this.opts
			);
		}
	}

	_writeHandlebarsFile(templateFile, destinationFile, data) {
		let template = this.fs.read(this.templatePath(templateFile));
		let compiledTemplate = Handlebars.compile(template);
		let output = compiledTemplate(data);
		this.fs.write(this.destinationPath(destinationFile), output);
	}

	_generatePython() {
		const applicationName = Utils.sanitizeAlphaNum(this.bluemix.name);
		const port = this.opts.port ? this.opts.port : '3000';

		// Define metadata for all services that
		// require custom logic in Dockerfiles
		const services = require('./resources/python/services.json');

		// Get array with all the keys for the services objects
		const servKeys = Object.keys(services);
		const servicesPackages = [];

		// Iterate over service keys to search for provisioned services
		for (let index in servKeys) {
			const servKey = servKeys[index];
			if (this.bluemix.hasOwnProperty(servKey)) {
				if (services[servKey].package) {
					servicesPackages.push(services[servKey].package);
				}
			}
		}

		const cliConfig = {
			containerNameRun: `${applicationName.toLowerCase()}-flask-run`,
			containerNameTools: `${applicationName.toLowerCase()}-flask-tools`,
			hostPathRun: '.',
			hostPathTools: '.',
			containerPathRun: '/app',
			containerPathTools: '/app',
			containerPortMap: `${port}:${port}`,
			containerPortMapDebug: '5858:5858',
			dockerFileRun: 'Dockerfile',
			dockerFileTools: 'Dockerfile-tools',
			imageNameRun: `${applicationName.toLowerCase()}-flask-run`,
			imageNameTools: `${applicationName.toLowerCase()}-flask-tools`,
			buildCmdRun: 'python -m compileall .',
			testCmd: this.opts.enable
				? 'echo No test command specified in cli-config'
				: 'python -m unittest tests.app_tests.ServerTestCase',
			buildCmdDebug: 'python -m compileall .',
			runCmd: '',
			stopCmd: '',
			debugCmd: this.opts.enable
				? 'echo No debug command specified in cli-config'
				: 'python -m flask run --host=0.0.0.0 --port=5858 --debugger',
			chartPath: `chart/${applicationName.toLowerCase()}`
		};

		if (this.fs.exists(this.destinationPath(FILENAME_CLI_CONFIG))){
			console.info(FILENAME_CLI_CONFIG, "already exists, skipping.");
		} else {
			this.fs.copyTpl(
				this.templatePath('cli-config-common.yml'),
				this.destinationPath(FILENAME_CLI_CONFIG), {
					cliConfig
				}
			);
		}

		if (this.fs.exists(this.destinationPath(FILENAME_DOCKERFILE))){
			console.info(FILENAME_DOCKERFILE, "already exists, skipping.");
		} else {
			this.fs.copyTpl(
				this.templatePath('python/Dockerfile'),
				this.destinationPath(FILENAME_DOCKERFILE), {
					port: port,
					enable: this.opts.enable,
					servicesPackages: servicesPackages
				}
			);
		}

		if (this.fs.exists(this.destinationPath(FILENAME_DOCKERFILE_TOOLS))){
			console.info(FILENAME_DOCKERFILE_TOOLS, "already exists, skipping.");
		} else {
			this.fs.copyTpl(
				this.templatePath('python/Dockerfile-tools'),
				this.destinationPath(FILENAME_DOCKERFILE_TOOLS), {
					servicesPackages: servicesPackages
				}
			);
		}

		this.fs.copy(
			this.templatePath('python/dockerignore'),
			this.destinationPath('.dockerignore')
		);
	}

	_copyTemplateIfNotExists(targetFileName, sourceTemplatePath, ctx) {
		if (this.fs.exists(this.destinationPath(targetFileName))){
			console.info(targetFileName, "already exists, skipping.");
		} else {
			this.fs.copyTpl(
				this.templatePath(sourceTemplatePath),
				this.destinationPath(targetFileName),
				ctx
			);
		}

	}
};
