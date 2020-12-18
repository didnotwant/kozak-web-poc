/*
 * Copyright 2010-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

//node.js deps
const https = require('https');
const fs = require('fs');

//npm deps

//app deps
const deviceModule = require('..').device;
const cmdLineProcess = require('./lib/cmdline');

//begin module

function processTest(args) {
   //
   // The device module exports an MQTT instance, which will attempt
   // to connect to the AWS IoT endpoint configured in the arguments.
   // Once connected, it will emit events which our application can
   // handle.
   //
   // const device = deviceModule({
   //    keyPath: args.privateKey,
   //    certPath: args.clientCert,
   //    caPath: args.caCert,
   //    clientId: args.clientId,
   //    region: args.region,
   //    baseReconnectTimeMs: args.baseReconnectTimeMs,
   //    keepalive: args.keepAlive,
   //    protocol: args.Protocol,
   //    port: args.Port,
   //    host: args.Host,
   //    debug: args.Debug
   // });

   const reqData = JSON.stringify({
      client: 'client1',
   });

   const req = https.request({
      hostname: 'ktwqxpj1h6.execute-api.eu-central-1.amazonaws.com',
      path: '/test/tvm',
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'Content-Length': reqData.length,
      }
   }, resp => {
      resp.on('data', d => {
         const data = JSON.parse(d);

         const device = deviceModule({
            clientId: 'client1',
            protocol: 'wss',
            host: data.endpoint,
            debug: true,
            keepalive: 6,
            accessKeyId: data.credentials.access_key_id,
            secretKey: data.credentials.secret_access_key,
            sessionToken: data.credentials.session_token,
            // caCert: fs.readFileSync('temp/AmazonRootCA1.pem'),
            // caPath: 'temp/AmazonRootCA1.pem',
         });

         device.subscribe(data.topic_in);
         device.publish(data.topic_in, JSON.stringify({
            foo: 'bar',
         }));

         device
           .on('connect', function() {
              console.log('connect');
           });
         device
           .on('close', function() {
              console.log('close');
           });
         device
           .on('reconnect', function() {
              console.log('reconnect');
           });
         device
           .on('offline', function() {
              console.log('offline');
           });
         device
           .on('error', function(error) {
              console.log('error', error);
           });
         device
           .on('message', function(topic, payload) {
              console.log('message', topic, payload.toString());
           });
      })
   });

   req.write(reqData);
   req.end();

   // window.fetch('https://ktwqxpj1h6.execute-api.eu-central-1.amazonaws.com/test/tvm', {
   //    method: 'POST',
   // })
   //   .then(resp => resp.json())
   //   .then(resp => {
   //      console.log('SHOW ME', resp);
   //   })
   // ;

   /*

   var timeout;
   var count = 0;
   const minimumDelay = 250;

   if (args.testMode === 1) {
      device.subscribe('topic_1');
   } else {
      device.subscribe('topic_2');
   }
   if ((Math.max(args.delay, minimumDelay)) !== args.delay) {
      console.log('substituting ' + minimumDelay + 'ms delay for ' + args.delay + 'ms...');
   }
   timeout = setInterval(function() {
      count++;

      if (args.testMode === 1) {
         device.publish('topic_2', JSON.stringify({
            mode1Process: count
         }));
      } else {
         device.publish('topic_1', JSON.stringify({
            mode2Process: count
         }));
      }
   }, Math.max(args.delay, minimumDelay)); // clip to minimum

   //
   // Do a simple publish/subscribe demo based on the test-mode passed
   // in the command line arguments.  If test-mode is 1, subscribe to
   // 'topic_1' and publish to 'topic_2'; otherwise vice versa.  Publish
   // a message every four seconds.
   //
   device
      .on('connect', function() {
         console.log('connect');
      });
   device
      .on('close', function() {
         console.log('close');
      });
   device
      .on('reconnect', function() {
         console.log('reconnect');
      });
   device
      .on('offline', function() {
         console.log('offline');
      });
   device
      .on('error', function(error) {
         console.log('error', error);
      });
   device
      .on('message', function(topic, payload) {
         console.log('message', topic, payload.toString());
      });

   */

}

module.exports = cmdLineProcess;

if (require.main === module) {
   cmdLineProcess('connect to the AWS IoT service and publish/subscribe to topics using MQTT, test modes 1-2',
      process.argv.slice(2), processTest);
}
