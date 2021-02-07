module.exports = {
    eAdmin: function(req, res, next) {
        if(req.isAuthenticated() && req.user.eAdmin == 1){
            next();
        }else{
            req.flash('error_msg','Voce dever ser admin')
            res.redirect('/')
        }
    }
}