import { sql } from '@vercel/postgres';
 
export default async function handler(request, response) {
  try {
    const res = "This api is disabled but retained for documentation purposes" ;
     //await sql`CREATE TABLE ClassInfo ( ClassName varchar(255), DefaultSpriteForRace int, ViableRaces varchar(255) );`;
    return response.status(200).json({ res });
  } catch (error) {
    return response.status(500).json({ error });
  }
}