define(['jquery','eventHandler'], function($,EventHandler) {
    var ClientSocket = Class.extend({
        init: function() {
            
        },
        broadcastEvent: function(eventFunction,eventArguments){
            now.handleEvent(globalMap._userId,eventFunction,eventArguments);
        },
        receiveEvent: function(eventFunction,eventArguments){
            if(typeof EventHandler.prototype[eventFunction]=="function"){
                EventHandler.prototype[eventFunction].apply(null,eventArguments);
            }else{
                console.log("unhandled event");
                console.log(eventFunction);
            }
        },
        
        broadcastUserEvent: function(userId,eventFunction,eventArguments){
            now.handleUserEvent(globalMap._userId,userId,eventFunction,eventArguments);
        },
        receiveUserEvent: function(userId,eventFunction,eventArguments){
            EventHandler.prototype.userEvent.call(null,userId,eventFunction,eventArguments);
        },
        
        broadcastModuleEvent: function(moduleId,eventFunction,eventArguments){
            now.handleModuleEvent(globalMap._userId,moduleId,eventFunction,eventArguments);
        },
        receiveModuleEvent: function(moduleId,eventFunction,eventArguments){
            EventHandler.prototype.moduleEvent.call(null,moduleId,eventFunction,eventArguments);
        }
    });
    
    //synced functions
    now.initialize = function(userId,users,modules) {
        if(globalMap&&globalMap._ready){
            if(userId==globalMap._userId){
                //load users
                for(var i=0,iEnd=users.length;i<iEnd;i++){
                    if(users[i].id!=globalMap._userId){
                        globalMap.addUser(users[i],true);
                    }
                }

                //load modules
                var loadClasses=new Array();
                var constructorIndex={};
                for(var moduleId in modules){
                    var moduleClass=modules[moduleId].moduleClass;
                    loadClasses.push("module/"+moduleClass);
                    constructorIndex[moduleClass]=loadClasses.length-1;
                }
                require(loadClasses, function() {
                    for(var moduleId in modules){
                        globalMap.addModule(moduleId,
                                            arguments[constructorIndex[modules[moduleId].moduleClass]],
                                            null,
                                            modules[moduleId],
                                            modules[moduleId].parentModuleId,
                                            false);
                    }
                });
            }
        }else{
            setTimeout(function(){
                now.initialize(userId,users,modules);
            },50);
        }
    }
    now.receiveEvent = function(author,eventFunction,eventArguments) {
        if(globalMap&&author!=globalMap._userId){
            //someone else added a module
            globalMap._clientSocket.receiveEvent(eventFunction,eventArguments);
        }
    }
    now.receiveModuleEvent = function(author,moduleId,eventFunction,eventArguments) {
        if(globalMap&&author!=globalMap._userId){
            //someone else added a module
            globalMap._clientSocket.receiveModuleEvent(moduleId,eventFunction,eventArguments);
        }
    }
    now.receiveUserEvent = function(author,userId,eventFunction,eventArguments) {
        if(globalMap&&author!=globalMap._userId){
            //someone else added a module
            globalMap._clientSocket.receiveUserEvent(userId,eventFunction,eventArguments);
        }
    }

    return ClientSocket;
});