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

// class used by scaffolder-sample.js to build scaffolder objects for testing

class scaffolderSample {
	fullContents() {
		return {
			"analytics": {
				"apiKey": "ff12d70f-78bc-4db3-8d02-9c076996d15f",
				"serviceInfo": {
					"label": "MyAnalyticsLabel",
					"name": "MyAnalyticsService",
					"plan": "Basic"
				}
			},
			"server": {
				"diskQuota": "512M",
				"domain": "ng.bluemix.net",
				"env": {
					"JAVA_HOME": "PATH/TO/JAVAC",
					"ANT_OPTS": "ANTOPTSGOHERE"
				},
				"host": "myapp",
				"instances": 3,
				"memory": "1024M",
				"name": "my-application",
				"organization": "IMF_Sand",
				"services": [
					"example-service", "example-service2"
				],
				"space": "mobilecategoryDev"
			},
			"auth": {
				"clientId": "2212d70f-78bc-4db3-8d02-9c076996d15f",
				"oauthServerUrl": "https://appid-oauth.ng.bluemix.net/oauth/v3/{tenantId}",
				"profilesUrl": "https://appid-profiles.ng.bluemix.net",
				"secret": "ABCD1234ABCD1234",
				"serviceInfo": {
					"label": "MyAnalyticsLabel",
					"name": "MyAnalyticsService",
					"plan": "Basic"
				},
				"tenantId": "1112d70f-78bc-4db3-8d02-9c076996d15f",
				"version": "3"
			},
			"cloudant": [
				{
					"password": "pass",
					"serviceInfo": {
						"label": "MyAnalyticsLabel",
						"name": "MyAnalyticsService",
						"plan": "Basic"
					},
					"url": "https://account.cloudant.com",
					"username": "user"
				}
			],
			"conversation": {
				"password": "IDgoZXBCGsDe",
				"serviceInfo": {
					"label": "MyAnalyticsLabel",
					"name": "MyAnalyticsService",
					"plan": "Basic"
				},
				"url": "https://gateway.watsonplatform.net/conversation/api",
				"username": "0ec0f025-54r2-4e84-944f-8224a66217f2"
			},
			"dashDb": {
				"db": "BLUDB",
				"dsn": "DATABASE=BLUDB;HOSTNAME=ys1-dashdb-small-bm01-im-dal06-env4.services.dal.bluemix.net;PORT=50000;PROTOCOL=TCPIP;UID=dash105642;PWD=_qFv_9yCH8Al;",
				"host": "ys1-dashdb-small-bm01-im-dal06-env4.services.dal.bluemix.net",
				"hostname": "ys1-dashdb-small-bm01-im-dal06-env4.services.dal.bluemix.net",
				"https_url": "https://ys1-dashdb-small-bm01-im-dal06-env4.services.dal.bluemix.net:8443",
				"jdbcurl": "jdbc:db2://ys1-dashdb-small-bm01-im-dal06-env4.services.dal.bluemix.net:50000/BLUDB",
				"password": "_qFv_9yCH8Al",
				"port": 50000,
				"serviceInfo": {
					"label": "MyAnalyticsLabel",
					"name": "MyAnalyticsService",
					"plan": "Basic"
				},
				"ssldsn": "DATABASE=BLUDB;HOSTNAME=ys1-dashdb-small-bm01-im-dal06-env4.services.dal.bluemix.net;PORT=50001;PROTOCOL=TCPIP;UID=dash105642;PWD=_qFv_9yCH8Al;Security=SSL;",
				"ssljdbcurl": "jdbc:db2://ys1-dashdb-small-bm01-im-dal06-env4.services.dal.bluemix.net:50001/BLUDB:sslConnection=true;",
				"uri": "db2://dash105642:_qFv_9yCH8Al@ys1-dashdb-small-bm01-im-dal06-env4.services.dal.bluemix.net:50000/BLUDB",
				"username": "dash105642"
			},
			"discovery": {
				"password": "IDgoZXBCGsDe",
				"serviceInfo": {
					"label": "MyAnalyticsLabel",
					"name": "MyAnalyticsService",
					"plan": "Basic"
				},
				"url": "https://gateway.watsonplatform.net/discovery/api",
				"username": "0ec0f025-54r2-4e84-944f-8224a66217f2"
			},
			"documentConversion": {
				"password": "IDgoZXBCGsDe",
				"serviceInfo": {
					"label": "MyAnalyticsLabel",
					"name": "MyAnalyticsService",
					"plan": "Basic"
				},
				"url": "https://gateway.watsonplatform.net/document-conversion/api",
				"username": "0ec0f025-54r2-4e84-944f-8224a66217f2"
			},
			"languageTranslator": {
				"password": "IDgoZXBCGsDe",
				"serviceInfo": {
					"label": "MyAnalyticsLabel",
					"name": "MyAnalyticsService",
					"plan": "Basic"
				},
				"url": "https://gateway.watsonplatform.net/language-translator/api",
				"username": "0ec0f025-54r2-4e84-944f-8224a66217f2"
			},
			"name": "AcmeProject",
			"naturalLanguageClassifier": {
				"password": "IDgoZXBCGsDe",
				"serviceInfo": {
					"label": "MyAnalyticsLabel",
					"name": "MyAnalyticsService",
					"plan": "Basic"
				},
				"url": "https://gateway.watsonplatform.net/natural-language-classifier/api",
				"username": "0ec0f025-54r2-4e84-944f-8224a66217f2"
			},
			"naturalLanguageUnderstanding": {
				"password": "IDgoZXBCGsDe",
				"serviceInfo": {
					"label": "MyAnalyticsLabel",
					"name": "MyAnalyticsService",
					"plan": "Basic"
				},
				"url": "https://gateway.watsonplatform.net/natural-language-understanding/api",
				"username": "0ec0f025-54r2-4e84-944f-8224a66217f2"
			},
			"objectStorage": [
				{
					"auth_url": "https://identity.open.softlayer.com",
					"domainId": "theDomainId",
					"domainName": "theDomainName",
					"password": "Gl.=W23@",
					"project": "theProjectName",
					"projectId": "12345",
					"region": "dallas",
					"role": "admin",
					"serviceInfo": {
						"label": "MyAnalyticsLabel",
						"name": "MyAnalyticsService",
						"plan": "Basic"
					},
					"userId": "abc1234",
					"username": "user"
				}
			],
			"personalityInsights": {
				"password": "IDgoZXBCGsDe",
				"serviceInfo": {
					"label": "MyAnalyticsLabel",
					"name": "MyAnalyticsService",
					"plan": "Basic"
				},
				"url": "https://gateway.watsonplatform.net/personality-insights/api",
				"username": "0ec0f025-54r2-4e84-944f-8224a66217f2"
			},
			"push": {
				"appGuid": "ac35d70f-98bc-4db3-8d02-9c07699615f0",
				"appSecret": "d3017301-0285-4312-9aa0-c3f5b8289add",
				"clientSecret": "c13bcd73-352e-44d8-a7bc-6f2546eec711",
				"serviceInfo": {
					"label": "MyAnalyticsLabel",
					"name": "MyAnalyticsService",
					"plan": "Basic"
				}
			},
			"retrieveAndRank": {
				"password": "IDgoZXBCGsDe",
				"serviceInfo": {
					"label": "MyAnalyticsLabel",
					"name": "MyAnalyticsService",
					"plan": "Basic"
				},
				"url": "https://gateway.watsonplatform.net/retrieve-and-rank/api",
				"username": "0ec0f025-54r2-4e84-944f-8224a66217f2"
			},
			"sdks": [
				{
					"name": "PetStore",
					"spec": "http://petstore.swagger.io/v2/swagger.json"
				}
			],
			"speechToText": {
				"password": "IDgoZXBCGsDe",
				"serviceInfo": {
					"label": "MyAnalyticsLabel",
					"name": "MyAnalyticsService",
					"plan": "Basic"
				},
				"url": "https://gateway.watsonplatform.net/speech-to-text/api",
				"username": "0ec0f025-54r2-4e84-944f-8224a66217f2"
			},
			"textToSpeech": {
				"password": "IDgoZXBCGsDe",
				"serviceInfo": {
					"label": "MyAnalyticsLabel",
					"name": "MyAnalyticsService",
					"plan": "Basic"
				},
				"url": "https://gateway.watsonplatform.net/text-to-speech/api",
				"username": "0ec0f025-54r2-4e84-944f-8224a66217f2"
			},
			"toneAnalyzer": {
				"password": "IDgoZXBCGsDe",
				"serviceInfo": {
					"label": "MyAnalyticsLabel",
					"name": "MyAnalyticsService",
					"plan": "Basic"
				},
				"url": "https://gateway.watsonplatform.net/tone-analyzer/api",
				"username": "0ec0f025-54r2-4e84-944f-8224a66217f2"
			},
			"tradeoffAnalytics": {
				"password": "IDgoZXBCGsDe",
				"serviceInfo": {
					"label": "MyAnalyticsLabel",
					"name": "MyAnalyticsService",
					"plan": "Basic"
				},
				"url": "https://gateway.watsonplatform.net/tradeoff-analytics/api",
				"username": "0ec0f025-54r2-4e84-944f-8224a66217f2"
			},
			"visualRecognition": {
				"api_key": "IDgoZXBCGsDe",
				"note": "This apiKey will be valid in an hour or so.",
				"serviceInfo": {
					"label": "MyAnalyticsLabel",
					"name": "MyAnalyticsService",
					"plan": "Basic"
				},
				"url": "https://gateway.watsonplatform.net/visual-recognition/api"
			},
			"mongodb": {
				"uri": "mongodb://admin:password@bluemix.net,bluemix.net:20056/compose?ssl=true&authSource=admin"
			},
			"postgresql": {
				"uri": "postgres://admin:password@bluemix.net:20058/compose"
			},
			"alertnotification": {
				"url": "https://bluemix.net",
				"name": "alertnotification",
				"password": "alertnotification-password"
			},
			"redis": {
				"uri": "redis://admin:password@bluemix.com:20051"
			}
		}
	}

