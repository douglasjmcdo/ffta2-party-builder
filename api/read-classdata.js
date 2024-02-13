import { sql } from '@vercel/postgres';
 
export default async function handler(request, response) {
  try {
    const ClassName = request.query?.ClassName;
    const Race = request.query?.Race;
    const DefaultSprite = request.query?.DefaultSprite;

    let res = "";
    
    if (ClassName) {
      res = await sql`SELECT * FROM ClassInfo WHERE ClassName=${ClassName}`;
    } else if (Race) {
        let racestring = "%" + Race + "%";
        res = await sql`SELECT * FROM ClassInfo WHERE ViableRaces LIKE ${racestring}`;
    } else if (DefaultSprite) {
        res = await sql`SELECT * FROM ClassInfo WHERE DefaultSpriteForRace=${DefaultSprite}`;
    }
    else {
      res = await sql`SELECT * FROM ClassInfo`;
    }

    return response.status(200).json({ res });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error });
  }
}