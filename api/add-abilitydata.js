import { sql } from '@vercel/postgres';
 
export default async function handler(request, response) {
  try {
    const AbilityName = request.query.AbilityName;
    const IsReactive = request.query.IsReactive;
    const ViableRaces = request.query.ViableRaces;
    if (!AbilityName || !IsReactive || !ViableRaces) throw new Error('All fields required');
    //await sql`INSERT INTO AbilityInfo (AbilityName, IsReactive, ViableRaces) VALUES (${AbilityName}, ${IsReactive}, ${ViableRaces});`;
  } catch (error) {
    return response.status(500).json({ error });
  }
 
  const abilities = "This api is disabled but retained for documentation purposes" 
  //await sql`SELECT * FROM AbilityInfo;`
  ;
  return response.status(200).json({ abilities });
}

//http://localhost:3000/api/add-abilitydata?AbilityName=Bonecrusher&IsReactive=True&ViableRaces=0,1,5
//race order: hume bangaa numou viera moogle gria seeq
//filter on viableraces like so: select * from abilityinfo where viableraces like '%6%'