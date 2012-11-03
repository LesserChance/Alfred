define(['jquery'], function($) {
    var Action = Class.extend({
        init: function(){
            
        },
        registerTrigger:function(bindEvent,objectType,callback,callbackArguments){
            globalMap.registerActionTrigger(bindEvent,objectType,this.className,callback,callbackArguments);
        },
        releaseTrigger:function(bindEvent,objectType){
            globalMap.releaseActionTrigger(bindEvent,objectType,this.className);
        },
        registerModuleTrigger:function(bindEvent,callback,callbackArguments){
            globalMap.registerModuleTrigger(bindEvent,this.className,callback,callbackArguments);
        },
        releaseModuleTrigger:function(bindEvent){
            globalMap.releaseModuleTrigger(bindEvent,this.className);
        },
        cancel:function(){
            
        }
    });
    
    return Action;
});