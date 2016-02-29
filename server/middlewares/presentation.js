/**
 * Created by jerry on 2/29/16.
 */

function present(req, res, next){

}

function presentError(error, req, res, next){

}

function serve(app){
    app.use(present);
    app.use(presentError);
}

module.exports = serve;

