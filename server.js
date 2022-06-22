const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs')
app.use(express.static('src'))
require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session()); 

let db;
MongoClient.connect(process.env.DB_URL, { useUnifiedTopology: true }, function (err, client) {
	if (err) return console.log(err)
	db = client.db('doapp');

	app.listen(process.env.PORT, function () {
		console.log('listening on ' + process.env.PORT)
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

app.get('/post/:id', (req,res)=>{
    let {id} = req.params;

    db.collection('post').findOne({_id : parseFloat(id)}, function(err,result){
        console.log(result)
        res.render('post.ejs', {post : result})
    })
})

app.put('/post', (req,res)=>{
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

app.post('/login', passport.authenticate('local',{
    failureRedirect : 'fail'
}), function(req,res){
    res.redirect('/')
})

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
  }, function (입력한아이디, 입력한비번, done) {
    //console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
      if (에러) return done(에러)
  
      if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
      if (입력한비번 == 결과.pw) {
        return done(null, 결과)
      } else {
        return done(null, false, { message: '비번틀렸어요' })
      }
    })
  }));