const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs')
app.use(express.static('src'))
const MongoClient = require('mongodb').MongoClient;

let db;
MongoClient.connect('mongodb+srv://1234:1234@cluster0.0f9rg.mongodb.net/?retryWrites=true&w=majority', { useUnifiedTopology: true }, function (err, client) {
	if (err) return console.log(err)
	db = client.db('doapp');

	app.listen(8080, function () {
		console.log('listening on 8080')
	});
});

app.get('/', (req,res)=>{
    res.render('index.ejs')
})

app.get('/newpost', (req,res)=>{
    res.render('newpost.ejs')
})

app.post('/newpost', (req,res)=>{

    let {title, work} = req.body;

    db.collection('count').findOne({name : 'count'}, function(err,result){

        var obj = {
            _id : result.number,
            title,
            content: work,
        }

        db.collection('post').insertOne(obj, function(err,result){
            db.collection('count').updateOne({name : 'count'}, {$inc : {number : 1}}, function(err,result){

                res.redirect('/list')
            })
        })

    })

   
})

app.get('/list', (req,res)=>{
    db.collection('post').find().toArray(function(err, result){
        res.render('list.ejs', { posts : result })
    })
})

app.get('/detail/:id', (req,res)=>{
    let {id} = req.params;

    db.collection('post').findOne({_id : parseFloat(id)}, function(err,result){
        console.log(result)
        res.render('detail.ejs', {post : result})
    })
})

app.put('/detail', (req,res)=>{
    console.log(req.body)

    db.collection('post')
    .updateOne({_id : parseInt(req.body.id)} , {$set : {title : req.body.title, content : req.body.work}}, function(err,result){
        res.status(200).send('success')
        console.log(result)
    })

})

app.delete('/post-delete', (req,res)=>{
    
    console.log(req.body)

    db.collection('post').deleteOne({_id : parseInt(req.body.id)}, (err,result)=>{

        res.send('삭제')
    })
})