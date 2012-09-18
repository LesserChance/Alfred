define(['jquery'], function($) {
    var User = Class.extend({
        init: function(config){
            this._id=config.id;
            this._color=config.color;
            globalMap._allUsers[config.id]=this;
            
            this._cursor = new Kinetic.ModuleShape({
                shape:"Circle",
                radius: 4,
                fill:this._color,
                stroke:this._color
            });
            globalMap.drawUser(this);
        },
        remove: function(){
            this._cursor.parent.remove(this._cursor);
            this._cursor.parent.draw();
        },
        
        //event communication
        broadcastEvent: function(eventFunction,eventArguments){
            globalMap._clientSocket.broadcastUserEvent(this._id,eventFunction,eventArguments);
        },
        handleEvent: function(eventFunction,eventArguments){
            if(typeof this[eventFunction]=="function"){
                this[eventFunction].apply(this,eventArguments);
            }else{
                console.log("unhandled user event");
                console.log(eventFunction);
            }
        },
        cursorMove: function(x,y){
            this._cursor.setPosition(x-2,y-2);
            globalMap.redrawCursorLayer();
        }
    });
    
    return User;
});