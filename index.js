import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import dayjs from "dayjs";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log(process.env.MONGO_URI);
const mongoClient = new MongoClient(process.env.MONGO_URI);

/*let db;
mongoClient.connect().then(() => {
    db = mongoClient.db('test');
});*/

app.post('/participants', async (req,res) => {
    try{
        await mongoClient.connect();
        const db = mongoClient.db('test');
        const {name} = req.body;
        const response = await db.collection('participantes').insertOne({name: name, lastStatus: Date.now()});
        res.sendStatus(201);
        mongoClient.close();
    }catch(error){
        console.error(err);
        res.sendStatus(422);
    }
});


app.get('/participants', async (req,res) => {
    try{
        await mongoClient.connect();
        const db = mongoClient.db('test');
        const response = await db.collection('participantes').find().toArray();
        res.send(response);
        mongoClient.close();
    }catch(error){
        console.error(err);
        res.sendStatus(422);
    }
});

app.post('/messages', async (req,res) => {
    try{
        await mongoClient.connect();
        const db = mongoClient.db('test');
        const {to, text, type} = req.body;
        const user = req.headers.user;
        const response = await db.collection('mensagens').insertOne({to: to, text: text, type: type, from: user, time: dayjs().format('HH:mm:ss')});
        res.sendStatus(201);
        mongoClient.close();
    }catch(error){
        console.error(err);
        res.sendStatus(422);
    }
});

app.get('/messages', async (req,res) => {
    try{
        await mongoClient.connect();
        const db = mongoClient.db('test');
        const response = await db.collection('mensagens').find().toArray();
        const newResponse = response.filter((msg) => {
            if(msg.from === req.headers.user || msg.to === req.headers.user || msg.to === 'Todos'){
                return msg;
            } 
        });
        if(!!req.query.limit){
            const limit = req.query.limit;
            res.send(newResponse.slice(-limit));
            console.log("Esse é o limite: "+limit);
        }

        res.send(newResponse);
        mongoClient.close();
    }catch(error){
        console.error(err);
        res.sendStatus(422);
    }
});

app.listen(5000, () => {
    console.log("Listening on 5000");
});