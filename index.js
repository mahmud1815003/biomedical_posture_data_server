const express = require("express");
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const axios = require('axios');
 
const blinkLink1 = 'https://blynk.cloud/external/api/get?token=Yorqy8VNfD948Uoft06ZzO7YXUPbR5dd&v4'
const blinkLink2 = 'https://blynk.cloud/external/api/get?token=Yorqy8VNfD948Uoft06ZzO7YXUPbR5dd&v5'
const threshold = 430;
 // is for good posture;
const sensorCheck = 1000 //Blynk
const minutes = 1 //Minutes
const dataSend = parseInt(60 * 1000 * minutes); //Spreadshset
//const dataSend =  2000; //Spreadshset
 
app.get('/', (req, res) => {
    res.send("Hello My Project Name");
})
 
const good = "good_posture (per 1 min)";
const bad = "bad_posture (per 1 min)"
 
 
const ara = [0, 0];
let sum = 0;
let counter = 1;
const min = 5;
 
const getDataFromBlynk = async () => {
    try {
        const res1 = await axios.get(blinkLink1);
        // const res2 = await axios.get(blinkLink2);
        console.log(res1.data);
        // console.log(res2.data);
        sum+=res1.data;
        if (res1.data > threshold) {
            ara[0]++;
        } else {
            ara[1]++;
        }
    } catch (error) {
        console.log('Error is: ' + error);
    }
 
}
 
const sendDataToSpreadSheet = async () => {
    try {
        const a = ara[0];
        const b = ara[1];
        // const res = await axios.post(process.env.sheet_link, {
        //     data: {
        //         [good]: a,
        //         [bad]: b,
        //     }
        // });
        const message = (counter%min == 0 && counter != 0) ? `Good Postures: ${a} times\nBad Postures: ${b} times\nAverage of ${min} Minutes: ${sum/(counter*min)}` : `Good Postures: ${a} times\nBad Postures: ${b} times`;
        const result = await axios.post(`https://api.telegram.org/bot${process.env.bot_token}/sendMessage?chat_id=${process.env.bot_user}&text=${encodeURI(message)}`);
        ara[0] = 0;
        ara[1] = 0;
        counter++;
    } catch (error) {
        console.log(error);
    }
}
 
setInterval(getDataFromBlynk, sensorCheck);
setInterval(sendDataToSpreadSheet, dataSend);
 
app.listen(process.env.port, () => {
    console.log(`Listening on port ${process.env.port}`);
})
