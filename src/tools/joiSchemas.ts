import Joi from "joi"

/**
 * Schema for HumanName.
 */
export const HumanNameSchema = Joi.object({
  first: Joi.string().required(),
  last: Joi.string().required()
});

/**
 * Schema for just the `email` parameter being a string that is an all-lowercase email address.
 */
export const EmailSchema = Joi.object({
  email: Joi.string().email().lowercase().required()
}).unknown();

/**
 * Schema for Payee.
 */
export const PayeeSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  name: HumanNameSchema.required(),
  address: Joi.object({
    countryCode: Joi.string().length(2).required(),
    postalCode: Joi.string().allow(null)
  })
})

/**
 * Schema for PaymentRequestDev.
 */
export const PaymentRequestDevSettingsSchema = Joi.object({
  declineNonce: Joi.boolean(),
  declineSettlement: Joi.boolean(),
  skipRepeat: Joi.boolean()
});