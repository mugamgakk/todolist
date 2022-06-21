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
    console.log(req.body)
})

app.get('/list', (req,res)=>{
    db.collection('post').find().toArray(function(에러, 결과){
        // console.log(결과)
        res.render('list.ejs', { posts : 결과 })
    })
})