define(['jquery',"action"], function($,Action) {
    var Delete = Action.extend({
        className:"delete",
        displayName:"Delete Module",
        init: function(){
            this.registerModuleTrigger("mouseup",this.deleteModule,[]);
        },
        cancel:function(){
            this.releaseModuleTrigger("mouseup");
        },
        deleteModule:function(moduleId){
            globalMap.removeModule(moduleId,true);
        }
    });
    
    return Delete;
});