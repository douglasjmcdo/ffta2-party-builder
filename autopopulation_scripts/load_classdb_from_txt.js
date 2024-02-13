//Database Autoloader Version 2: more abstracted
//discovery: you cannot abstract column names without errors
//discovery 2: if you dont put in a delay between making the table and filling it, you may lose some rows to async
//Note that API endpoints will be disabled after use for security purposes
import * as fs from 'fs';

fs.readFile('ffta2classes.txt', 'utf8', (err, data) => {
if (err) {
    console.error(err);
}
const result = data.split(/\r?\n/);
let buf = "";
let apiurl = "";
let firstline = result[0];
for (let r of result) {
    buf = r.split(/\t/);
    if ( r == firstline ) {
        //setup db
        apiurl = "http://localhost:3000/api/create-class-table";
        fetch(apiurl).then((res) => {console.log(res);});
    } 
    else {
        //load data into db
        apiurl = "http://localhost:3000/api/add-classdata?ClassName="
         + buf[0] + "&ViableRaces=" + buf[1];
        //since 3rd column is optional, only call if data is provided
        if (buf[2]) {
            apiurl += "&DefaultSpriteForRace=" + buf[2];
        }
        fetch(apiurl).then((res) => {console.log(res.statusText)});
    }
}
});

