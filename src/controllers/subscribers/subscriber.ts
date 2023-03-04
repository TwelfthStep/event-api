import { HumanName, Subscriber, SubscriberModel, subscriberSchema } from '../../models/subscriber';
import { DocumentType } from '@typegoose/typegoose';
import { Request, Response } from 'express';
import { TicketType } from '../../models/ticket';
import { ipForRequest, respondToError } from '../../tools/req-res';
import { subscribeMailchimpMember } from '../marketing/mailchimp';

/**
 * Create a Subscriber object based on the email and name of the person.
 * @param email The email address of the subscriber.
 * @param name The full name of the subscriber.
 * @returns A subscriber object ready for insertion into the database.
 */
async function createSubscriber(email: string, name: HumanName, ticketType: TicketType): Promise<DocumentType<Subscriber>> {
  let customer = new Subscriber();

  customer.email = email.toLowerCase();
  customer.creation = new Date();
  customer.name = name;
  customer.ticketType = ticketType;

  return new SubscriberModel(customer);
}

/**
 * POST a subscriber to the database and register them for Mailchimp emails.
 */
export async function postSubscriber(req: Request, res: Response){
  try{
    // Validate request
    await subscriberSchema.validateAsync(req.body);
    const reqBody: Subscriber = req.body;

    // Check for already existing subscriber
    const existingSub = await SubscriberModel.findOne({
      email: reqBody.email.toLowerCase()
    });
    if(existingSub){
      throw new Error(`You're already subscribed to our mailing list. Stay tuned!`);
    }

    // Create the subscriber
    const subscriber = await createSubscriber(reqBody.email.toLowerCase(), reqBody.name, reqBody.ticketType);

    // Subscribe them to Mailchimp
    const manualAuthUrl = await subscribeMailchimpMember(subscriber.email, ipForRequest(req));

    // Subscriber was added to Mailchimp list successfully, save to DB
    await subscriber.save();

    res.send({
      subscriber,
      manualAuthUrl
    }); 
  }
  catch(error){
    respondToError(res, error);
  }
} 