define(['jquery','mapModule'], function($,MapModule) {
    var User = MapModule.extend({
        className:"user",
        init: function(id,config){
            this._id=id;
            this._super();
            
            this._size=250;
            this._smallHeight=24;
            
            this.plop(config);
        },
        
        //initial build/draw
        plop: function(config){
            this.buildDomObj(config);
            this.bindModuleEvents();
            
            globalMap.drawModule(this);
        },
        buildDomObj: function(config){
            this._domObj = new Kinetic.ModuleGroup({
                draggable: true,
                parentModule:this._id
            });
            
            var boxBorder = new Kinetic.ModuleShape({
                shape:"Rect",
                width: this._size,
                height: this._smallHeight,
                x:config.x,
                y:config.y,
                fill: "#FFF",
                stroke: "#000",
                strokeWidth: 15,
                lineJoin:"round",
                alpha:.5,
                parentModule:this._id
            });
            var box = new Kinetic.ModuleShape({
                shape:"Rect",
                width: this._size,
                height: this._smallHeight,
                x:config.x,
                y:config.y,
                fill: "#FFF",
                stroke: "#FFF",
                strokeWidth: 3,
                lineJoin:"round",
                parentModule:this._id
            });
            var boxTitleBar = new Kinetic.ModuleShape({
                shape:"Rect",
                width: this._size+4,
                height: this._smallHeight+4,
                x:config.x-2,
                y:config.y-2,
                fill: "#282588",
                parentModule:this._id
            });
            var boxTitle = new Kinetic.Text({
                x:config.x+35,
                y:config.y+13,
                text: "Ryan Bateman",
                fontSize: 18,
                fontFamily: "Calibri",
                textFill: "#FFF",
                align: "left",
                verticalAlign: "middle"
            });
            var boxIcon = new Kinetic.QImage({
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
            this._domObj.add(boxBorder);
            this._domObj.add(box);
            this._domObj.add(boxTitleBar);
            this._domObj.add(boxIcon);
            this._domObj.add(boxTitle);
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
        onFocus: function(e){
            
        },
        onBlur: function(e){
            
        },
        remove: function(){
            var domObj=this._domObj;
            domObj.transitionTo({
                width:0,
                height:0,
                x:this._domObj.attrs.x+(this._size/2),
                y:this._domObj.attrs.y+(this._size/2),
                duration:.2,
                callback:function(){
                    domObj.hide();
                    domObj.parent.draw();
                }
            });
        }
    });
    
    return User;
});