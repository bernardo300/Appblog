const mongoose = require('mongoose');
//conecao
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/aprendendo').then(()=>{
    console.log('conectado')

}).catch((erro)=>{
    console.log(erro);
});

//model
const UsuarioSchema = mongoose.Schema({
    nome: {
        type: String, 
        require: false
    },
    sobrenome:{
        type: String
    },
    email:{
        type:String,
        require:true
    },
    idade:{
        type: Number,
        require: true
    },
    pais:{
        type: String,
        require: false
    }
})
//colection
mongoose.model('usuarios',UsuarioSchema);
const Bernardo = mongoose.model('usuarios');

new Bernardo({
    nome: "Gabriel",
    sobrenome: "Lopes",
    email: "gab@gmail.com",
    idade: 1,
    pais: "Brazil"
}).save().then(()=>{
    console.log('salvo');
}).catch((erro)=>{
    console.log(erro);
})