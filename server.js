var connect = require('connect');                                               
var httpServer = connect.createServer(                                                           
    connect.static('htdocs')                                                                           
).listen(8080);

var nowServer = connect.createServer().listen(8124);

var requirejs = require('requirejs');

requirejs.config({
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require
});

requirejs(['./htdocs/js/lib/class'],function (Class) {
    var nowjs = require("now");
    var everyone = nowjs.initialize(nowServer);
    var users=new Array();
    var modules={};
    
    nowjs.on('connect', function() {
        console.log("CONNECTED");
        console.log(this.user.clientId);
        var userData={
            id:this.user.clientId,
            color:'#'+Math.floor(Math.random()*16777215).toString(16)
        };
        users.push(userData);
        everyone.now.initialize(this.user.clientId,users,modules);
        everyone.now.receiveEvent(this.user.clientId,"addUser",[userData]);
    });
    nowjs.on('disconnect', function() {
        console.log("DISCONNECTED");
        console.log(this.user.clientId);
        var userRemoved=false,uI=0;
        while(!userRemoved&&uI<users.length){
            if(users[uI].id==this.user.clientId){
                users.splice(uI,1);
                userRemoved=true;
            }
            uI++;
        }
        everyone.now.receiveEvent(this.user.clientId,"removeUser",[this.user.clientId]);
    });
    
    everyone.now.handleEvent = function(author,eventFunction,eventArguments){
        switch(eventFunction){
            case 'addModule':
                modules[eventArguments[0]]=eventArguments[1];
                break;
            case 'removeModule':
                delete modules[eventArguments[0]];
                break;
        }
        //send this module to all other users
        everyone.now.receiveEvent(author,eventFunction,eventArguments);
    }
    everyone.now.handleModuleEvent = function(author,moduleId,eventFunction,eventArguments){
        switch(eventFunction){
            case 'setPosition':
                modules[moduleId].x=eventArguments[0];
                modules[moduleId].y=eventArguments[1];
                break;
        }
        
        //send this module to all other users
        everyone.now.receiveModuleEvent(author,moduleId,eventFunction,eventArguments);
    }
    everyone.now.handleUserEvent = function(author,userId,eventFunction,eventArguments){
        //send this module to all other users
        everyone.now.receiveUserEvent(author,userId,eventFunction,eventArguments);
    }
    
//    everyone.now.addModule = function(moduleCreator,moduleId,newModuleConfig){
//        sharedModules[moduleId]=new MapModule(newModuleConfig);
//        
//        //send this module to all other users
//        everyone.now.receiveModule(moduleCreator,moduleId,newModuleConfig);
//    }
//    everyone.now.removeModule = function(moduleId){
//        delete sharedModules[moduleId];
//    }
});

