const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// মিডলওয়্যার (Middleware)
app.use(cors());
app.use(express.json({ limit: '10mb' })); // ছবির সাইজ লিমিট

// ডাটাবেস কানেকশন স্ট্রিং (.env ফাইল থেকে আসবে)
const uri = process.env.DB_URL;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // সার্ভারের সাথে ক্লায়েন্ট কানেক্ট করা
    await client.connect();
    
    // কানেকশন ঠিক আছে কি না তা চেক করতে একটি পিং (ping) পাঠানো
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // ডাটাবেস এবং কালেকশন রেফারেন্স
    const database = client.db("cattleFarmDB");
    const cattleCollection = database.collection("cattles");
    
    // --- নতুন: ব্যবহারকারীদের (Users) কালেকশন ---
    const userCollection = database.collection("users");


    // ==========================================
    //         গরুর (Cattle) API সমূহ
    // ==========================================

    // ১. GET API (সব গরুর ডেটা পড়ার জন্য)
    app.get('/cattles', async (req, res) => {
      const result = await cattleCollection.find().toArray();
      res.send(result);
    });

    // ২. POST API (নতুন গরু যুক্ত করার জন্য)
    app.post('/cattles', async (req, res) => {
      const newCattle = req.body;
      const result = await cattleCollection.insertOne(newCattle);
      res.send(result);
    });

    // ৩. DELETE API (গরু মুছে ফেলার জন্য)
    app.delete('/cattles/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cattleCollection.deleteOne(query);
      res.send(result);
    });


    // ==========================================
    //       ব্যবহারকারী (Users) API সমূহ
    // ==========================================

    // ১. GET API (অ্যাডমিন ড্যাশবোর্ডে সব ইউজারদের দেখার জন্য)
    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // ২. POST API (অ্যাডমিন যখন নতুন কর্মী/শেয়ারহোল্ডার যোগ করবেন)
    app.post('/users', async (req, res) => {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });

    // ৩. DELETE API (অ্যাডমিন চাইলে কোনো ইউজারকে রিমুভ করতে পারবেন)
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    // ৪. PUT API (ব্যবহারকারীর যেকোনো তথ্য আপডেট করার জন্য)
    app.put('/users/:id', async (req, res) => {
      const id = req.params.id;
      const updatedUser = req.body;
      
      // MongoDB তে _id আপডেট করা যায় না, তাই ডেটাবেসে পাঠানোর আগে সেটি ডিলিট করে দিচ্ছি
      delete updatedUser._id; 
      
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          ...updatedUser // ফ্রন্টএন্ড থেকে যা যা ডেটা আসবে, সব আপডেট হয়ে যাবে
        },
      };

      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result);
    });

  } finally {
    // সার্ভার অন রাখতে এটি কমেন্ট আউট রাখা ভালো
    // await client.close(); 
  }
}
run().catch(console.dir);

// সার্ভার ঠিকমতো চলছে কি না তা দেখার জন্য বেসিক রুট
app.get('/', (req, res) => { 
  res.send('Cattle Farm Server is Running Successfully!'); 
});

app.listen(port, () => { 
  console.log(`Server is running on port: ${port}`); 
});