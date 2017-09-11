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

		// Define object that contains the metadata for all those services that 
		// require custom logic in dockerfiles
		const services = {
			"postgresql": {
				"package": "libpq-dev",
				"compilationOptions": "-Xcc -I/usr/include/postgresql"
			}
		}

		// Get array with all the keys for the services objects
		const servKeys = Object.keys(services);

		const servicesFound = [];
		// Iterate over service keys
		for (let index in servKeys) {
			const servKey = servKeys[index];
			if(this.bluemix.hasOwnProperty(servKey)) {
				console.log("HAS PROPERTY" + servKey)
				console.log("HELLLLLL!!")
				console.log("package: " + services[servKey].package);
				console.log("compilationOptions: " + services[servKey].compilationOptions);
				servicesFound.push(services[servKey]);
			} else {
				console.log("IR DOES NOT HAVE PROPERTY: " + servKey);
			}		
		}

		console.log("servicesFound: " + JSON.stringify(servicesFound));


		const applicationName = this._sanitizeAppName(this.bluemix.name);
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

		const dockerConfig = {
			executableName: `${executableName}`,
			servicesFound: servicesFound
		}

		if (this.fs.exists(this.destinationPath(FILENAME_DOCKERFILE))){
			console.info(FILENAME_DOCKERFILE, "already exists, skipping.");
		} else {	
			console.log("dockerConfig: " + JSON.stringify(dockerConfig));		
			this.fs.copyTpl(
				this.templatePath('swift/Dockerfile'),
				this.destinationPath(FILENAME_DOCKERFILE), {
					dockerConfig					
				}
			);
		}

		if (this.fs.exists(this.destinationPath(FILENAME_DOCKERFILE_TOOLS))){
			console.info(FILENAME_DOCKERFILE_TOOLS, "already exists, skipping.");
		} else {
			this.fs.copyTpl(
				this.templatePath('swift/Dockerfile-tools'),
				this.destinationPath(FILENAME_DOCKERFILE_TOOLS), {
					applicationName
				}
			);
		}

		this.fs.copy(
			this.templatePath('swift/dockerignore'),
			this.destinationPath('.dockerignore')
		);

	}

	_generateNodeJS() {
		const applicationName = this._sanitizeAppName(this.bluemix.name);
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
			this.opts.appName = this._sanitizeAppName(this.bluemix.name);
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
		const applicationName = this._sanitizeAppName(this.bluemix.name);
		const port = this.opts.port ? this.opts.port : '3000';

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
			buildCmdRun: 'python -m compileall server test',
			testCmd: 'python -m unittest tests.app_tests.ServerTestCase',
			buildCmdDebug: 'python -m compileall server test',
			runCmd: '',
			stopCmd: '',
			debugCmd: 'python -m flask run --host=0.0.0.0 --port=5858 --debugger',
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
					port: port
				}
			);
		}

		if (this.fs.exists(this.destinationPath(FILENAME_DOCKERFILE_TOOLS))){
			console.info(FILENAME_DOCKERFILE_TOOLS, "already exists, skipping.");
		} else {
			this.fs.copyTpl(
				this.templatePath('python/Dockerfile-tools'),
				this.destinationPath(FILENAME_DOCKERFILE_TOOLS), {
				}
			);
		}

		this.fs.copy(
			this.templatePath('python/dockerignore'),
			this.destinationPath('.dockerignore')
		);
	}

	_sanitizeAppName(name) {
		let cleanName = "";
		if (name != undefined) {
			cleanName = name.replace(/^[^a-zA-Z]*/, '').replace(/[^a-zA-Z0-9]/g, '');
		}
		return cleanName || 'APP';
	}
};
