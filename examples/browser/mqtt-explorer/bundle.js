(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const awsConfiguration = {
   // Note: For Cognito connection only.
   poolId: '',
   region: 'eu-central-1'
};
module.exports = awsConfiguration;

},{}],2:[function(require,module,exports){
const AWS = require('aws-sdk');
const AWSIoTData = require('aws-iot-device-sdk');
const AWSConfiguration = require('./aws-configuration.js');

const tvmUrl = 'https://ktwqxpj1h6.execute-api.eu-central-1.amazonaws.com/test/tvm';

const tvmClientId = 'client1';

const defaultMessageString = '{"client":"' + tvmClientId + '","loan_request":{"amount":30000,"period_in_months":3}}';

console.log('Loaded AWS SDK for JavaScript and AWS IoT SDK for Node.js');

let currentlySubscribedTopic = '';
let messageHistory = '';

AWS.config.region = AWSConfiguration.region;

const reqData = JSON.stringify({
   client: tvmClientId,
});

window.fetch(tvmUrl, {
   method: 'POST',
   mode: 'cors',
   body: reqData,
   credentials: 'omit',
   headers: {
      'Content-Type': 'application/json',
      'Content-Length': reqData.length
   }
})
  .then(resp => resp.json())
  .then(resp => {
    const {
      endpoint,
      topic_in: topicIn,
      topic_out: topicOut,
      client_id: clientId,
    } = resp;

     const {
       access_key_id: accessKeyId,
       secret_access_key: secretKey,
       session_token: sessionToken,
     } = resp.credentials;

     const mqttClient = AWSIoTData.device({
        region: AWS.config.region,
        host: endpoint,
        clientId,
        protocol: 'wss',
        maximumReconnectTimeMs: 8000,
        debug: true,
        accessKeyId,
        secretKey,
        sessionToken,
     });

     currentlySubscribedTopic = topicIn;

     window.mqttClientConnectHandler = function() {
        console.log('connect');
        document.getElementById("connecting-div").style.visibility = 'hidden';
        document.getElementById("explorer-div").style.visibility = 'visible';
        document.getElementById('subscribe-div').innerHTML = '<p><br></p>';
        messageHistory = '';

        mqttClient.subscribe(currentlySubscribedTopic);
     };

     window.mqttClientReconnectHandler = function() {
        console.log('reconnect');
        document.getElementById("connecting-div").style.visibility = 'visible';
        document.getElementById("explorer-div").style.visibility = 'hidden';
     };

     window.isUndefined = function(value) {
        return typeof value === 'undefined' || typeof value === null;
     };

     window.mqttClientMessageHandler = function(topic, payload) {
        console.log('message: ' + topic + ':' + payload.toString());
        messageHistory = messageHistory + topic + ':' + payload.toString() + '</br>';
        document.getElementById('subscribe-div').innerHTML = '<p>' + messageHistory + '</p>';
     };

     window.updateSubscriptionTopic = function() {
        var subscribeTopic = document.getElementById('subscribe-topic').value;
        document.getElementById('subscribe-div').innerHTML = '';
        mqttClient.unsubscribe(currentlySubscribedTopic);
        currentlySubscribedTopic = subscribeTopic;
        mqttClient.subscribe(currentlySubscribedTopic);
     };

     window.clearHistory = function() {
        if (confirm('Delete message history?') === true) {
           document.getElementById('subscribe-div').innerHTML = '<p><br></p>';
           messageHistory = '';
        }
     };

     window.updatePublishTopic = function() {};

     window.updatePublishData = function() {
        var publishText = document.getElementById('publish-data').value;
        var publishTopic = document.getElementById('publish-topic').value;

        mqttClient.publish(publishTopic, publishText);
     };

     mqttClient.on('connect', window.mqttClientConnectHandler);
     mqttClient.on('reconnect', window.mqttClientReconnectHandler);
     mqttClient.on('message', window.mqttClientMessageHandler);

     document.getElementById('connecting-div').style.visibility = 'visible';
     document.getElementById('explorer-div').style.visibility = 'hidden';
     document.getElementById('connecting-div').innerHTML = '<p>attempting to connect to aws iot...</p>';

    if (topicOut) {
      document.getElementById('publish-topic').value = topicOut;
    }
    if (topicIn) {
      document.getElementById('subscribe-topic').value = topicIn;
    }

    document.getElementById('publish-data').value = defaultMessageString;
    document.getElementById('publish-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      window.updatePublishData();
    });
  })
  .catch(error => {
     console.log('TVM request failed: ', error);
  })
;

},{"./aws-configuration.js":1,"aws-iot-device-sdk":"aws-iot-device-sdk","aws-sdk":"aws-sdk"}]},{},[2]);
