const express = require('express')
const cors = require('cors') 
require("dotenv").config();
const port = process.env.PORT || 3000;

app = express()

// middle  wear 
app.use(express.json())
app.use(cors())

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =`mongodb+srv://${process.env.User_Name}:${process.env.PassWord}@cluster0.34ihq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('App is running into your port')
})
app.listen(port,()=>{
    console.log(`job is waiting at ${port}`)
} )