/**
 * The type of server deploy.
 */
export type ServerDeployType = 'local' | 'development' | 'production';

/**
 * Get whether or not the current server deploy is equal to a certain type of deploy.
 * @param deployType The deploy type to check against.
 * @returns True if the server deploy matches `deployType`, false otherwise.
 */
export function isDeploy(deployType: ServerDeployType){
  return (process.env.DEPLOY === deployType);
}