import { getModelForClass, prop } from "@typegoose/typegoose";
import Joi from "joi";
import { TicketType, ticketTypeSchema } from "./ticket";

/**
 * The full name of a person.
 */
export class HumanName {
  /**
   * The person's first name.
   */
  @prop({ required: true, trim: true })
  first: string;

  /**
   * The person's last name.
   */
  @prop({ required: true, trim: true })
  last: string;
}

/**
 * Validation schema for HumanName.
 */
export const humanNameSchema = Joi.object({
  first: Joi.string().required(),
  last: Joi.string().required()
});


/**
 * A subscriber who is interested in receiving notifications about ACA Day.
 */
export class Subscriber {
  /**
   * When they subscribed.
   */
  @prop()
  creation?: Date;

  /**
   * Their email address, all lowercase.
   */
  @prop({ required: true })
  email: string;

  /**
   * Their full name.
   */
  @prop({ required: true, _id: false })
  name: HumanName;

  /**
   * The type of ticket the customer is interested in.
   */
  @prop({ required: true })
  ticketType: TicketType;
}

/**
 * Validation schema for Subscriber.
 */
export const subscriberSchema = Joi.object({
  email: Joi.string().email().required(),
  name: humanNameSchema.required(),
  ticketType: ticketTypeSchema.required()
});

export const SubscriberModel = getModelForClass(Subscriber);