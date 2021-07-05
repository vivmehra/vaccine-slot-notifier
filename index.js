const gTTS = require('gtts');
const express = require('express');
const fs = require('fs');
let fetch = require('node-fetch');
const { resolve } = require('path');
const player = require('play-sound')();
const { execFile } = require('child_process');
const moment = require('moment');
// player.play('alert.mp3', (err) => {
//     if (err) console.log(`Could not play sound: ${err}`);
// });
let milgaya = false;

const  app = express();

const textToSpeech = (slotAvailable, hospitalName)=>{
    var speech = `Rangareddy ${hospitalName} me Covaxin first dose k ${slotAvailable} slots available hain`;
    var gtts = new gTTS(speech, 'hi');
    var textConverted = false;

    gtts.save('alert.mp3', function (err, result){
        if(err) { throw new Error(err); }
        textConverted = true;
        console.log("Text to speech converted!"); 
    });
    
};
const playNotification = () =>{
    console.log('playing sound');
    console.log('milgayamilgayamilgaya', milgaya);
    if(milgaya){
        player.play('./alert.mp3', (err) => {
            if (err) console.log(`Could not play sound: ${err}`);
        });
    }
    
}
const getVaccineStatus = async () =>{
    const todayDate = moment().format('DD-MM-YYYY');
    return fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=603&date=${todayDate}`, { //603, 581
        method: 'GET',
        headers: {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'},
    }).then(response => response.json()).then(data=>data)
    .catch(err => {console.log(err)});
}
const checkRainbowKondapur = async (allData)=>{
    let slotAvailable = false;
    let hospitalName = '';
    allData.map((center)=>{
        // if(center['center_id'] === 607928 || center['center_id'] === 718479 ){ // 703713
            center.sessions.map(slot=>{
                // console.log('slot', slot);
                if(slot.vaccine === 'COVAXIN' && slot.available_capacity_dose1 > 0){
                    console.log('slot$$$$$$$$$$', slot);
                    console.log('hospital name============>', center.name);
                    slotAvailable = slot.available_capacity_dose1;
                    hospitalName = center.name
                }
            })
        // }
    })
    return {slotAvailable,hospitalName};
}
const createMp3 = async ()=>{
    let myVar = setInterval(async () =>{
        let rangareddeyData = await getVaccineStatus();
        let obj = await checkRainbowKondapur(rangareddeyData.centers);
        console.log('slotAvailable', obj);
        if(obj.slotAvailable){
           textToSpeech(obj.slotAvailable, obj.hospitalName);
           clearInterval(myVar);
        }
    }, 10000); 
}


function runMp3(){
    createMp3();
    const path = './alert.mp3'
    if (fs.existsSync(path)){
        fs.unlink(path,function(err){
            if(err) return console.log(err);
            console.log('file deleted successfully');
       });
    }  
    let myVar = setInterval(()=>{
        try {
            if (fs.existsSync(path)) {
              //file exists
              console.log('file found')
              player.play('alert.mp3', (err) => {
                if (err) console.log(`Could not play sound: ${err}`);
            });
            clearInterval(myVar);
            }
          } catch(err) {

            console.error('err@@@@', err)
          }
    }, 12000)    
}
runMp3();

 