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
const Handlebars = require('../lib/handlebars.js');
const Utils = require('../lib/utils');

const FILENAME_CLI_CONFIG = "cli-config.yml";
const FILENAME_DOCKERFILE = "Dockerfile";
const FILENAME_DOCKERCOMPOSE = "docker-compose.yml";
const FILENAME_DOCKERCOMPOSE_TOOLS = "docker-compose-tools.yml";
const FILENAME_DOCKERFILE_TOOLS = "Dockerfile-tools";
const FILENAME_DOCKER_IGNORE = ".dockerignore";
const FILENAME_DEBUG = "run-debug";
const FILENAME_DEV = "run-dev";

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

		this.opts.libertyBeta = opts.libertyBeta;

		if (typeof(this.opts.services) === 'string') {
			this.opts.services  = JSON.parse(opts.services || '[]');
		} else {
			this.opts.services = opts.services || [];
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
			case 'DJANGO':
				this._generateDjango();
				break;
			case 'GO':
				this._generateGo();
				break;
			default:
				throw new Error(`No language ${this.bluemix.backendPlatform} found`);
		}
	}

	_generateSwift() {
		// Files to contain custom build and test commands
		const FILENAME_SWIFT_BUILD = ".swift-build-linux";
		const FILENAME_SWIFT_TEST = ".swift-test-linux";

		const dockerFileRun = this.opts.services.length > 0 ? 'docker-compose.yml' : 'Dockerfile';
		const dockerFileTools = this.opts.services.length > 0 ? 'docker-compose-tools.yml' : 'Dockerfile-tools';

		// Define metadata for all services that
		// require custom logic in Dockerfiles
		const services = require('./resources/swift/services.json');

		// Get array with all the keys for the services objects
		const servKeys = Object.keys(services);
		const serviceItems = [];
		const serviceEnvs = [];
		const serviceImageNames = [];
		const servicePorts = [];

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

        // Iterate over services key deployed under docker images
		// Retrieve envs, port and images names if availables for each services
		for (let index = 0; index < this.opts.services.length; index++){
			const servKey = this.opts.services[index];
			if(services[servKey].hasOwnProperty('envs')){
				serviceEnvs.push(services[servKey].envs);
			}

			if(services[servKey].hasOwnProperty('imageName')){
				serviceImageNames.push(services[servKey].imageName);
			}

			if(services[servKey].hasOwnProperty('port')){
				servicePorts.push(services[servKey].port);
			}
		}


		compilationOptions = compilationOptions.trim();

		const applicationName = Utils.sanitizeAlphaNum(this.bluemix.name);
		const executableName = this.bluemix.name;

		const cliConfig = {
			containerNameRun: `${applicationName.toLowerCase()}-swift-run`,
			containerNameTools: `${applicationName.toLowerCase()}-swift-tools`,
			hostPathRun: '.',
			hostPathTools: '.',
			containerPathRun: '/swift-project',
			containerPathTools: '/swift-project',
			containerPortMap: '8080:8080',
			containerPortMapDebug: '2048:1024,2049:1025',
			dockerFileRun,
			dockerFileTools,
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

		if(this.opts.services.length > 0){
			const dockerComposeConfig =  {
				containerName: `${applicationName.toLowerCase()}-swift-run`,
				image: `${applicationName.toLowerCase()}-swift-run`,
				envs: serviceEnvs,
				images: serviceImageNames
			};
			this._copyTemplateIfNotExists(FILENAME_DOCKERCOMPOSE, 'swift/docker-compose.yml', dockerComposeConfig);
			dockerComposeConfig.containerName = `${applicationName.toLowerCase()}-swift-tools`;
			dockerComposeConfig.image = `${applicationName.toLowerCase()}-swift-tools`;
			this._copyTemplateIfNotExists(FILENAME_DOCKERCOMPOSE_TOOLS, 'swift/docker-compose-tools.yml', dockerComposeConfig);
		}


		this.fs.copy(
			this.templatePath('swift/dockerignore'),
			this.destinationPath('.dockerignore')
		);
	}

	_generateNodeJS() {
		const applicationName = Utils.sanitizeAlphaNum(this.bluemix.name);
		const dockerFileRun = this.opts.services.length > 0 ? 'docker-compose.yml' : 'Dockerfile';
		const dockerFileTools = this.opts.services.length > 0 ? 'docker-compose-tools.yml' : 'Dockerfile-tools';
		const port = this.opts.port ? this.opts.port : '3000';
		const debugPort = '9229';

		// Define metadata for all services that
		// require custom logic in Dockerfiles
		const services = require('./resources/node/services.json');

		// Get array with all the keys for the services objects
		const servKeys = Object.keys(services);
		const servicesPackages = [];
		const serviceEnvs = [];
		const serviceImageNames = [];
		const servicePorts = [];

		// Iterate over service keys to search for provisioned services and their environments
		for (let index in servKeys) {
			const servKey = servKeys[index];
			if (this.bluemix.hasOwnProperty(servKey)) {
				if (services[servKey].package) {
					servicesPackages.push(services[servKey].package);
				}
			}
		}

          // Iterate over services key deployed under docker images
          // Retrieve envs, port and images names if availables for each services
		for (let index = 0; index < this.opts.services.length; index++){
			const servKey = this.opts.services[index];
			if(services[servKey].hasOwnProperty('envs')){
				serviceEnvs.push(services[servKey].envs);
			}

			if(services[servKey].hasOwnProperty('imageName')){
				serviceImageNames.push(services[servKey].imageName);
			}
			if(services[servKey].hasOwnProperty('port')){
				servicePorts.push(services[servKey].port);
			}
		}


		const cliConfig = {
			containerNameRun: `${applicationName.toLowerCase()}-express-run`,
			containerNameTools: `${applicationName.toLowerCase()}-express-tools`,
			hostPathRun: '.',
			hostPathTools: '.',
			containerPathRun: '/app',
			containerPathTools: '/app',
			containerPortMap: `${port}:${port}`,
			containerPortMapDebug: `${debugPort}:${debugPort}`,
			containerMountsRun: '"./node_modules_linux": "/app/node_modules"',
			containerMountsTools: '"./node_modules_linux": "/app/node_modules"',
			dockerFileRun,
			dockerFileTools,
			imageNameRun: `${applicationName.toLowerCase()}-express-run`,
			imageNameTools: `${applicationName.toLowerCase()}-express-tools`,
			buildCmdRun: 'npm install' ,
			testCmd: 'npm run test',
			buildCmdDebug: 'npm install',
			runCmd: '',
			debugCmd: 'npm run debug',
			stopCmd: "npm stop",
			chartPath: `chart/${applicationName.toLowerCase()}`
		};

		this._copyTemplateIfNotExists(FILENAME_CLI_CONFIG, 'cli-config-common.yml', {cliConfig});

		this._copyTemplateIfNotExists(FILENAME_DOCKERFILE , 'node/Dockerfile', { port, servicesPackages });

		this._copyTemplateIfNotExists(FILENAME_DOCKERFILE_TOOLS, 'node/Dockerfile-tools', { port, debugPort });

		this._copyTemplateIfNotExists(FILENAME_DOCKER_IGNORE, 'node/dockerignore', {});

		this._copyTemplateIfNotExists(FILENAME_DEBUG , 'node/run-debug', {});

		this._copyTemplateIfNotExists(FILENAME_DEV , 'node/run-dev', {});


		if(this.opts.services.length > 0){

			const dockerComposeConfig =  {
				containerName: `${applicationName.toLowerCase()}-express-run`,
				image: `${applicationName.toLowerCase()}-express-run`,
				ports: [port, debugPort].concat(servicePorts),
				appPort: port,
				envs: serviceEnvs,
				images: serviceImageNames
			};
			this._copyTemplateIfNotExists(FILENAME_DOCKERCOMPOSE, 'node/docker-compose.yml', dockerComposeConfig);
			dockerComposeConfig.containerName = `${applicationName.toLowerCase()}-express-tools`;
			dockerComposeConfig.image = `${applicationName.toLowerCase()}-express-tools`,
			this._copyTemplateIfNotExists(FILENAME_DOCKERCOMPOSE_TOOLS, 'node/docker-compose-tools.yml', dockerComposeConfig);
		}


		if (this.fs.exists(this.destinationPath(FILENAME_DOCKER_IGNORE))){
			this.log(FILENAME_DOCKER_IGNORE, "already exists, skipping.");
		} else {
			this.fs.copyTpl(
				this.templatePath('node/dockerignore'),
				this.destinationPath('.dockerignore')
			);
		}
	}

	_generateJava() {
		if(!this.opts.appName) {
			this.opts.appName = Utils.sanitizeAlphaNum(this.bluemix.name);
		}
		let dir = this.bluemix.backendPlatform.toLowerCase();

		if(!this.opts.platforms || this.opts.platforms.includes('cli')) {
			/* Common cli-config template */
			if (this.fs.exists(this.destinationPath(FILENAME_CLI_CONFIG))){
				this.log(FILENAME_CLI_CONFIG, "already exists, skipping.");
			} else {
				this._writeHandlebarsFile(
					dir + '/cli-config.yml.template',
					FILENAME_CLI_CONFIG,
					this.opts
				);
			}

			if (this.fs.exists(this.destinationPath(FILENAME_DOCKERFILE_TOOLS))){
				this.log(FILENAME_DOCKERFILE_TOOLS, "already exists, skipping.");
			} else {
				this._writeHandlebarsFile(
					dir + '/Dockerfile-tools.template',
					FILENAME_DOCKERFILE_TOOLS,
					this.opts
				);
			}
		}

		if (this.fs.exists(this.destinationPath(FILENAME_DOCKERFILE))){
			this.log(FILENAME_DOCKERFILE, "already exists, skipping.");
		} else {
			this._writeHandlebarsFile(
				dir + '/Dockerfile.template',
				FILENAME_DOCKERFILE,
				this.opts
			);
		}

		if (this.fs.exists(this.destinationPath(FILENAME_DOCKER_IGNORE))){
			this.log(FILENAME_DOCKER_IGNORE, "already exists, skipping.")
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
		const dockerFileRun = this.opts.services.length > 0 ? 'docker-compose.yml' : 'Dockerfile';
		const dockerFileTools = this.opts.services.length > 0 ? 'docker-compose-tools.yml' : 'Dockerfile-tools';
		const debugPort = '5858';

		// Define metadata for all services that
		// require custom logic in Dockerfiles
		const services = require('./resources/python/services.json');

		// Get array with all the keys for the services objects
		const servKeys = Object.keys(services);
		const servicesPackages = [];
		const serviceEnvs = [];
		const serviceImageNames = [];
		const servicePorts = [];


		// Iterate over service keys to search for provisioned services
		for (let index in servKeys) {
			const servKey = servKeys[index];
			if (this.bluemix.hasOwnProperty(servKey)) {
				if (services[servKey].package) {
					servicesPackages.push(services[servKey].package);
				}
			}
		}

        // Iterate over services key deployed under docker images
		// Retrieve envs, port and images names if availables for each services
		for (let index = 0; index < this.opts.services.length; index++){
			const servKey = this.opts.services[index];
			if(services[servKey].hasOwnProperty('envs')){
				serviceEnvs.push(services[servKey].envs);
			}
			if(services[servKey].hasOwnProperty('imageName')){
				serviceImageNames.push(services[servKey].imageName);
			}
			if(services[servKey].hasOwnProperty('port')){
				servicePorts.push(services[servKey].port);
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
			containerPortMapDebug: `${debugPort}:${debugPort}`,
			dockerFileRun,
			dockerFileTools,
			imageNameRun: `${applicationName.toLowerCase()}-flask-run`,
			imageNameTools: `${applicationName.toLowerCase()}-flask-tools`,
			buildCmdRun: 'python manage.py build',
			testCmd: this.opts.enable
				? 'echo No test command specified in cli-config'
				: 'python manage.py test',
			buildCmdDebug: 'python manage.py build',
			runCmd: '',
			stopCmd: '',
			debugCmd: this.opts.enable
				? 'echo No debug command specified in cli-config'
				: 'python manage.py debug',
			chartPath: `chart/${applicationName.toLowerCase()}`
		};

		if(this.opts.services.length > 0){
			const dockerComposeConfig =  {
				containerName: `${applicationName.toLowerCase()}-flask-run`,
				image: `${applicationName.toLowerCase()}-flask-run`,
				ports: [port, debugPort].concat(servicePorts),
				appPort: port,
				envs: serviceEnvs,
				images: serviceImageNames
			};
			this._copyTemplateIfNotExists(FILENAME_DOCKERCOMPOSE, 'python/docker-compose.yml', dockerComposeConfig);
			dockerComposeConfig.containerName = `${applicationName.toLowerCase()}-flask-tools`;
			dockerComposeConfig.image = `${applicationName.toLowerCase()}-flask-tools`;
			this._copyTemplateIfNotExists(FILENAME_DOCKERCOMPOSE_TOOLS, 'python/docker-compose-tools.yml', dockerComposeConfig);
		}

		if (this.fs.exists(this.destinationPath(FILENAME_CLI_CONFIG))){
			this.log(FILENAME_CLI_CONFIG, "already exists, skipping.");
		} else {
			this.fs.copyTpl(
				this.templatePath('cli-config-common.yml'),
				this.destinationPath(FILENAME_CLI_CONFIG), {
					cliConfig
				}
			);
		}

		if (this.fs.exists(this.destinationPath(FILENAME_DOCKERFILE))){
			this.log(FILENAME_DOCKERFILE, "already exists, skipping.");
		} else {
			this.fs.copyTpl(
				this.templatePath('python/Dockerfile'),
				this.destinationPath(FILENAME_DOCKERFILE), {
					port: port,
					enable: this.opts.enable,
					language: this.bluemix.backendPlatform,
					name: this.bluemix.name,
					servicesPackages: servicesPackages
				}
			);
		}

		if (this.fs.exists(this.destinationPath(FILENAME_DOCKERFILE_TOOLS))){
			this.log(FILENAME_DOCKERFILE_TOOLS, "already exists, skipping.");
		} else {
			this.fs.copyTpl(
				this.templatePath('python/Dockerfile-tools'),
				this.destinationPath(FILENAME_DOCKERFILE_TOOLS), {
					servicesPackages: servicesPackages,
					language: this.bluemix.backendPlatform,
					name: this.bluemix.name
				}
			);
		}

		if (this.fs.exists(this.destinationPath(FILENAME_DEV))){
			this.log(FILENAME_DEV, "already exists, skipping.");
		} else {
			this.fs.copyTpl(
				this.templatePath('python/run-dev'),
				this.destinationPath(FILENAME_DEV), {
					port: port,
					enable: this.opts.enable,
					servicesPackages: servicesPackages,
					language: this.bluemix.backendPlatform,
					name: this.bluemix.name
				}
			);
		}

		const FILENAME_MANAGEMENT = "manage.py";
		if (!this.opts.enable) {
			if (this.fs.exists(this.destinationPath(FILENAME_MANAGEMENT))){
				this.log(FILENAME_MANAGEMENT, "already exists, skipping.");
			} else {
				this.fs.copy(
					this.templatePath('python/manage.py'),
					this.destinationPath(FILENAME_MANAGEMENT)
				);
			}
		}

		this.fs.copy(
			this.templatePath('python/dockerignore'),
			this.destinationPath('.dockerignore')
		);

	}
	_generateDjango() {
		const applicationName = Utils.sanitizeAlphaNum(this.bluemix.name);
		const port = this.opts.port ? this.opts.port : '3000';
		const debugPort = '5858';

		const dockerFileRun = this.opts.services.length > 0 ? 'docker-compose.yml' : 'Dockerfile';
		const dockerFileTools = this.opts.services.length > 0 ? 'docker-compose-tools.yml' : 'Dockerfile-tools';

		// Define metadata for all services that
		// require custom logic in Dockerfiles
		const services = require('./resources/python/services.json');

		// Get array with all the keys for the services objects and docker services
		const servKeys = Object.keys(services);
		const servicesPackages = [];
		const serviceEnvs = [];
		const serviceImageNames = [];
		const servicePorts = [];

		// Iterate over service keys to search for provisioned services
		for (let index in servKeys) {
			const servKey = servKeys[index];
			if (this.bluemix.hasOwnProperty(servKey)) {
				if (services[servKey].package) {
					servicesPackages.push(services[servKey].package);
				}
			}

		}

        // Iterate over services key deployed under docker images
		// Retrieve envs, port and images names if availables for each services
		for (let index = 0; index < this.opts.services.length; index++){
			const servKey = this.opts.services[index];

			if(services[servKey].hasOwnProperty('envs')){
				serviceEnvs.push(services[servKey].envs);
			}

			if(services[servKey].hasOwnProperty('imageName')){
				serviceImageNames.push(services[servKey].imageName);
			}

			if(services[servKey].hasOwnProperty('imageName')){
				serviceImageNames.push(services[servKey].imageName);
			}
			if(services[servKey].hasOwnProperty('port')){

				servicePorts.push(services[servKey].port);
			}
		}

		const cliConfig = {
			containerNameRun: `${applicationName.toLowerCase()}-django-run`,
			containerNameTools: `${applicationName.toLowerCase()}-django-tools`,
			hostPathRun: '.',
			hostPathTools: '.',
			containerPathRun: '/app',
			containerPathTools: '/app',
			containerPortMap: `${port}:${port}`,
			containerPortMapDebug: `${debugPort}:${debugPort}`,
			dockerFileRun,
			dockerFileTools,
			imageNameRun: `${applicationName.toLowerCase()}-django-run`,
			imageNameTools: `${applicationName.toLowerCase()}-django-tools`,
			buildCmdRun: 'python -m compileall .',
			testCmd: this.opts.enable
				? 'echo No test command specified in cli-config'
				: 'python manage.py test',
			buildCmdDebug: 'python -m compileall .',
			runCmd: '',
			stopCmd: '',
			debugCmd: this.opts.enable
				? 'echo No debug command specified in cli-config'
				: `python manage.py runserver --noreload`,
			chartPath: `chart/${applicationName.toLowerCase()}`
		};

		if (this.fs.exists(this.destinationPath(FILENAME_CLI_CONFIG))){
			this.log(FILENAME_CLI_CONFIG, "already exists, skipping.");
		} else {
			this.fs.copyTpl(
				this.templatePath('cli-config-common.yml'),
				this.destinationPath(FILENAME_CLI_CONFIG), {
					cliConfig
				}
			);
		}

		if (this.fs.exists(this.destinationPath(FILENAME_DOCKERFILE))){
			this.log(FILENAME_DOCKERFILE, "already exists, skipping.");
		} else {
			this.fs.copyTpl(
				this.templatePath('python/Dockerfile'),
				this.destinationPath(FILENAME_DOCKERFILE), {
					port: port,
					enable: this.opts.enable,
					servicesPackages: servicesPackages,
					language: this.bluemix.backendPlatform,
					name: this.bluemix.name
				}
			);
		}

		if (this.fs.exists(this.destinationPath(FILENAME_DOCKERFILE_TOOLS))){
			this.log(FILENAME_DOCKERFILE_TOOLS, "already exists, skipping.");
		} else {
			this.fs.copyTpl(
				this.templatePath('python/Dockerfile-tools'),
				this.destinationPath(FILENAME_DOCKERFILE_TOOLS), {
					servicesPackages: servicesPackages,
					language: this.bluemix.backendPlatform,
					name: this.bluemix.name
				}
			);
		}

		if (this.fs.exists(this.destinationPath(FILENAME_DEV))){
			this.log(FILENAME_DEV, "already exists, skipping.");
		} else {
			this.fs.copyTpl(
				this.templatePath('python/run-dev'),
				this.destinationPath(FILENAME_DEV), {
					port: port,
					enable: this.opts.enable,
					servicesPackages: servicesPackages,
					language: this.bluemix.backendPlatform,
					name: this.bluemix.name.toLowerCase()
				}
			);
		}

		if(this.opts.services.length > 0){
			const dockerComposeConfig =  {
				containerName: `${applicationName.toLowerCase()}-django-run`,
				image: `${applicationName.toLowerCase()}-django-run`,
				ports: [port, debugPort].concat(servicePorts),
				envs: serviceEnvs,
				appPort: port,
				images: serviceImageNames
			};
			this._copyTemplateIfNotExists(FILENAME_DOCKERCOMPOSE, 'python/docker-compose.yml', dockerComposeConfig);
			dockerComposeConfig.containerName = `${applicationName.toLowerCase()}-django-tools`;
			dockerComposeConfig.image = `${applicationName.toLowerCase()}-django-tools`;
			this._copyTemplateIfNotExists(FILENAME_DOCKERCOMPOSE_TOOLS, 'python/docker-compose-tools.yml', dockerComposeConfig);
		}


		this.fs.copy(
			this.templatePath('python/dockerignore'),
			this.destinationPath('.dockerignore')
		);
	}

	_generateGo() {
		const applicationName = this.bluemix.sanitizedName;
		const chartName = Utils.sanitizeAlphaNumLowerCase(this.bluemix.name);
		const dockerFileRun = 'Dockerfile';
		const dockerFileTools = 'Dockerfile-tools';
		const port = this.opts.port ? this.opts.port : '8080';
		const debugPort = '8181';

		const cliConfig = {
			containerNameRun: `${applicationName.toLowerCase()}-go-run`,
			containerNameTools: `${applicationName.toLowerCase()}-go-tools`,
			hostPathRun: '.',
			hostPathTools: '.',
			// The colon adds a buffer command
			containerPathRun: `/go/src/${applicationName}; :`,
			containerPathTools: `/go/src/${applicationName}; :`,
			containerPortMap: `${port}:${port}`,
			containerPortMapDebug: `${debugPort}:${debugPort}`,
			dockerFileRun,
			dockerFileTools,
			imageNameRun: `${applicationName.toLowerCase()}-go-run`,
			imageNameTools: `${applicationName.toLowerCase()}-go-tools`,
			buildCmdRun: 'go build',
			testCmd: 'go test ./...',
			buildCmdDebug: 'go build',
			runCmd: '',
			stopCmd: '',
			debugCmd: 'dlv debug --headless --listen=0.0.0.0:8181',
			chartPath: `chart/${chartName}`
		};

		this._copyTemplateIfNotExists(FILENAME_CLI_CONFIG, 'cli-config-common.yml', {cliConfig});

		this._copyTemplateIfNotExists(FILENAME_DOCKERFILE , 'go/Dockerfile', { port, applicationName });

		this._copyTemplateIfNotExists(FILENAME_DOCKERFILE_TOOLS, 'go/Dockerfile-tools', { port, debugPort, applicationName });

		this._copyTemplateIfNotExists(FILENAME_DOCKER_IGNORE, 'go/dockerignore', {});

		if (this.fs.exists(this.destinationPath(FILENAME_DOCKER_IGNORE))){
			this.log(FILENAME_DOCKER_IGNORE, "already exists, skipping.");
		} else {
			this.fs.copyTpl(
				this.templatePath('go/dockerignore'),
				this.destinationPath('.dockerignore')
			);
		}
	}

	_copyTemplateIfNotExists(targetFileName, sourceTemplatePath, ctx) {
		if (this.fs.exists(this.destinationPath(targetFileName))){
			this.log(targetFileName, "already exists, skipping.");
		} else {
			this.fs.copyTpl(
				this.templatePath(sourceTemplatePath),
				this.destinationPath(targetFileName),
				ctx
			);
		}

	}
};
