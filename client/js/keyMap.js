define(['jquery'], function($) {
    var KeyMap = Class.extend({
        init: function(){
            this._suppresEvents=false;
            this._downCount=0;
            this._lastDown="";
            
            this.bindKeyEvents();
            this.getKeyMap();
        },
        bindKeyEvents:function(){
            var self=this;
            $(document)
                .bind("keydown", function(e) {
                    if(!self._suppressEvents&&self.handleKeyDown(e)){
                        e.preventDefault();
                    }
                })
                .bind("keyup", function(e) {
                    if(!self._suppressEvents&&self.handleKeyUp(e)){
                        e.preventDefault();
                    }
                })
                .bind("blur",function(e){
                    //assume all keys are released
                    self.releaseAllKeys();
                });
        },
        getKeyMap:function(){
            var self=this;
            $.getJSON("data/keymap.json", function(data) {
                    self.saveKeyMap(data);
                })
                .error(function(data, textStatus, errorThrown){
                    alert("Cannot load key map.");
                });
        },
        saveKeyMap:function(keyMapData){
            this._keyMap=keyMapData;
        },
        releaseAllKeys: function(){
            this._downCount=0;
            this._lastDown="";
            this.cancelEverything();
        },
        cancelEverything: function(){
            globalMap.cancelAllActions();
            globalMap.cancelAllModules();
        },
        handleKeyDown:function(e){
            var handled=false;
            var keyPress=((e.ctrlKey)?"1":"0")+"_"+
                         ((e.altKey)?"1":"0")+"_"+
                         ((e.shiftKey)?"1":"0")+"_"+
                         e.keyCode;
                     
            if(this._lastDown!=keyPress){
                this.cancelEverything();
                this._downCount++;
                this._lastDown=keyPress;
                handled=this.handleEvent("keydown",e.ctrlKey,e.altKey,e.shiftKey,String.fromCharCode(e.keyCode));
            }else{
                //stop the trigger
                e.preventDefault();
            }
            
            return handled;
        },
        handleKeyUp:function(e){
            this._downCount--;
            if(this._downCount<0){this._downCount=0;}
            if(this._downCount==0){
                //all keys have been released
                this._lastDown="";
                
                //cancel all actions and modules
                this.cancelEverything();
            }
            
            var handled=this.handleEvent("keyup",e.ctrlKey,e.altKey,e.shiftKey,String.fromCharCode(e.keyCode));
            
            return handled;
        },
        handleEvent:function(cEvent,cCtrl,cAlt,cShift,cKeyCode){
            var foundAction=this.findAction(cEvent,cCtrl,cAlt,cShift,cKeyCode);
            if(foundAction){
                //SHOW THE ACTION READY TO BE RUN AT THE TOP RIGHT IN A TRANSPARENT DIV
                globalMap.runAction(foundAction);
                return true;
            }else{
                var foundModule=this.findModule(cEvent,cCtrl,cAlt,cShift,cKeyCode);
                if(foundModule){
                    //SHOW THE MODULE READY TO BE RUN AT THE TOP RIGHT IN A TRANSPARENT DIV
                    globalMap.runModule(foundModule);
                    return true;
                }
            }
            return false;
        },
        findAction:function(cEvent,cCtrl,cAlt,cShift,cKeyCode){
            for(var action in this._keyMap.actions){
                var a=this._keyMap.actions[action];
                if(a.event==cEvent&&
                    a.keyCode==cKeyCode&&
                    a.ctrl==cCtrl&&
                    a.alt==cAlt&&
                    a.shift==cShift){
                        //found a matching action
                        return action;
                }
            }
            return false;
        },
        findModule:function(cEvent,cCtrl,cAlt,cShift,cKeyCode){
            for(var module in this._keyMap.modules){
                var a=this._keyMap.modules[module];
                if(a.event==cEvent&&
                    a.keyCode==cKeyCode&&
                    a.ctrl==cCtrl&&
                    a.alt==cAlt&&
                    a.shift==cShift){
                        //found a matching module
                        return module;
                }
            }
            return false;
        }
    });
    
    return KeyMap;
});