	noServices() {
		return {
			"name": "AcmeProject",
			"server": {
				"diskQuota": "512M",
				"domain": "ng.bluemix.net",
				"env": {
					"JAVA_HOME": "PATH/TO/JAVAC",
					"ANT_OPTS": "ANTOPTSGOHERE"
				},
				"host": "myapp",
				"instances": 3,
				"memory": "1024M",
				"name": "my-application",
				"organization": "IMF_Sand",
				"services": [
					"example-service", "example-service2"
				],
				"space": "mobilecategoryDev"
			}
		}
	}

	noServer() {
		return {
			"name": "AcmeProject"
		}
	}

	serverDeployment(deploymentType) {
		let bluemix = {
			"name": "AcmeProject",
			"server": {
				"diskQuota": "512M",
				"domain": "ng.bluemix.net",
				"host": "myapp",
				"instances": 3,
				"memory": "1024M",
				"name": "my-application",
				"organization": "IMF_Sand",
				"space": "mobilecategoryDev"
			}
		};

		if (deploymentType) {
			bluemix.server.cloudDeploymentType = deploymentType;
			if (deploymentType === 'Kube') {
				bluemix.server.cloudDeploymentOptions = {
					kubeClusterName: 'my_kube_cluster',
					kubeClusterNamespace: 'my_kube_namespace'
				};
			}
		}

		return bluemix;
	}
}

module.exports = {
	scaffolderSample : scaffolderSample
};
