const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const admin = require("firebase-admin");
require('dotenv').config()

const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0s4gz.mongodb.net/burj-al-arab?retryWrites=true&w=majority`;

app.use(cors());
app.use(bodyParser.json());


const serviceAccount = require("./config/burja-al-arab-firebase-adminsdk-ripbe-4ee9f2a833.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// const passWord = 'Y58KMgLTW0e4dHEf'
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const collection = client.db("burj-al-arab").collection("bookings");

  app.post("/addBooking", (req, res) => {
    const bookings = req.body;
    collection.insertOne(bookings).then((result) => {
      res.send(result.insertedCount > 0);
    });
    //   console.log(bookings)
  });

  app.get("/bookings", (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];
    //   console.log({idToken})
      admin.auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          if(tokenEmail == req.query.email){
            collection.find({email: req.query.email})
            .toArray((err,documents) =>{
                res.status(200).send(documents)
            })
          }
          else{
            res.status(401).send('Unathorize access')
          }
        })
        .catch((error) => {
            res.status(401).send('Unathorize access')
        });
    }
    else{
        res.status(401).send('Unathorize access')
    }
  });
});

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(5000);
