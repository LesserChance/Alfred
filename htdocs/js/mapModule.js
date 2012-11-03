define(['jquery'], function($) {
    var MapModule = Class.extend({
        init: function(){
            globalMap._allModules[this._id]=this;
            
            this._childConnections=new Array();
            this._parentConnections=new Array();
            this._connectionObject=globalMap._renderer.getConnectionLayer(this._id);
            this._connectionLayer=this._connectionObject.layer;
            this._connectionLevel=this._connectionObject.level;
            
            //make up for any zoom that may occur on mouseover
            this._sendXOffset=0;
            this._sendYOffset=0;
            
            this._frameCount=0;
            this._granularity=5;
        },
        remove: function(){
            this._domObj.parent.remove(this._domObj);
            this._domObj.parent.draw();
            
            //remove the reference for all connections
            for(var i=0,iEnd=this._childConnections.length;i<iEnd;i++){
                var endModule=globalMap._allModules[this._childConnections[i]];
                endModule.removeParentConnection(this._id);
            }
            for(var i=0,iEnd=this._parentConnections.length;i<iEnd;i++){
                var startModule=globalMap._allModules[this._parentConnections[i]];
                startModule.removeChildConnection(this._id);
            }
            
            //clear out child connection so all will be deleted, leave parent references in tact for now, so theyll be force cleared
            this._childConnections=new Array();
            
            this.triggerConnectionRedraw();
            var removeIndex=this._connectionObject.modules.indexOf(this._id);
            this._connectionObject.modules.splice(removeIndex,1);
            
            delete globalMap._allModules[this._id];
        },
        
        registerTrigger:function(bindEvent,objectType,callback,callbackArguments){
            globalMap.registerModuleTrigger(bindEvent,objectType,this.className,callback,callbackArguments);
        },
        releaseTrigger:function(bindEvent,objectType){
            globalMap.releaseModuleTrigger(bindEvent,objectType,this.className);
        },
        
        getRealPosition: function(){
            return {
                x:this._domObj.attrs.x,
                y:this._domObj.attrs.y
            };
        },
        getConfig:function(){
            return {};
        },
        
        //connections
        addChildConnection:function(moduleId){
            this._childConnections.push(moduleId);
            this.triggerConnectionRedraw();
            
            this.broadcastEvent("addChildConnection",[moduleId]);
        },
        addParentConnection:function(moduleId){
            this._parentConnections.push(moduleId);
        },
        removeChildConnection:function(moduleId){
            var removeIndex=this._childConnections.indexOf(moduleId);
            this._childConnections.splice(removeIndex,1);
        },
        removeParentConnection:function(moduleId){
            var removeIndex=this._parentConnections.indexOf(moduleId);
            this._parentConnections.splice(removeIndex,1);
        },
        triggerConnectionRedraw:function(){
            globalMap._renderer.redrawConnectionLayer(this._connectionObject);
        },
        drawConnections:function(){
            //redraw all connection to children
            var context = this._connectionLayer.getContext();
            for(var i=0,iEnd=this._childConnections.length;i<iEnd;i++){
                var endModule=globalMap._allModules[this._childConnections[i]];
                var startPoint=this.getRealPosition();
                var endPoint=endModule.getRealPosition();
                
                context.beginPath();
                context.moveTo(startPoint.x, startPoint.y);
                context.lineTo(endPoint.x, endPoint.y);
                context.strokeStyle = "#000";
                context.lineWidth = 2;
                context.stroke();
                context.closePath();
            }
            
            //if a parent points to me from a different connection layer
            for(var i=0,iEnd=this._parentConnections.length;i<iEnd;i++){
                var startModule=globalMap._allModules[this._parentConnections[i]];
                if(this._connectionLevel!=startModule._connectionLevel){
                    startModule.triggerConnectionRedraw();
                }
            }
        },
        
        //event binding
        bindModuleEvents:function(){
            var self=this;
            this._domObj.on("dragstart",function(e){
                globalMap.cancelDragIfNotAllowed(e);
                self._domObj.moveToTop();
            });
            this._domObj.on("dragmove",function(e){
                if(self._frameCount++ % self._granularity==0){
                    self.triggerConnectionRedraw();
                    self.broadcastEvent("setPosition",[
                        self._domObj.attrs.x+self._sendXOffset,
                        self._domObj.attrs.y+self._sendYOffset
                    ]);
                }
            });
            this._domObj.on("dragend",function(e){
                self.triggerConnectionRedraw();
                self.broadcastEvent("setPosition",[
                    self._domObj.attrs.x+self._sendXOffset,
                    self._domObj.attrs.y+self._sendYOffset
                ]);
            });
            this.bindFocusFunctions();
        },
        bindFocusFunctions: function(realFocus){
            var self=this;
            if(realFocus){
                this._domObj.off("mouseout.focus");
                this._domObj.on("mouseover",function(e){
                    self.onFocus(e);
                });
                this._domObj.on("mouseout",function(e){
                    self.onBlur(e);
                });
            }else{
                this._domObj.on("mouseout.focus",function(e){
                    self.bindFocusFunctions(true);
                });
            }
        },
        
        //event communication
        broadcastEvent: function(eventFunction,eventArguments){
            globalMap._clientSocket.broadcastModuleEvent(this._id,eventFunction,eventArguments);
        },
        handleEvent: function(eventFunction,eventArguments){
            if(typeof this[eventFunction]=="function"){
                this[eventFunction].apply(this,eventArguments);
            }else{
                console.log("unhanled module event");
                console.log(eventFunction);
            }
        },
        
        //global receivable events
        setPosition:function(x,y){
            this._domObj.moveToTop();
            this._domObj.setPosition(x,y);
            this.triggerConnectionRedraw();
            globalMap.redraw();
        }
    });
    
    return MapModule;
});