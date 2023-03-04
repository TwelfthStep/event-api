import mailchimp from '@mailchimp/mailchimp_marketing';
import { Request, Response } from 'express';
import Joi from 'joi';
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_KEY,
  server: process.env.MAILCHIMP_SERVER
});

import { ipForRequest } from '../../tools/req-res';

/**
 * Type guard for whether or not a response is of `ErrorResponse` or not.
 * @param response The response to check.
 * @returns True if `response` is an instance of `ErrorResponse`.
 */
function isErrorResponse(response: mailchimp.ErrorResponse | any): response is mailchimp.ErrorResponse {
  return ((response as mailchimp.ErrorResponse).title !== undefined) && ((response as mailchimp.ErrorResponse).instance !== undefined);
}

/**
 * Get the primary list used on Mailchimp.
 */
async function getMainList(){
  let lists = await getAllLists();

  if(lists.length > 0){
    return lists[0];
  }

  throw new Error(`Could not get subscription list from Mailchimp API.`);
}

/**
 * Get all Mailchimp lists under the event account.
 */
async function getAllLists(){
  const response = await mailchimp.lists.getAllLists();

  if(isErrorResponse(response)){
    throw new Error(response.title);
  }

  if(!response.lists){
    throw new Error(`No Mailchimp lists could be found.`);
  }

  return response.lists;
}

/**
 * Get whether or not the Mailchimp API is available.
 * @returns True if the Mailchimp API is up, false otherwise.
 */
export async function getMailchimpApiAvailable() {
  const response = await mailchimp.ping.get();
  console.log(response);
  if(isErrorResponse(response)){
    console.error('Error pinging Mailchimp API', response);
    return false;
  }

  return true;
}

/**
 * Get a Mailchimp-compatible string representing the current time.
 */
function createDateString(): mailchimp.TimeString {
    let string = (new Date()).toISOString();
    string = string.replace('T', ' ');
    string = string.substring(0, string.indexOf('.'));
    return string;
}

/**
 * Subscribe someone to our main Mailchimp list.
 * @param email The email to subscribe.
 * @param ip The IP address which originated the subscription.
 * @returns Undefined if successful, or a string containing the URL the customer must manually subscribe
 * from if unsuccessful.
 * @throws An `Error` if customer is already subscribed or the Mailchimp API failed.
 */
async function subscribeMailchimpMember(email: string, ip: string){
  let list = await getMainList();

  let list_id = list.id;
  console.log(`Subscribing ${email} (${ip ? ip : 'no IP'}) to Mailchimp list ${list_id}`);

  try{
    let body: mailchimp.lists.AddListMemberBody = {
      email_address: email.toLowerCase(),
      status: 'subscribed',
      email_type: 'html',
      timestamp_signup: createDateString(),
      timestamp_opt: createDateString()
    };
    if(ip){
      body.ip_signup = ip;
      body.ip_opt = ip;
    }

    await mailchimp.lists.addListMember(list_id, body);
  }
  catch(exception){
    console.error(exception.response.body);

    let errorTitle = exception.response.body.title.toLowerCase();
    switch(errorTitle){
      case 'member exists':
        throw new Error(`This customer is already subscribed to our Mailchimp list.`);
      case 'forgotten email not subscribed':
        return `${list.subscribe_url_long}&EMAIL=${email.toLowerCase()}`;
      default:
        throw new Error(`Failed to subscribe for an unknown reason: "${errorTitle}"`);
    }
  }
}

/**
 * Unsubscribes a member from our Mailchimp list, if they existed.
 * @param email The email to unsubscribe.
 */
async function unsubscribeMailchimpMember(email: string){
  try{
    let list = await getMainList();

    console.log(`Searching for ${email} from Mailchimp list ${list.id}...`);

    const memberResponse = await mailchimp.lists.getListMember(list.id, email.toLowerCase());

    if(isErrorResponse(memberResponse)){
      throw new Error(`${email} is not subscribed to our Mailchimp list`);
    }
    
    await mailchimp.lists.deleteListMemberPermanent(list.id, memberResponse.id);
    console.log(`Removed ${memberResponse.email_address} (UID ${memberResponse.unique_email_id}) from Mailchimp.`);
  }
  catch(error){
    if(error.response){
      console.error(error.response.body);

      let errorTitle = error.response.body.title.toLowerCase();
      switch(errorTitle){
        case 'resource not found':
          throw new Error(`This customer is not subscribed to our Mailchimp list.`);
        default:
          throw new Error(`Failed to unsubscribe ${email} from our Mailchimp list - you should check it manually.`)
      }
    }
    throw new Error(`Unknown error: ${error}`);
  }
}

/**
 * Safely subscribe a Mailchimp member without throwing anything.
 * @param email The email to subscribe.
 * @param ip The IP address which originated the subscription.
 * @returns A string containing the URL the customer must manually subscribe from if they previously unsubscribed.
 * Undefined if nothing.
 */
export async function safeSubscribeMailchimpMember(email: string, ip: string){
  try{
    return await subscribeMailchimpMember(email, ip);
  }
  catch(error){
    console.error(`Error when safely subscribing Mailchimp member:`, error);
  }
}


// TESTING

export async function testPostPleaseIgnore(req: Request, res: Response){
  res.send(req.body);
}