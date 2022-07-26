const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv').config();
const fileUpload = require('express-fileupload');
const ObjectId = require('mongodb').ObjectId;

const app = express()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.41bbapx.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const database = client.db("beautyBlogs");
        console.log("Database Connected");
        const blogsCollation = database.collection('blogs');

        // POST API BLOGS
        app.post('/createBlogs', async (req, res) => {
            const name = req.body.name;
            const tittle = req.body.tittle;
            const photo = req.body.photo;
            const dec = req.body.dec;
            const time = req.body.time;
            const pic = req.files.image;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const imageBuffer = Buffer.from(encodedPic, 'base64');
            const blogsCreate = {
                name,
                tittle,
                dec,
                time,
                photo,
                image: imageBuffer
            }
            const result = await blogsCollation.insertOne(blogsCreate);
            res.json(result);
        });

        // GET API
        app.get('/blogs', async (req, res) => {
            const cursor = blogsCollation.find({});
            const result = await cursor.toArray();
            res.json(result)
        });

        // GET API ID
        app.get('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await blogsCollation.findOne(query);
            res.json(result);
        })


    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('CRUD Server Running in  Web')
})

app.listen(port, () => {
    console.log(`Server Running on port ${port}`)
});