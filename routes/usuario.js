const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Usuario')
const Usuario = mongoose.model('usuarios');

const bcrypt = require('bcryptjs');

const passport = require('passport');

router.get('/registro', function(req, res){
    res.render('usuario/registro')
})

router.post('/registro', function(req, res){
    var erros = [];
    if(!req.body.nome || req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome invalido'})
    }
    if(!req.body.email || req.body.email == undefined || req.body.email == null){
        erros.push({texto:'Email invalido'});
    }
    if(!req.body.senha || req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: 'Senha invalido'});
    }
    if(req.body.senha.length < 4){
        erros.push({texto: 'Senha muito fraca'})
    }
    if(req.body.senha != req.body.senha2){
        erros.push({texto: 'Senha nao coincidem'})    
    }

    if(erros.length > 0){
        res.render('usuario/registro', {erros: erros});
    }else{
        Usuario.findOne({email: req.body.email}).then(function(usuario){
            if(usuario){
                req.flash('error_msg','Ja existe um usuaio com este email')
                res.redirect('/usuario/registro')
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro){
                            req.flash('error_msg','Erro durente o salvamento')
                            res.redirect('/');
                        }else{
                            novoUsuario.senha = hash;
                            novoUsuario.save().then(() =>{
                                req.flash('success_msg','Salvo com sucesso')
                                res.redirect('/')
                            }).catch((erro) =>{
                                console.log('errado '+erro)
                                req.flash('error_msg','Erro ao criar usuario')
                                res.redirect('/usuario/registro')
                            });
                        }
                    })
                })
                usuario.nome = req.body.nome
                usuario.email = req.body.email
                usuario.senha = req.body.senha

            }

        }).catch(function(err){

        })
    }

})

router.get('/login', function(req, res){
    res.render('usuario/login')
})

router.post('/login', function(req, res, next){
    passport.authenticate('local',{
        successRedirect: '/',
        failureRedirect:'/usuario/login', 
        failureFlash: true
    })(req, res, next)
})

router.get('/logout', function(req, res){
    req.logout()
    req.flash('success_msg', 'Deslogou com sucesso')
    res.redirect('/')
})

module.exports = router;