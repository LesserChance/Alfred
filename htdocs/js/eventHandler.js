define(['jquery'], function($) {
    var EventHandler = Class.extend({
        init: function() {
            
        },
        addModule: function(moduleId,moduleConfig,parentModule){
            require(["module/"+moduleConfig.moduleClass], function(moduleConstructor) {
                globalMap.addModule(moduleId,moduleConstructor,null,moduleConfig,parentModule)
            });
        },
        removeModule: function(moduleId){
            globalMap.removeModule(moduleId);
        },
        addUser: function(userId){
            globalMap.addUser(userId);
        },
        removeUser: function(userId){
            globalMap.removeUser(userId);
        },
        userEvent: function(userId,userEvent,userArguments){
            if(globalMap._allUsers[userId]){
                globalMap._allUsers[userId].handleEvent(userEvent,userArguments);
            }else{
                console.log("unhandled user event - cannot find user");
                console.log(userEvent);
            }
        },
        moduleEvent: function(moduleId,moduleEvent,moduleArguments){
            if(globalMap._allModules[moduleId]){
                globalMap._allModules[moduleId].handleEvent(moduleEvent,moduleArguments);
            }else{
                console.log("unhandled module event - cannot find module");
                console.log(moduleEvent);
            }
        }
    });
    
    return EventHandler;
});