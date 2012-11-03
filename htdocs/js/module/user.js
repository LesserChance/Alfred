define(['jquery','mapModule'], function($,MapModule) {
    var User = MapModule.extend({
        className:"user",
        displayName:"User",
        init: function(id,config){
            this._id=id;
            this._super();
            
            this._startSize=50;
            this._size=250;
            this._smallHeight=24;
            
            this._ogX=config.x;
            this._ogY=config.y;
            
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
            this._domObj = new Kinetic.ModuleGroup({
                draggable: true,
                parentModule:this._id
            });
            
            this._boxBorder = new Kinetic.Rect({
                width: this._startSize,
                height: this._smallHeight,
                x:config.x,
                y:config.y,
                fill: "#FFF",
                stroke: "#000",
                strokeWidth: 15,
                lineJoin:"round",
                alpha:.5
            });
            this._box = new Kinetic.Rect({
                width: this._startSize,
                height: this._smallHeight,
                x:config.x,
                y:config.y,
                fill: "#FFF",
                stroke: "#FFF",
                strokeWidth: 3,
                lineJoin:"round"
            });
            this._boxTitleBar = new Kinetic.Rect({
                width: this._startSize+4,
                height: this._smallHeight+4,
                x:config.x-2,
                y:config.y-2,
                fill: "#282588"
            });
            this._boxIcon = new Kinetic.QImage({
                image:globalMap._iconGrid,
                width:28,
                height:36,
                srcx:0,
                srcy:0,
                srcwidth:28,
                srcheight:36,
                x:config.x+3,
                y:config.y-8
            });
            this._boxTitle = new Kinetic.Text({
                x:config.x+35,
                y:config.y+13,
                text: "Ryan Bateman",
                fontSize: 18,
                fontFamily: "Calibri",
                textFill: "#FFF",
                align: "left",
                verticalAlign: "middle",
                visible:false
            });
            
//            this._sendXOffset=config.x;
//            this._sendYOffset=config.y;
            
            this._domObj.add(this._boxBorder);
            this._domObj.add(this._box);
            this._domObj.add(this._boxTitleBar);
            this._domObj.add(this._boxIcon);
            this._domObj.add(this._boxTitle);
        },
        plopTransition: function(config){
            var self=this;
            this._boxBorder.transitionTo({
                width:this._size,
                duration:.2
            });
            this._box.transitionTo({
                width:this._size,
                duration:.2
            });
            this._boxTitleBar.transitionTo({
                width:this._size+4,
                duration:.2,
                callback:function(){
                    self._boxTitle.show();
                }
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
                width:this._domObj.attrs.width,
                height:this._domObj.attrs.height,
                x:this._domObj.attrs.x,
                y:this._domObj.attrs.y
            };
        },
        getDefaultConfig:function(e){
            var retVal=globalMap.getOffsetPositionFromCursor(e,-20,-20);
            return retVal;
        },
        
        //events
        getRealPosition: function(){
            return {
                x:this._ogX+this._domObj.attrs.x,
                y:this._ogY+this._domObj.attrs.y
            };
        },
        onFocus: function(e){
            
        },
        onBlur: function(e){
            
        },
        remove: function(){
            var self=this;
            var superCallback=this._super;
            this._boxTitle.hide();
            this._boxBorder.transitionTo({
                width:this._startSize,
                height: this._smallHeight,
                duration:.2
            });
            this._box.transitionTo({
                width:this._startSize,
                height: this._smallHeight,
                duration:.2
            });
            this._boxTitleBar.transitionTo({
                width:this._startSize,
                duration:.2,
                callback:function(){
                    superCallback.call(self);
                }
            });
        }
    });
    
    return User;
});