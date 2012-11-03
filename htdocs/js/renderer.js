define(['jquery'], function($) {
    var Renderer = Class.extend({
        init: function(base) {
            this._base = base;
            this._connectionThreshold=5;
            $(base).attr({
                "width":globalMap._width,
                "height":globalMap._height
            });
            
            this._cursorFrameCount=0;
            this._cursorGranularity=5;
            
            this.initStage(base);
        },
        initStage: function(base){
            this._stage = new Kinetic.Stage({
                container:base,
                width:globalMap._canvasWidth,
                height:globalMap._canvasHeight
            });
            this._connectionLayers = new Array();
            this._tempLayer = new Kinetic.Layer();
            this._moduleLayer = new Kinetic.Layer();
            this._cursorLayer = new Kinetic.Layer();
            this._stage.add(this._tempLayer);
            this._stage.add(this._cursorLayer);
            this._stage.add(this._moduleLayer);
            
            this.initCanvas();
        },
        initCanvas: function(){
            if(this._moduleLayer.canvas){
                this._canvas = this._moduleLayer.canvas;
                this._canvasContext = (this._canvas && this._canvas.getContext) ? this._canvas.getContext("2d") : null;
                this._content = this._stage.content;
                this.bindEventBubble();
            }else{
                var self=this;
                setTimeout(function(){
                    self.initCanvas();
                },100);
            }
        },
        newLayer: function(){
            var newLayer = new Kinetic.Layer();
            this._stage.add(newLayer);
            $(this._cursorLayer.canvas).before(newLayer.canvas);
            return newLayer;
        },
        getConnectionLayer: function(moduleId){
            var connectionObject
            if(this._connectionLayers.length==0){
                connectionObject = this.addConnectionLayer(moduleId);
            }else{
                connectionObject = this._connectionLayers[this._connectionLayers.length-1];
                if(connectionObject.modules.length>this._connectionThreshold){
                    connectionObject = this.addConnectionLayer(moduleId);
                }else{
                    connectionObject.modules.push(moduleId);
                }
            }
            
            return connectionObject;
        },
        addConnectionLayer: function(moduleId){
            var connectionObject = {
                'level':this._connectionLayers.length,
                'layer':this.newLayer(),
                'modules':[moduleId]
            };
            this._connectionLayers.push(connectionObject);
            return connectionObject;
        },
        redrawConnectionLayer: function(connectionObject){
            //update all modules line contained in this layer
            connectionObject.layer.clear();
            for(var i=0,iEnd=connectionObject.modules.length;i<iEnd;i++){
                globalMap._allModules[connectionObject.modules[i]].drawConnections();
            }
        },
        bindEventBubble: function(){
            this._moduleLayer.on("mousedown",function(e){
                if(globalMap.handleModuleTrigger("mousedown",e)){
                    e.stopPropagation();
                }
            });
            this._moduleLayer.on("mouseup",function(e){
                globalMap.handleModuleTrigger("mouseup",e);
                //mouseup should never propagate if it occured on a module
                e.stopPropagation();
            });
            this._moduleLayer.on("mouseover",function(e){
                if(globalMap.handleModuleTrigger("mouseover",e)){
                    e.stopPropagation();
                }
            });
            this._moduleLayer.on("mousemove",function(e){
                if(globalMap.handleModuleTrigger("mousemove",e)){
                    e.stopPropagation();
                }
            });
            this._moduleLayer.on("mouseout",function(e){
                if(globalMap.handleModuleTrigger("mouseout",e)){
                    e.stopPropagation();
                }
            });
            this._moduleLayer.on("click",function(e){
                globalMap.handleModuleTrigger("click",e);
                //click should never propagate if it occured on a module
                e.stopPropagation();
            });
            this._moduleLayer.on("dblclick",function(e){
                globalMap.handleModuleTrigger("dblclick",e);
                //double click should never propagate if it occured on a module
                e.stopPropagation();
            });
            this._moduleLayer.on("dragstart",function(e){
                if(globalMap.handleModuleTrigger("dragstart",e)){
                    e.stopPropagation();
                }
            });
            this._moduleLayer.on("dragmove",function(e){
                if(globalMap.handleModuleTrigger("dragmove",e)){
                    e.stopPropagation();
                }
            });
            this._moduleLayer.on("dragend",function(e){
                if(globalMap.handleModuleTrigger("dragend",e)){
                    e.stopPropagation();
                }
            });
            
            
            var self=this;
            $(document).bind("mousemove",function(e){
                if(self._cursorFrameCount++ % self._cursorGranularity==0){
                    var cursorPos=globalMap.getOffsetPositionFromCursor(e);
                    globalMap._clientSocket.broadcastUserEvent(globalMap._userId,"cursorMove",[cursorPos.x,cursorPos.y]);
                }
            });
        },
        addToLayer:function(kinteticObj){
            this._moduleLayer.add(kinteticObj);
            this._moduleLayer.draw();
        },
        redraw:function(){
            this._moduleLayer.draw();
        },
        
        addToCursorLayer:function(kinteticObj){
            this._cursorLayer.add(kinteticObj);
            this._cursorLayer.draw();
        },
        redrawCursorLayer:function(){
            this._cursorLayer.draw();
        },
        
        addToTempLayer:function(kinteticObj){
            this._tempLayer.add(kinteticObj);
            this._tempLayer.draw();
        },
        redrawTempLayer:function(){
            this._tempLayer.draw();
        },
        
        cancelDrag: function(e){
            this._stage._endDrag(e);
        }
    });

    return Renderer;
});