

//This worked for mass importing from tab-delimited txt!
//Now the API endpoint has since been disabled for security
import * as fs from 'fs';

fs.readFile('api/ffta2abilities.txt', 'utf8', (err, data) => {
if (err) {
    console.error(err);
}
const result = data.split(/\r?\n/);
let buf = "";
let apiurl = "";
for (let r of result) {
    buf = r.split(/\t/);
    if (buf[0] != "AbilityName" ) {
        apiurl = "http://localhost:3000/api/add-abilitydata?AbilityName=" 
                    + buf[0] + "&IsReactive=" + buf[1] + "&ViableRaces=" + buf[2];
        console.log(apiurl);
        fetch(apiurl);
    }
}
});

