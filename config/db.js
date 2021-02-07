if(process.env.NODE_ENV !== 'production'){
    module.exports = {mongoURI: "mongodb+srv://Blog:kennedy@cluster0.qodti.mongodb.net/appblog?retryWrites=true&w=majority"}
}else{
    module.exports = {mongoURI : "mongodb://localhost/appblog"}
}