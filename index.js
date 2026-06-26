const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// মিডলওয়্যার (Middleware)
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
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // ==========================================
    //      ডাটাবেস এবং কালেকশন রেফারেন্স
    // ==========================================
    const database = client.db("cattleFarmDB");
    
    const cattleCollection = database.collection("cattles");
    const userCollection = database.collection("users");
    const saleCollection = database.collection("sales");
    const expenseCollection = database.collection("expenses");
    const incomeCollection = database.collection("incomes");
    const milkCollection = database.collection("milk_logs");
    
    // ── নতুন কালেকশন সমূহ (খাবার ও গুদাম) ──
    const inventoryCollection = database.collection("inventory");
    const feedLogCollection = database.collection("feed_logs");

    // ==========================================
    //         গরুর (Cattle) API সমূহ
    // ==========================================
    app.get('/cattles', async (req, res) => {
      const result = await cattleCollection.find().toArray();
      res.send(result);
    });

    app.post('/cattles', async (req, res) => {
      const newCattle = req.body;
      const result = await cattleCollection.insertOne(newCattle);
      res.send(result);
    });

    app.patch('/cattles/:id', async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      delete updatedData._id; 

      const query = { _id: new ObjectId(id) };
      const updateDoc = { $set: updatedData };
      const result = await cattleCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    app.delete('/cattles/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cattleCollection.deleteOne(query);
      res.send(result);
    });

    // ==========================================
    //         বিক্রি (Sales) API সমূহ
    // ==========================================
    app.get('/sales', async (req, res) => {
      const result = await saleCollection.find().toArray();
      res.send(result);
    });

    app.post('/sales', async (req, res) => {
      const result = await saleCollection.insertOne(req.body);
      res.send(result);
    });

    app.delete('/sales/:id', async (req, res) => {
      const id = req.params.id;
      const result = await saleCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // ==========================================
    //      খরচ ও আয় (Expenses & Incomes) API
    // ==========================================
    app.get('/expenses', async (req, res) => res.send(await expenseCollection.find().toArray()));
    app.post('/expenses', async (req, res) => res.send(await expenseCollection.insertOne(req.body)));
    app.delete('/expenses/:id', async (req, res) => res.send(await expenseCollection.deleteOne({ _id: new ObjectId(req.params.id) })));

    app.get('/incomes', async (req, res) => res.send(await incomeCollection.find().toArray()));
    app.post('/incomes', async (req, res) => res.send(await incomeCollection.insertOne(req.body)));
    app.delete('/incomes/:id', async (req, res) => res.send(await incomeCollection.deleteOne({ _id: new ObjectId(req.params.id) })));

    // ==========================================
    //         দুধের রেকর্ড (Milk Logs) API
    // ==========================================
    app.get('/milk_logs', async (req, res) => res.send(await milkCollection.find().toArray()));
    app.post('/milk_logs', async (req, res) => res.send(await milkCollection.insertOne(req.body)));
    app.delete('/milk_logs/:id', async (req, res) => res.send(await milkCollection.deleteOne({ _id: new ObjectId(req.params.id) })));

    // ==========================================
    // ── খাদ্য গুদাম (Inventory) API সমূহ ──
    // ==========================================
    app.get('/inventory', async (req, res) => res.send(await inventoryCollection.find().toArray()));
    
    app.post('/inventory', async (req, res) => res.send(await inventoryCollection.insertOne(req.body)));
    
    app.patch('/inventory/:id', async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      delete updatedData._id;
      const result = await inventoryCollection.updateOne({ _id: new ObjectId(id) }, { $set: updatedData });
      res.send(result);
    });

    app.delete('/inventory/:id', async (req, res) => res.send(await inventoryCollection.deleteOne({ _id: new ObjectId(req.params.id) })));

    // ==========================================
    // ── খাবারের দৈনিক হিসাব (Feed Logs) API ──
    // ==========================================
    app.get('/feed_logs', async (req, res) => res.send(await feedLogCollection.find().toArray()));
    app.post('/feed_logs', async (req, res) => res.send(await feedLogCollection.insertOne(req.body)));
    app.delete('/feed_logs/:id', async (req, res) => res.send(await feedLogCollection.deleteOne({ _id: new ObjectId(req.params.id) })));

    // ==========================================
    //         ব্যবহারকারী (Users) API সমূহ
    // ==========================================
    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.post('/users', async (req, res) => {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });

    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    app.put('/users/:id', async (req, res) => {
      const id = req.params.id;
      const updatedUser = req.body;
      delete updatedUser._id; 
      
      const query = { _id: new ObjectId(id) };
      const updateDoc = { $set: { ...updatedUser } };
      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result);
    });

  } finally {
    // await client.close(); 
  }
}
run().catch(console.dir);

app.get('/', (req, res) => { 
  res.send('Cattle Farm Server is Running Successfully!'); 
});

app.listen(port, () => { 
  console.log(`Server is running on port: ${port}`); 
});