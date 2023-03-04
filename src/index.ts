/**
 * Event API
 *
 * Written by Edwin Finch
 * edwin@lignite.io
 * https://github.com/edwinfinch
 */

/*
!!!!!!!!!!! 
!!!!!!!!!!! 
!!!!!!!!!!! ENVIRONMENT VARIABLES MUST BE LOADED BEFORE ANY OTHER IMPORTS!
!!!!!!!!!!! 
!!!!!!!!!!! 
*/

// Set up environment variables
import * as dotenv from 'dotenv';
dotenv.config();
if(!process.env.REQUIRED_KEYS){
  console.log(`❌ Environment variables failed to load! Please make sure you have a .env file in the root directory of this project and try again.`);
  process.exit();
}

// Check required environment variables exit
import { isDeploy } from './tools/env';
let requiredEnvKeys: string[] = JSON.parse(process.env.REQUIRED_KEYS!);
if(!isDeploy('production')){
  requiredEnvKeys = requiredEnvKeys.concat(JSON.parse(process.env.REQUIRED_KEYS_DEV!) as string[]);
}
let invalidEnv = false;
for(let keyIndex in requiredEnvKeys){
  const key = requiredEnvKeys[keyIndex];
  if(!process.env[key]){
    console.error(`❌ Missing required .env key '${key}'`);
    invalidEnv = true;
  }
}
if(invalidEnv){
  process.exit();
}

/*
!!!!!!!!!!! 
!!!!!!!!!!! 
!!!!!!!!!!! ENVIRONMENT VARIABLES MUST BE LOADED BEFORE ANY OTHER IMPORTS!
!!!!!!!!!!! 
!!!!!!!!!!! 
*/


// Import package info
import * as fs from 'fs';
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));


// Welcome message
const welcomeString = '✝️ Welcome to the Event API ✝️';
const versionString = `✝️ v${pkg.version} on ${process.env.DEPLOY}`;
console.log();
console.log('✝️'.repeat(welcomeString.length - 2));
console.log(welcomeString);
console.log(versionString + (' '.repeat(welcomeString.length - versionString.length - 2)) + '✝️');
console.log('✝️'.repeat(welcomeString.length - 2));
console.log();



// Set up Braintree gateway
import braintree from 'braintree';
global.braintreeGateway = new braintree.BraintreeGateway({
  environment: braintree.Environment[process.env.BRAINTREE_ENVIRONMENT!],
  merchantId: process.env.BRAINTREE_MERCHANT_ID!,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY!,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY!
});
console.log(`👍 Braintree gateway initialized.`);



// Check Mailchimp API
import { getMailchimpApiAvailable } from './controllers/marketing/mailchimp';
if(isDeploy('production')){
  setTimeout(async() => { console.log((await getMailchimpApiAvailable()) ? '👍 Mailchimp API available.' : '⚠️ Mailchimp API appears to be down.') });
}


// Launch server
import app from './server';
app.listen(app.get('port'), () => {
  setTimeout(() => {
    console.log(`\n🟢 API now live: http://localhost:${app.get('port')}`);
  }, 1000);
});