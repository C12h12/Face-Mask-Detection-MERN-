//final code which runs the notebook using express.js
import express from 'express';
import { spawn } from 'child_process';
import cors from 'cors';
import mongoose from "mongoose";
import dotenv from "dotenv";
import { timeStamp } from "console";


const app=express();
app.use(cors());
dotenv.config();  //loading .env file

//creating variables
const PORT=process.env.PORT ||7000;
const MONGO_URL=process.env.MONGO_URL;

mongoose.connect(MONGO_URL).then(()=>{
    console.log("Database has been connected Successfully");
    //also starting the express server
    });


//schema(structure)
const userschema=new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    status:String,
    confidence:Number,
    //image_path:String,
    
});


//creating model(table)-user1
const usermodel=mongoose.model('logs',userschema);

app.get('/image',async (req, res) => {
    const pythonProcess = spawn("C:\\allenvs\\MERN\\react,express,mongodb,python\\express\\python\\venv1\\Scripts\\python.exe", ['C:\\Users\\Chaitanya\\Desktop\\projects\\express\\python\\Face-Mask-Detection-master\\detect_mask_video.py']);


    // Handle errors if Python script fails
    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python script executed with exit code ${code}`);
    });

    
    //displaying  mongodb 
    try {
        const info=await usermodel.find();  //whole data is fetched
        res.json(info);
        //res.json({ message: "Hello from Express Server!" });  //always json for displaying on react,and only one res can be send
    


    } catch (error) {
        res.status(500).json({ error: error });
    }
});
    

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
