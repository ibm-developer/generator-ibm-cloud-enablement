/*
 * Copyright IBM Corporation 2017
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict'
const sample = require('./scaffolder-sample-contents');

function getJson(language) {
	let scaffolderSample = new sample.scaffolderSample();
	let bluemix = scaffolderSample.fullContents();
	return get(language, bluemix);
}

function getJsonNoServices(language) {
	let scaffolderSample = new sample.scaffolderSample();
	let bluemix = scaffolderSample.noServices();
	return get(language, bluemix);
}

function getJsonNoServer(language) {
	let scaffolderSample = new sample.scaffolderSample();
	let bluemix = scaffolderSample.noServer();
	return get(language, bluemix);
}

function get(language, bluemix) {
	bluemix.backendPlatform = language;
	if(language === 'JAVA') {
		bluemix.server.memory = "512M";
	}
	if(language === 'SPRING') {
		bluemix.server.memory = "256M";
	}
	if(language === 'SWIFT') {
		// The payload below simulates a short-term solution from generator-swiftserver
		// which is used in the pipeline.yml create-service command.
		bluemix.services = {
			cloudant: [{
				name: "gkghk-cloudantNo-1504851366275",
				label: "cloudantNoSQLDB",
				plan: "Lite",
				credentials: {}
			}]
		};
	}
	return JSON.stringify(bluemix);
}

module.exports = {
	getJson : getJson,
	getJsonNoServices : getJsonNoServices,
	getJsonNoServer : getJsonNoServer
}
