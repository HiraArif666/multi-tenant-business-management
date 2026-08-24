import { initializeServerless } from '../src/main';

export default async function handler(req: any, res: any) {
  const app = await initializeServerless();
  app(req, res);
}