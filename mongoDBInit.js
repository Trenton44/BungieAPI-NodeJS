const root = __dirname;
const path = require("path");
const dotenv = require("dotenv");
dotenv.config( { path: path.join(root,"process.env") } );
const mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://Revomage44:<hs83j0DY1eNglkRy>@cluster0.hjydh.mongodb.net/<users>?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
/*client.connect(err => {
  if(err){
    throw err;
  }
  const collection = client.db("users").collection("Sessions");
  console.log(collection);
  // perform actions on the collection object
  client.close();
});*/
client.connect(err => {
  sessionIdStore = client.db("users").collection("Sessions");
  var obj = {sessionID: "123", data:"jlfkdsa;jfds"};
  sessionIdStore.insertOne(obj,function(error,result){
    //if(error){ throw error; }
    console.log(result);
  });
  // perform actions on the collection object
});
