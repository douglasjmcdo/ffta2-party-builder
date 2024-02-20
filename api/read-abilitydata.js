import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
    try {
      const AbilityName = request.query?.AbilityName;
      const Race = request.query?.Race;
      const Reactive = request.query?.Reactive;
  
      let res = "";
      
      if (AbilityName) {
        res = await sql`SELECT * FROM AbilityInfo WHERE AbilityName=${AbilityName}`;
      } else if (Race) {
          let racestring = "%" + Race + "%";
          res = await sql`SELECT * FROM AbilityInfo WHERE ViableRaces LIKE ${racestring}`;
      } else if (Reactive) {
          res = await sql`SELECT * FROM AbilityInfo WHERE IsReactive=${Reactive}`;
      }
      else {
        res = await sql`SELECT * FROM AbilityInfo ORDER BY viableraces`;
      }
  
      return response.status(200).json({ res });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ error });
    }
  }