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


// module for utils

'use strict';

const Handlebars = require('../lib/handlebars');
const Glob = require('glob');
const _ = require('lodash');
const fs = require('fs');

const REGEX_LEADING_ALPHA = /^[^a-zA-Z]*/;
const REGEX_ALPHA_NUM = /[^a-zA-Z0-9]/g;
const REGEX_ALPHA_NUM_DASH = /[^a-zA-Z0-9-]/g;

const sanitizeAlphaNumLowerCase = (name) => {
	return sanitizeAlphaNum(name).toLowerCase();
};

const sanitizeAlphaNum = (name) => {
	let cleanName = '';
	if (name != undefined) {
		cleanName = name.replace(REGEX_LEADING_ALPHA, '').replace(REGEX_ALPHA_NUM, '');
	}
	return (cleanName || 'APP');
};

function _writeHandlebarsFile(_this, templateFile, destinationFile, data) {
	let template = _this.fs.read(_this.templatePath(templateFile));
	let compiledTemplate = Handlebars.compile(template);
	let output = compiledTemplate(data);
	_this.fs.write(_this.destinationPath(destinationFile), output);
}

function _copyFiles(_this, srcPath, dstPath, templateContext) {

	let files = Glob.sync(srcPath + "/**/*", {dot: true});

	_.each(files, function (srcFilePath) {

		// Do not process srcFilePath if it is pointing to a directory
		if (fs.lstatSync(srcFilePath).isDirectory()) return;

		// Do not process files that end in .partial, they're processed separately
		if (srcFilePath.indexOf(".partial") > 0 || srcFilePath.indexOf(".replacement") > 0) return;

		let functionName =srcFilePath.substring(srcFilePath.lastIndexOf("/")+1);
		if( _.isUndefined(functionName) ) {
			return;
		}

		// Lets write the Actions using HandleBars
		_writeHandlebarsFile(_this,srcFilePath, dstPath+"/"+functionName,templateContext);

	}.bind(this));
}


const sanitizeAlphaNumDash = (name) => {
	name = name || 'appname';
	return name
    .toLowerCase()
    .replace(REGEX_LEADING_ALPHA, '')
    .replace(/ /g, '-')
    .replace(REGEX_ALPHA_NUM_DASH, '');
};

module.exports = {
	sanitizeAlphaNum: sanitizeAlphaNum,
	sanitizeAlphaNumLowerCase: sanitizeAlphaNumLowerCase,
	sanitizeAlphaNumDash: sanitizeAlphaNumDash,
	writeHandlebarsFile: _writeHandlebarsFile,
	copyFiles: _copyFiles
};
