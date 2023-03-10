/**
 * server.ts
 * March 4, 2023
 * 
 * Checks server configuration and setup, and initializes the Express server for the API.
 */

import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
global.mongoose = mongoose;

// import * as cartController from './controllers/purchase/cart';
// import * as transactionController from './controllers/purchase/transaction';
// import * as customerController from './controllers/customers/customer';

// import * as braintreeController from './controllers/purchase/braintree';

import * as subscriberController from './controllers/subscribers/subscriber';
import * as mailchimpController from './controllers/marketing/mailchimp';

import bodyParser from 'body-parser';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';

import { isDeploy } from './tools/env';


/*
Set up the Express server
*/

const app = express();
app.set('port', process.env.API_PORT || 3001);
app.use(bodyParser.json());
app.use(cors());
if(isDeploy('production')){
  app.use(rateLimit({
    max: parseInt(process.env.RATE_LIMIT_AMOUNT!),
    message: { message: 'Rate limit exceeded, please try again after a few minutes.' }
  }));
  console.log(`âšī¸  Rate limit set to ${process.env.RATE_LIMIT_AMOUNT} requests per client per minute.`);
}


/*
Set up endpoints
*/
// SUBSCRIBERS
app.post('/subscribers', subscriberController.postSubscriber);


/*
Connect to the local MongoDB server
*/

mongoose.set('strictQuery', true);
mongoose.connect(`${process.env.MONGO_URL}/${process.env.MONGO_DATABASE}`, {
  authSource: process.env.MONGO_AUTH_SOURCE,
  user: process.env.MONGO_USER,
  pass: process.env.MONGO_PASSWORD
}).then(() => {
  console.log('đ Database connected.');
}).catch(error => {
  console.log('â Database failed to load. See error:');
  console.error(error);
  process.exit();
});


/*
Export the app :)
*/

export default app;