import Joi from "joi";

export type TicketType = 'physical' | 'virtual';
export const ticketTypeSchema = Joi.string().valid('physical', 'virtual');