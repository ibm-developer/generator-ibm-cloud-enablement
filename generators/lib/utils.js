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


// module for utils

'use strict';

const REGEX_LEADING_ALPHA = /^[^a-zA-Z]*/;
const REGEX_ALPHA_NUM = /[^a-zA-Z0-9]/g;

function sanitizeAlphaNumLowerCase(name) {
	return sanitizeAlphaNum(name).toLowerCase();
}

function sanitizeAlphaNum(name) {
	let cleanName = '';
	if (name != undefined) {
		cleanName = name.replace(REGEX_LEADING_ALPHA, '').replace(REGEX_ALPHA_NUM, '');
	}
	return (cleanName || 'APP');
}

function createUniqueName(name) {
	const hexString = new Buffer(name, 'base64').toString('hex');

	const chars = hexString.length > 5 ? 5 : 4;

	return new Buffer(name, 'base64').toString('hex').substring(0,chars);

}

module.exports = {
	sanitizeAlphaNum,
	sanitizeAlphaNumLowerCase,
	createUniqueName

};
