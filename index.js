const express = require('express')
const cors = require('cors') 
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;

app = express()

// middle  wear 
app.use(express.json())
app.use(cors())

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
    // *jobs Collection
    const jobCollection = client.db('jobsPortal').collection('jobs')
    const jobApplicationCollection = client
      .db("jobsPortal")
      .collection("job_applications");
    //! create job array 
    app.get('/jobs', async(req, res)=>{
      const cursor = jobCollection.find()
      const result= await cursor.toArray()
     res.send(result);
    })
    // !jobs details API 
    app.get('/jobs/:id', async(req, res)=>{
      const id = req.params.id 
      const query = {_id: new ObjectId(id) }
      const result = await jobCollection.findOne(query)
      res.send(result)
    })
    //! user Applications API 
    app.post('/job_applications', async(req, res)=>{
      const application = req.body 
      const result = await jobApplicationCollection.insertOne(application)
      res.send(result)
    })


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