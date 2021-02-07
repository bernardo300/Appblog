const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
require('../models/Postagem')

const Categoria = mongoose.model('categorias');
const Postagem = mongoose.model('postagens')

const {eAdmin} = require('../helpers/eAdmin')

router.get('/', function(req, res){
    res.render('admin/index');
})

//categorias
router.get('/categorias', eAdmin, function(req, res){
    Categoria.find().sort({date:'desc'}).lean().then((categorias)=>{
        res.render('admin/categorias',{categorias: categorias});
    }).catch((erro)=>{
        req.flash('error_msg', 'Houve um erro ao listar caterias');
        res.redirect('/');
    })
});

router.get('/addcategorias', eAdmin, function(req, res){
    res.render('admin/addcategorias');
});

router.post('/categoria/nova', eAdmin, function(req, res){

    var erros = []
    if(!req.body.nome || req.body.nome == undefined  || req.body.nome == null){
        erros.push({texto: 'Nome invalido'});
    }
    if(!req.body.slug || req.body.slug == undefined  || req.body.slug == null){
        erros.push({texto: 'Slug invalido'});
    }
    if(req.body.nome.length < 2){
        erros.push({texto: 'Nome da categoria muito pequeno'})
    }
    if (erros.length > 0){
        console.log(erros)
        res.render('admin/addcategorias', {erros : erros});
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(()=> {
            req.flash('success_msg', 'Categoria criada com sucesso')
            res.redirect('/admin/categorias');
        }).catch((erro)=>{
            req.flash('error_msg', 'houve um erro ao salvar categoria')
            res.redirect('/admin');
        });
    }
});

router.get('/categoria/edit/:id', eAdmin, function(req, res) {
    Categoria.findOne({_id : req.params.id}).lean().then((categoria) => {
        res.render('admin/editcategoria',{categoria : categoria});
    }).catch((erro)=>{
        req.flash('error_msg', 'Categoria nao encontrada')
        res.redirect('/admin/categorias');
    });   
});

router.post('/categoria/edit', eAdmin, function(req, res){
    Categoria.findOne({_id : req.body.id}).then((categoria)=>{
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(function(){
            req.flash('success_msg', 'Categoria editada com sucesso')
            res.redirect('/admin/categorias');

        }).catch(function(erro){
            req.flash('error_msg', 'Erro interno')
            res.redirect('/admin/categorias');

        })

    }).catch(function(erro){
        console.log(req.body.id)
        console.log(req.body.nome)
        console.log(req.body.slug)
        req.flash('error_msg', 'Categoria nao encontrada '+erro)
        res.redirect('/admin/categorias');
    })
    
});

router.post('/categoria/deletar',eAdmin, function(req, res) {
    Categoria.remove({_id: req.body.id}).then(()=> {
        req.flash('success_msg', 'Categoria Deletada co sucesso')
        res.redirect('/admin/categorias')
    }).catch(function(erro){
        req.flash('error_msg', 'Errro ao deletar')
        res.redirect('/admin/categorias')

    })

})



//radio



//postagens
router.get('/postagens', eAdmin, function(req, res){
    Postagem.find().populate('categoria').lean().sort({data: 'desc'}).then((postagens)=>{
        res.render('admin/postagens',{postagens: postagens});
    }).catch(function(err){
        req.flash('error_msg', 'Erro as listar postagens')
        res.render('admin/postagens');
    })
})

router.get('/addpostagem', eAdmin, function(req, res){
    Categoria.find().lean().then(function(categorias){
        res.render('admin/addpostagens', {categorias: categorias});
    }).catch(function(erro){
        req.flash('error_msg', 'Error abrir formulario')
        res.redirect('/admin', {categorias: categorias});
    })
})

router.post('/postagem/nova', eAdmin, function(req, res){
    
    var erros = []
    if(!req.body.titulo || req.body.titulo == undefined  || req.body.titulo == null){
        erros.push({texto: 'Nome invalido'});
    }
    if(!req.body.slug || req.body.slug == undefined  || req.body.slug == null){
        erros.push({texto: 'Slug invalido'});
    }
    if(req.body.titulo.length < 2){
        erros.push({texto: 'Nome da categoria muito pequeno'})
    }
    if(req.body.categoria == '0'){
        erros.push({texto: 'Categoria invalida'})
    }
    if (erros.length > 0){
        console.log(erros)
        res.render('admin/addpostagens', {erros : erros});
    }else{
        const novaPostagen =  {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }
        new Postagem(novaPostagen).save().then(()=> {
            req.flash('success_msg', 'Postagem criada com sucesso')
            res.redirect('/admin/postagens');
        }).catch((erro)=>{
            req.flash('error_msg', 'houve um erro ao salvar postagem ')
            res.redirect('/admin/postagens');
        });
    }
})

router.get('/postagem/edit/:id', eAdmin, function(req, res) {
    Postagem.findOne({_id: req.params.id}).populate('categoria').lean().then(function(postagem) {
        Categoria.find().lean().then(function(categorias) {
            res.render('admin/editpostagem', {postagem: postagem, categorias: categorias});
        }).catch(function(erro){
            req.flash('error_msg', 'Erro ao listar categorias')
            res.redirect('/admin/postagens')

        })
    }).catch(function(err) {
        req.flash('error_msg','Erro ao carregar postagem '+err)
        console.log(err)
        res.redirect('/admin/postagens')
    })
})

router.post('/postagem/edit', eAdmin, function(req, res) {
    Postagem.findOne({_id:req.body.id}).then(function(postagem) {
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(function (){
            req.flash('success_msg','Postagem editada com sucesso')
            res.redirect('/admin/postagens')

        }).catch(function(erro){
            req.flash('error_msg','Erros ao editar')
            res.redirect('/admin/postagens')
        })

    }).catch(function(erro){
        req.flash('error_msg','Erros ao procurar postagem')
        res.redirect('/admin/postagens')

    })
})

router.post('/postagem/deletar', eAdmin, function(req, res) {
    Postagem.remove({_id:req.body.id}).then(function(){
        req.flash('success_msg','Deletado')
        res.redirect('/admin/postagens')
    }).catch(function(erro){
        req.flash('error_msg','Erro ao deletar')
        res.redirect('/admin/postagens')
    })
})

module.exports = router;

