var passport = require('passport-mfp-token-validation').Passport;
var mfpStrategy = require('passport-mfp-token-validation').Strategy;

module.exports = mfp;

/**
 * Example usage:
 *
 * var mfp = require('loopback-mfp');
 * mfp(app, options);
 */

//helper lists for GET functions
var getList = ['find', 'findbyid', 'exists', 'count', 'findone', 'getchangestream']; //created get change stream
//helper list for PUT functions
var putList = ['upsert', 'updateattributes']; //prototype.updateAttributes()
//helper list for DELETE function
var deleteList = ['deletebyid'];
//helper list for HEAD function
var headList = ['headexists']; //made up name for it, since it does not seem to exist... 
//helper list for POST functions
var postList = ['create', 'updateall', 'createchangestream'];
//helper list for basic REST endpoint functions
var normalList = ['post', 'get', 'put', 'delete']; 

//helper list for all READ operations
var readList = ['findbyid', 'find', 'findone', 'count', 'exists']; //the question is whether to also include get? (technicaly this is covered by find)
 
//helper list for all WRITE operations
var writeList = ['create', 'updateattributes', 'upsert', 'destroybyid', 'update']; 

//helper list for all EXECUTE operations
var executeList = ['']

 // Helper functions to have one liner API protection
var cont = function(req, res, next){
	next();
}; 
  
function mfp(app, options) {
  console.log("In mfp");
  passport.use(new mfpStrategy({
    publicKeyServerUrl: options.publicKeyServerUrl,
	cacheSize:0,
    //analytics: options.analytics
  }));

  // IMPORTANT - passport initialization goes to a different phase
  app.middleware('initial', passport.initialize());

  var auth = function(scopes) {
		return passport.authenticate('mobilefirst-strategy', {
			session: false,
			scope: scopes
		});
	}
  
  var authRouter = app.loopback.Router();

  // Setup per-route authentication (and possibly other things too)
  
  //get(/api/fruits/:id)
  var actualVerb = '';
  var routeContinuation = '';
  for (var route in options.routes) {
    for (var verb in options.routes[route]) {
        //here we need to change stuff. 
        //(myarr.indexOf("turtles") > -1);
        if (getList.indexOf(verb.toLowerCase())> -1){
            actualVerb = 'get'; 
            //here we want to create the right path per each of these options... 
            //lets do a switch statement, that will save us i think
            switch(verb.toLowerCase()){
                case 'find':
                    routeContinuation = '';
                    break; 
                
                case 'findbyid': 
                    routeContinuation = '/:id';
                    break; 
                
                case 'exists': 
                    routeContinuation = '/:id/exists';
                    break; 
                
                case 'findone': 
                    routeContinuation = '/findOne'; 
                    break; 

                case 'count': 
                    routeContinuation = '/count';
                    break; 
                case 'getchangestream': 
                    routeContinuation = '/change-stream';
                    break; 
                
            }
            console.log('route continued in get: ' + routeContinuation);
        }else if(postList.indexOf(verb.toLowerCase()) > -1){
            actualVerb = 'post'; 
            
            switch(verb.toLowerCase()){
                case 'create': routeContinuation = '';
                break; 

                case 'updateall': routeContinuation = '/update';
                break; 

                case 'createchangestream': routeContinuation = '/change-stream';
                break;
            }
        }else if(putList.indexOf(verb.toLowerCase()) > -1){
            actualVerb = 'put';
            
            switch(verb.toLowerCase()){
                case 'upsert': routeContinuation = '';
                break; 
                
                case 'updateattributes': routeContinuation = '/:id'; 
                break; 
            }
        }else if(deleteList.indexOf(verb.toLowerCase()) > -1){
            actualVerb = 'delete';
            routeContinuation = '/:id'; //deleteById
        }else if(headList.indexOf(verb.toLowerCase())>-1){
            actualVerb = 'head';
            routeContinuation = '/:id';
        }else if (normalList.indexOf(verb.toLowerCase())>-1){
            actualVerb = verb.toLowerCase(); 
            routeContinuation = '';
        }else{
            actualVerb = verb.toLowerCase(); 
            routeContinuation = '';
        }
      
      var fullRoute = route + routeContinuation; 
      console.log("route continuation: " + routeContinuation); 
      console.log("full route: " + fullRoute);  
      console.log('verb: ' + actualVerb); 
      //var config = options.routes[fullRoute][actualVerb]; // the issue is that we switch this. oops. but what do we do to fix this? 
                                                          //we can't not fix this... the whole point is that we do fix it. 
      var config = options.routes[route][verb];
      console.log("actverb: " + actualVerb + " | fullroute: " + fullRoute); 
      authRouter[actualVerb](fullRoute, auth(config.authRealm), cont);
      //authRouter[verb](route, auth(config.authRealm), cont);
      //authRouter[verb.toLowerCase()](route, auth(config.authRealm), cont);
	  console.log("Adding to authRouter: route: "+route + " full route: " + fullRoute +  " .authRealm: "+config.authRealm+". verb = "+verb.toLowerCase() + " actual verb: " + actualVerb);
    }
  }

  // IMPORTANT - auth middleware goes to a dedicated phase
  app.middleware('auth', authRouter);
};


//todo:
//maybe we want to have a yeoman option that allows us to just choose one of these options instead of writing it
//these are not easy names to remember. on the other hand, maybe we should change the names?? 
//ex (insert vs upsert, update vs updateall)

//now we need to make it go by crud...
//so this works for one, right, but what if they hit

//CRUD: READ WRITE DELETE EXECUTE --> or are we talking create, read, something with a u and delete


