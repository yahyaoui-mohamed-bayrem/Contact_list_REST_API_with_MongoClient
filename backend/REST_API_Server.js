const express = require('express');
const { MongoClient, ObjectID } = require('mongodb');
const bodyParser = require('body-parser');
const assert =require('assert');
const REST_API_Server = express();
REST_API_Server.use(bodyParser.json());
REST_API_Server.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
      )
      if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
})
MongoClient.connect('mongodb://localhost:27017',{ useUnifiedTopology: true }, (err, client)=>{
    assert.equal(err,null,'DB connection failed')
    const db = client.db("REST_API_db")

    REST_API_Server.post('/newContact', (req, res)=>{
        db.collection('contacts').insertOne(req.body, (err, data)=>{
            err ? res.send('adding err:'+err) : res.send(data)
        })
    })
    REST_API_Server.get('/contacts/all', (req, res)=>{
        db.collection('contacts').find().toArray((err, data)=>{
            err ? res.send(('fetching err:'+err)) : res.send(data)
        })
    })
    REST_API_Server.get('/contacts/fetchOneByID/:id', (req, res)=>{
        let searchID= ObjectID(req.params.id);
        db.collection('contacts').findOne(searchID, (err, data)=>{
            err ? res.send('id fetch err:'+err) : res.send(data)
        })
    })
    REST_API_Server.put('/modifyContact/:id', (req, res)=>{
        let id = ObjectID(req.params.id);
        db.collection('contacts').findOneAndUpdate({_id: id}, {$set:{...req.body}}, (err, data)=>{
            err ? res.send('modifying err:'+err) : res.send('modified successefully')
        })
    })
    REST_API_Server.delete('/deleteContact/:id', (req, res)=>{
        let id = ObjectID(req.params.id);
        db.collection('contacts').findOneAndDelete({_id: id}, (err, data)=>{
            err ? res.send('delete err: '+err) : res.send('deleted successefully')
        })
    })
})

REST_API_Server.listen(3001, err => err ? console.log('sever error: '+err):console.log('server running p 3001'))