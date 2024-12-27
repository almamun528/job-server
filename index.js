const express = require("express");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app = express();
const port = process.env.PORT || 3000;

// middle  wear
app.use(cors({ origin: ["http://localhost:5173"], credentials:true }));
app.use(express.json());
app.use(cookieParser()); // Parse cookies from incoming requests
// const logger= (req, res, next)=>{
//   console.log('inside the logger', )
//   next()
// }
const verifyToken = (req, res, next)=>{
  const token = req?.cookies?.token 
  if(!token){
    return res.status(401).send({message:'unAuthorize Access'})
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded)=>{
    if(err){
      return res.status(401).send({message:'unAuthorize access'})
    }
    req.user= decoded 
    next()
  })
}
const uri = `mongodb+srv://${process.env.User_Name}:${process.env.PassWord}@cluster0.34ihq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const jobCollection = client.db("jobsPortal").collection("jobs");
    const jobApplicationCollection = client
      .db("jobsPortal")
      .collection("job_applications");
    // !Auth Related APIs
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.login(process.env.JWT_SECRET, { expiresIn: "5h" });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
        })
        .send({ success: true });
    });
    //! create job array
    app.get("/jobs", async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (email) {
        query = { hr_email: email };
      }

      const cursor = jobCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    // !jobs details API
    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.findOne(query);
      res.send(result);
    });
    // !hr create Job
    app.post("/jobs", async (req, res) => {
      const newJob = req.body;
      const result = await jobCollection.insertOne(newJob);
      res.send(result);
    });
    //! user Applications API
    app.post("/job_applications", async (req, res) => {
      const application = req.body;
      const result = await jobApplicationCollection.insertOne(application);
      const id = application.job_id;
      const query = { _id: new ObjectId(id) };
      const job = await jobCollection.findOne(query);
      let newCount = 0;
      if (job.application) {
        newCount = job.application + 1;
      } else {
        newCount = 1;
      }
      // now update the job info
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: { application: newCount },
      };
      const updateResult = await jobCollection.updateOne(filter, updatedDoc);

      res.send(result);
    });
    // ! Apis of all Applications where user applied // ei api te ase 1 ta job e koto gula user apply korse.
    app.get("/job_applications/job/:job_id", async (req, res) => {
      const jobId = req.params.job_id;
      const query = { job_id: jobId };
      const result = await jobApplicationCollection.find(query).toArray();
      res.send(result);
    });

    // ! Show the application into client side
    app.get("/job_application",verifyToken, async (req, res) => {
      const email = req.query.email;

      // !cookies 
      console.log('cookies -> ', req.cookies)
      // ?

      const query = { applicant_email: email };
      const applications = await jobApplicationCollection.find(query).toArray();
      if(req.user.email !== req.query.email){
// console.log('hello')
return res.status(403).send({message:'Forbidden'})
      }
      for (const application of applications) {
        const job = await jobCollection.findOne({
          _id: new ObjectId(application.job_id),
        });
        if (job) {
          application.title = job.title;
          application.company = job.company;
          application.company_logo = job.company_logo;
          application.location = job.location;
        }
      }
      res.send(applications);
    });
    // ! update data Api for VewApplications page
    app.patch("job_applications", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: data.status,
        },
      };
      const result = await jobApplicationCollection.updateOne(
        filter,
        updatedDoc
      );
      res.send(result);
    });
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

app.get("/", (req, res) => {
  res.send("App is running into your port");
});
app.listen(port, () => {
  console.log(`job is waiting at ${port}`);
});