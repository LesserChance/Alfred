define(['jquery','mapModule'], function($,MapModule) {
    var Database = MapModule.extend({
        className:"database",
        displayName:"Database",
        init: function(id,config){
            this._id=id;
            this._super();
            
            this._size=20;
            this._plopDiff=10;
            this._focusDiff=5;
            
            this.plop(config);
        },
        
        //initial build/draw
        plop: function(config){
            this.buildDomObj(config);
            this.bindModuleEvents();
            
            globalMap.drawModule(this);
            this.plopTransition(config);
        },
        buildDomObj: function(config){
            this._domObj = new Kinetic.ModuleShape({
                shape:"Circle",
                radius: this._size-this._plopDiff,
                x:config.x,
                y:config.y,
                fill: "#0F0",
                stroke: "black",
                strokeWidth: 1,
                draggable:true,
                parentModule:this._id
            });
        },
        plopTransition: function(config){
            this._domObj.transitionTo({
                radius:this._size,
                strokeWidth: 3,
                duration:.2
            });
        },
        
        //retrieval
        getDomObj: function(){
            return this._domObj;
        },
        getConfig:function(){
            return {
                moduleClass:this.className,
                id:this._id,
                radius: this._size,
                x:this._domObj.attrs.x,
                y:this._domObj.attrs.y
            };
        },
        getDefaultConfig:function(e){
            var retVal=globalMap.getOffsetPositionFromCursor(e,-3,-3);
            return retVal;
        },
        
        //events
        onFocus: function(e){
            this._domObj.transitionTo({
                radius:this._size+this._focusDiff,
                duration:.2
            });
        },
        onBlur: function(e){
            this._domObj.transitionTo({
                radius:this._size,
                duration:.2
            });
        },
        remove: function(){
            var self=this;
            var domObj=this._domObj;
            var superCallback=this._super;
            domObj.transitionTo({
                radius:0,
                strokeWidth: 1,
                duration:.2,
                callback:function(){
                    superCallback.call(self);
                }
            });
        }
    });
    
    return Database;
});