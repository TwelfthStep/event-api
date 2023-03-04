import { Request, Response } from "express";
import Joi from "joi";

/**
 * Get the IP address for an express Request.
 * @param req The request that contains the IP address.
 * @returns The request's IP address as a string.
 */
export function ipForRequest(req: Request){
  let ipAddress: string = '';
  let header = req.headers['x-forwarded-for'];

  if(req.socket.remoteAddress){
    ipAddress = req.socket.remoteAddress;
  }
  else if(header && typeof header === 'string'){
    ipAddress = header;
  }

  // Local environment
  if(ipAddress === '::1' || ipAddress?.includes('127.0.0.1') || ipAddress?.includes('localhost')){
    ipAddress = process.env.SAMPLE_IP_ADDRESS!;
  }

  if(ipAddress === ''){
    ipAddress = '0.0.0.0';
  }

  console.log(`Returning IP '${ipAddress}'`);

  return ipAddress;
}

/**
 * Generic handler for responding to errors in a uniform way.
 * @param res The response to write the error to.
 * @param error The error that occurred.
 */
export function respondToError(res: Response, error: any){
  console.error(error);

  if(error instanceof Joi.ValidationError){
    res.status(400).send(error.details[0]);
    return;
  }

  if(error instanceof Error){
    res.status(400).send({ message: error.message });
    return;
  }
  
  res.status(500).send({
    message: `Unknown error: ${error}`
  });
}