(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*
 * Copyright 2015-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *  http://aws.amazon.com/apache2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

/*
 * NOTE: You must set the following string constants prior to running this
 * example application.
 */
var awsConfiguration = {
   host: 'a2yd21n5c9mubx-ats.iot.eu-central-1.amazonaws.com',
   region: 'eu-central-1'
};
module.exports = awsConfiguration;


},{}],2:[function(require,module,exports){
/*
 * Copyright 2015-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *  http://aws.amazon.com/apache2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

//
// Instantiate the AWS SDK and configuration objects.  The AWS SDK for
// JavaScript (aws-sdk) is used for Cognito Identity/Authentication, and
// the AWS IoT SDK for JavaScript (aws-iot-device-sdk) is used for the
// WebSocket connection to AWS IoT and device shadow APIs.
//
var AWS = require('aws-sdk');
var AWSIoTData = require('aws-iot-device-sdk');
var AWSConfiguration = require('./aws-configuration.js');

console.log('Loaded AWS SDK for JavaScript and AWS IoT SDK for Node.js');

//
// Remember our current subscription topic here.
//
var currentlySubscribedTopic = 'clients/client1/in';

//
// Remember our message history here.
//
var messageHistory = '';

//
// Create a client id to use when connecting to AWS IoT.
//
var clientId = 'client1'
//
// Initialize our configuration.
//
AWS.config.region = AWSConfiguration.region;

AWS.config.credentials = new AWS.Credentials('ASIAZYUL2V63AKC33MU5', 'l8OVw70aB3MY+svMugVaW/08cJSlvw0DOPaQ3GZX', 'FwoGZXIvYXdzEK///////////wEaDKO7cUWVrfP6Ry0X5yKjAnWenU3Ezzttzrt0EKzLvDGLhp6XozKUQOC6OL2B1K5cZlljtBivvoP8auMCRzp52dXZSi5kbAPahbUKmnlHhsFcYTW3Mcuz4W54YSeUWnD9STtsnqNFfdgK2sxFOVZ05/EkkHm0HHJsGrIOR8jlP53dDP2cdnaVp8ETXCPu4VvBdSevIIYY40jvWaukbnC3gw8aLTzFlek1VptbssiDw5N+PqnrxflzU0kI2vrUgHygtxC6F0CbbCLZ0kPGnVlGq8Q+KCi4XME7QiqG7rMC58/ns6Yadg6MNALtaA+L0SSLgecJLlegNwKOXTTshB6//O7XLUMY6S8IS94XEO9q0FTP5Qn6iicCtLmKLRHNZHjMUnnkBHUa4A2GWv23TRj+ih9DxSiE1PL+BTItW16bOwCS3w2dzPoRIjlx2tYGjgMynUoBAJWdXjGLApWQv528fX8EUboTDGBt');

creds = AWS.config.credentials;

const mqttClient = AWSIoTData.device({
   //
   // Set the AWS region we will operate in.
   //
   region: AWS.config.region,
   //
   ////Set the AWS IoT Host Endpoint
   host:AWSConfiguration.host,
   //
   // Use the clientId created earlier.
   //
   clientId: clientId,
   //
   // Connect via secure WebSocket
   //
   protocol: 'wss',
   //
   // Set the maximum reconnect time to 8 seconds; this is a browser application
   // so we don't want to leave the user waiting too long for reconnection after
   // re-connecting to the network/re-opening their laptop/etc...
   //
   maximumReconnectTimeMs: 8000,
   //
   // Enable console debugging information (optional)
   //
   debug: false,
   //
   // IMPORTANT: the AWS access key ID, secret key, and sesion token must be
   // initialized with empty strings.
   //
   accessKeyId: creds.accessKeyId,
   secretKey: creds.secretAccessKey,
   sessionToken: creds.sessionToken
});


window.mqttClientConnectHandler = function() {
   console.log('connect');
   document.getElementById("connecting-div").style.visibility = 'hidden';
   document.getElementById("explorer-div").style.visibility = 'visible';
   document.getElementById('subscribe-div').innerHTML = '<p><br></p>';
   messageHistory = '';

   //
   // Subscribe to our current topic.
   //
   mqttClient.subscribe(currentlySubscribedTopic);
};

//
// Reconnect handler; update div visibility.
//
window.mqttClientReconnectHandler = function() {
   console.log('reconnect');
   document.getElementById("connecting-div").style.visibility = 'visible';
   document.getElementById("explorer-div").style.visibility = 'hidden';
};

//
// Utility function to determine if a value has been defined.
//
window.isUndefined = function(value) {
   return typeof value === 'undefined' || typeof value === null;
};

//
// Message handler for lifecycle events; create/destroy divs as clients
// connect/disconnect.
//
window.mqttClientMessageHandler = function(topic, payload) {
   console.log('message: ' + topic + ':' + payload.toString());
   messageHistory = messageHistory + topic + ':' + payload.toString() + '</br>';
   document.getElementById('subscribe-div').innerHTML = '<p>' + messageHistory + '</p>';
};

//
// Handle the UI for the current topic subscription
//
window.updateSubscriptionTopic = function() {
   var subscribeTopic = document.getElementById('subscribe-topic').value;
   document.getElementById('subscribe-div').innerHTML = '';
   mqttClient.unsubscribe(currentlySubscribedTopic);
   currentlySubscribedTopic = subscribeTopic;
   mqttClient.subscribe(currentlySubscribedTopic);
};

//
// Handle the UI to clear the history window
//
window.clearHistory = function() {
   if (confirm('Delete message history?') === true) {
      document.getElementById('subscribe-div').innerHTML = '<p><br></p>';
      messageHistory = '';
   }
};

//
// Handle the UI to update the topic we're publishing on
//
window.updatePublishTopic = function() {};

//
// Handle the UI to update the data we're publishing
//
window.updatePublishData = function() {
   var publishText = document.getElementById('publish-data').value;
   var publishTopic = document.getElementById('publish-topic').value;

   mqttClient.publish(publishTopic, publishText);
   document.getElementById('publish-data').value = '';
};

//
// Install connect/reconnect event handlers.
//
mqttClient.on('connect', window.mqttClientConnectHandler);
mqttClient.on('reconnect', window.mqttClientReconnectHandler);
mqttClient.on('message', window.mqttClientMessageHandler);

mqttClient.on('error', function () {
   console.log('WHAT ERROR?', arguments);
});
mqttClient.on('disconnect', function () {
   console.log('WHAT HAPPENED?', arguments);
});

//
// Initialize divs.
//
document.getElementById('connecting-div').style.visibility = 'visible';
document.getElementById('explorer-div').style.visibility = 'hidden';
document.getElementById('connecting-div').innerHTML = '<p>attempting to connect to aws iot...</p>';

},{"./aws-configuration.js":1,"aws-iot-device-sdk":"aws-iot-device-sdk","aws-sdk":"aws-sdk"}]},{},[2]);
