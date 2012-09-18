define(['jquery',"action"], function($,Action) {
    var Link = Action.extend({
        className:"link",
        displayName:"Link Modules",
        init: function(){
            this.registerModuleTrigger("mousedown",this.startLink,[]);
            this.registerModuleTrigger("mouseup",this.endLink,[]);
            this.registerTrigger("mouseup","stage",this.clearLink,[]);
        },
        cancel:function(){
            this.releaseModuleTrigger("mousedown");
            this.releaseModuleTrigger("mouseup");
            this.releaseTrigger("mouseup","stage");
        },
        startLink:function(moduleId,e){
            this._startModuleId=moduleId;
            
            globalMap._drawLineOnDrag=true;
            globalMap.startLine(e);
        },
        endLink:function(moduleId,e){
            var startModule=globalMap._allModules[this._startModuleId];
            var endModule=globalMap._allModules[moduleId];
            startModule.addChildConnection(moduleId);
            endModule.addParentConnection(this._startModuleId);
            
            globalMap._clientSocket.broadcastEvent("addLink",[this._startModuleId,moduleId]);
        },
        clearLink:function(e){
            globalMap._drawLineOnDrag=false;
            globalMap.endLine(e);
        }
    });
    
    return Link;
});