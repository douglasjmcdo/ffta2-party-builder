import { sql } from '@vercel/postgres';
 
export default async function handler(
  request,
  response,
) {
  try {
    const result = "This api is disabled but retained for documentation purposes" 
      //await sql`CREATE TABLE AbilityInfo ( AbilityName varchar(255), IsReactive boolean, ViableRaces varchar(255));`
      ;
    return response.status(200).json({ result });
  } catch (error) {
    return response.status(500).json({ error });
  }
}