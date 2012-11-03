define(['jquery',"action"], function($,Action) {
    var Move = Action.extend({
        className:"move",
        displayName:"Move Canvas",
        init: function(){
            this.registerTrigger("mousedown","stage",this.startDrag,[]);
            this.registerTrigger("mouseup","stage",this.endDrag,[]);
            this.registerTrigger("mousemove","document",this.drag,[]);
            globalMap.applyStyle("stage","moveCursor");
        },
        cancel:function(){
            this.releaseTrigger("mousedown","stage");
            this.releaseTrigger("mouseup","stage");
            this.releaseTrigger("mousemove","document");
            globalMap.removeStyle("stage","moveCursor");
        },
        startDrag:function(e){
            this._startX=e.clientX;
            this._startY=e.clientY;
            this._startLeft=parseInt($(globalMap._renderer._content).css("left")) || 0;
            this._startTop=parseInt($(globalMap._renderer._content).css("top")) || 0;
            this._dragging=true;
            e.preventDefault();
            e.stopPropagation();
        },
        drag:function(e){
            if(this._dragging){
                var shiftX=e.clientX-this._startX;
                var shiftY=e.clientY-this._startY;
                
                $(globalMap._renderer._content).css({
                    'left':this._startLeft+shiftX,
                    'top':this._startTop+shiftY
                });
                e.preventDefault();
                e.stopPropagation();
            }
        },
        endDrag:function(e){
            this._dragging=false;
            e.preventDefault();
            e.stopPropagation();
        }
    });
    
    return Move;
});