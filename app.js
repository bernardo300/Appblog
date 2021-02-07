const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');

const admin = require('./routes/admin');
const usuario = require('./routes/usuario');
require('./models/Postagem')
const Postagem = mongoose.model('postagens');
require('./models/Categoria')
const Categoria = mongoose.model('categorias');

const passport = require('passport')
require('./config/auth')(passport)

const db = require('./config/db')


const app = express();
//configuracoes
    //session
    app.use(session({
        secret: 'cursodenode',
        resave: true,
        saveUninitialized: true
    }))

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash())

    //middleware
    app.use((req, res, next) =>{
        res.locals.success_msg = req.flash('success_msg');
        res.locals.error_msg = req.flash('error_msg');
        res.locals.error = req.flash('error');
        res.locals.user = req.user || null;
        next();
    })

    //body-parseer
    app.use(bodyParser.urlencoded({extension: true}));
    app.use(bodyParser.json());
    
    //handlebars
    app.engine('handlebars', handlebars({defaultLayout: 'main'}));

    app.set('view engine', 'handlebars');
    
    //monggose
    
    mongoose.Promise = global.Promise
    var urlLocal = "mongodb://localhost/appblog"
    var urlRemoto = "mongodb+srv://Blog:kennedy@cluster0.qodti.mongodb.net/appblog?retryWrites=true&w=majority"
    /*
    mongoose.connect(urlLocal).then(()=>{
            console.log('Mongoose conectado')
        }).catch((erro)=>{
            console.log(erro);
        });
    */
   //CONFIGURAÇÃO PADRÃO DO MONGODB
    mongoose.Promise = global.Promise;
    mongoose.connect(db.mongoURI, {
        useNewUrlParser:true, useUnifiedTopology: true
    }).then(function() {
        console.log("MongoDB Conectado...")
    }).catch(function(err){
        console.log("Houve um erro ao se conectar ao MongoDB: "+err)
    })

    //public
    app.use(express.static(path.join(__dirname, 'public')));

//rotas
app.use('/admin', admin)
app.use('/usuario', usuario);

app.get('/', function(req, res){
    Postagem.find().populate('categoria').lean().sort({data : 'desc'}).then(function(postagens){
        res.render('index', {postagens: postagens})

    }).catch(function(erro){
        req.flash('error_msg', 'Houve um erro ao listar postagens')
        res.redirect('/404')

    })  
})
app.get('/404', function(req, res){
    res.send('Erro 404')
})

app.get('/postagem/:slug', function(req, res){
    Postagem.findOne({slug: req.params.slug}).lean().then(function(postagem){
        if(postagem){
            res.render('postagem/index', {postagem: postagem})
        }else{
            req.flash('error_msg','postagem nao encontrada')
            res.redirect('/')
        }

    }).catch(function(err){
        req.flash('error_msg','Houve um erros')

    })
})

 app.get('/categorias', function(req, res){
     Categoria.find().lean().then(function(categorias){
         res.render('categoria/index', {categorias: categorias});

     }).catch(function(err){
         req.flash('error_msg', 'Erro ao carregar pagina')
         res.redirect('/')

     })

 })

 app.get('/categoria/:slug', function(req, res){
     Categoria.findOne({slug: req.params.slug}).lean().then(function(categoria){
         if(categoria){
             Postagem.find({categoria: categoria._id}).lean().then(function(postagens){
                 res.render('categoria/postagens', {postagens: postagens, categoria: categoria});

             }).catch(function(err){
                 req.flash('error_msg','Erro ao listar postagns')
                 res.redirect('/');
             })
         }else{
            req.flash('error_msg', 'Categoria nao existe')
            res.redirect('/');
         }

     }).catch(function(err){
         req.flash('error_msg', 'Erro ao carregar postagens')
         res.redirect('/');
     })
 })


//outras
const PORTAL = process.env.PORT || 3000
app.listen(PORTAL, ()=>{
    console.log('Servidor rodando')
})