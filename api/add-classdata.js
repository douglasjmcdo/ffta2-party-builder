import { sql } from '@vercel/postgres';
 
export default async function handler(request, response) {
  try {
    const ClassName = request.query.ClassName;
    const DefaultSpriteForRace = request.query?.DefaultSpriteForRace;
    const ViableRaces = request.query.ViableRaces;
    if (!ClassName || !ViableRaces) throw new Error('ClassName and ViableRaces required');
    let res = "";
    
    if (DefaultSpriteForRace) {
      res = "This api is disabled but retained for documentation purposes" ;
      //await sql`INSERT INTO ClassInfo (ClassName, DefaultSpriteForRace, ViableRaces) VALUES (${ClassName}, ${DefaultSpriteForRace}, ${ViableRaces});`;
    } else {
      res = "This api is disabled but retained for documentation purposes" ;
      //await sql`INSERT INTO ClassInfo (ClassName,ViableRaces) VALUES (${ClassName}, ${ViableRaces});`;
    }
    //const abilities = query; //"This api is disabled but retained for documentation purposes"; 
    return response.status(200).json({ res });
  } catch (error) {
    return response.status(500).json({ error });
  }
}