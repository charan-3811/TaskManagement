const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const cors = require('cors');
const PORT = 3050;

app.use(bodyParser.json());

const corsOptions = {
    origin: 'http://localhost:5173',
};

app.use(cors(corsOptions));

const uri =
    'mongodb+srv://mchs109872001:Cherry@cluster0.bp4gady.mongodb.net/?retryWrites=true&w=majority';

const client = new MongoClient(uri);

let myColl;

async function connect() {
    const myDB = await client.db('TaskManager');
    myColl = await myDB.collection('tasks');
    console.log('connected to db');
}

connect().then();

app.listen(PORT, () => {
    console.log('connected');
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/view', async function (req, res) {
    let filter = {};
    if (req.query.status) {
        if (req.query.status === 'Completed') {
            filter.completed = true;
        } else if (req.query.status === 'Not Completed') {
            filter.completed = { $ne: true };
        }
    }

    let x = await myColl.find(filter).toArray();
    res.send(x)
});

app.post('/add', async (req, res) => {
    const dataFromFrontend = await req.body;
    res.send('Data received successfully');
    const date = new Date();
    const formattedDate = date.toLocaleDateString();
    await myColl.insertOne({ name: dataFromFrontend.name, date: formattedDate, completed: false });
});

app.post('/updateStatus', async function (req, res) {
    const { id, completed } = req.body;
    await myColl.updateOne({ _id: new ObjectId(id) }, { $set: { completed } });
    res.send('Success updated!');
});

app.post('/delete', async function (req, res) {
    const taskId = req.body.id;
    await myColl.deleteOne({ _id: new ObjectId(taskId) }, function (err) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.send('Successfully deleted!');
        }
    });
});

app.post('/updateTask', async function (req, res) {

    await myColl.findOneAndUpdate(
        { _id: new ObjectId(req.body.id) },
        { $set: { name: req.body.name } },
        function () {
            res.send('Success updated!')
        }
    )
})

app.post('/reorder', async (req, res) => {
    const { taskOrder } = req.body;

    try {
        // Loop through the taskOrder array and update the order in the database
        for (let i = 0; i < taskOrder.length; i++) {
            const taskId = taskOrder[i];
            await myColl.updateOne(
                { _id: new ObjectId(taskId) },
                { $set: { order: i + 1 } } // Assuming 'order' is a field in your collection to store the order
            );
        }

        res.json({ success: true, message: 'Tasks reordered successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});