define(['jquery','renderer','keyMap','clientSocket','eventHandler','user','lib/jquery-ui-1.8.2.custom','lib/kinetic'], function($,Renderer,KeyMap,ClientSocket,EventHandler,User,$ui,localKinetic) {
    var Map = Class.extend({
        init: function(){
            if(now.core.clientId){
                this._userId=now.core.clientId;
                globalMap=this;

                this._frameCount=0;
                this._granularity=5;

                this._width=720;
                this._height=720;
                this._canvasWidth=5000;
                this._canvasHeight=5000;

                this._runningAction={};

                this._allModules=new Array();
                this._allUsers=new Array();
                this._moduleEvents={};
                this._runningModule={};

                this.initNotifications();
                this.initCanvas();
                this.initRenderer();
                this.initKeyMap();
                this.initMouseEvents();
                this.initClientSocket();
                
                this._ready=true;
                
                this._queuedEvents={};
                Kinetic.GlobalObject.frameTrigger=Map.prototype.frameTrigger;
            }else{
                var self=this;
                setTimeout(function(){
                    self.init();
                },100);
            }
        },
        initNotifications: function(){
            this._notificationDiv={};
            this._notificationDiv['module']=$(document.createElement('div'))
                                                .addClass('moduleNotification')
                                                .hide()
                                                .appendTo(document.body);
            this._notificationDiv['action']=$(document.createElement('div'))
                                                .addClass('moduleNotification')
                                                .hide()
                                                .appendTo(document.body);
            this._notificationDiv['user']=$(document.createElement('div'))
                                                .addClass('moduleNotification')
                                                .hide()
                                                .appendTo(document.body);
            this._notificationQueue={
                'module':[],
                'action':[],
                'user':[]
            };
        },
        initCanvas: function(){
            $("#canvas").css({
                'width':this._width,
                'height':this._height
            });
            
            this._iconGrid=new Image();
            this._iconGrid.src="img/icon-grid.png";
        },
        initRenderer: function(){
            this._renderer=new Renderer(document.getElementById('base'));
        },
        initKeyMap: function(){
            this._keyMap=new KeyMap();
        },
        initClientSocket: function(){
            this._eventHandler=new EventHandler();
            this._clientSocket=new ClientSocket();
        },
        frameTrigger:function(){
            
        },
        
        //mouse events
        initMouseEvents: function(){
            this._drawLineOnDrag=false;
            var self=this;
            $(document)
                .bind("mousedown.mapEvent", function(e) {
                    if(self.handleMouseDown(e)){
                        e.preventDefault();
                    }
                })
                .bind("mousemove.mapEvent", function(e) {
                    if(self._frameCount++ % self._granularity==0){
                        if(self.handleMouseMove(e)){
                            e.preventDefault();
                        }
                    }
                })
                .bind("mouseup.mapEvent", function(e) {
                    if(self.handleMouseUp(e)){
                        e.preventDefault();
                    }
                })
        },
        handleMouseDown:function(e){
            return false;
        },
        handleMouseUp:function(e){
            if(this._preparedModule){
                var moduleId=this.getUniqueModuleId();
                var startModuleId;
                if(this._startLineShape){
                    startModuleId=this.getModuleId(this._startLineShape);
                }
                this.addModule(moduleId,this._preparedModule,e,null,startModuleId,true);
            }
            if(this._updateLine){
                this.endLine(e);
            }
            return false;
        },
        handleMouseMove:function(e){
            if(this._updateLine){
                this.updateLine(e);
                return true;
            }
            return false;
        },
        
        getBindObject:function(objectType){
            var retVal=new Array();
            switch(objectType){
                case "document":
                    retVal=$(document);
                    break;
                case "stage":
                    retVal=$(this._renderer._canvas);
                    break;
            }
            return retVal;
        },
        
        //actions
        runAction: function(action){
            var self=this;
            require(["action/"+action], function(RunAction) {
                self.prepareAction(action,RunAction);
            });
        },
        prepareAction: function(action,actionConstructor){
            this.showNotification("action","Action: "+actionConstructor.prototype.displayName);
            this._runningAction[action]=new actionConstructor(this);
        },
        cancelAction: function(action){
            this.hideNotification("action");
            this._runningAction[action].cancel();
            delete this._runningAction[action];
        },
        cancelAllActions: function(action){
            for(var action in this._runningAction){
                this.cancelAction(action);
            }
        },
        registerActionTrigger:function(bindEvent,objectType,action,callback,callbackArguments){
            var bindObject=this.getBindObject(objectType);
            
            var self=this;
            $(bindObject).bind(bindEvent+".triggerAction."+action, function(e) {
                var sendArguments=$.extend(callbackArguments,true,[e]);
                callback.apply(self._runningAction[action],sendArguments);
            });
        },
        releaseActionTrigger:function(bindEvent,objectType,action){
            var bindObject=this.getBindObject(objectType);
            $(bindObject).unbind(bindEvent+".triggerAction."+action);
        },
        
        //modules
        getUniqueModuleId: function(){
            var d = new Date();
            var t = d.getTime();
            var id = t.toString();
            return id;
        },
        runModule: function(module){
            this._drawLineOnDrag=true;
            var self=this;
            require(["module/"+module], function(RunModule) {
                self.prepareModule(RunModule);
            });
        },
        prepareModule: function(moduleConstructor){
            this.showNotification("module","Module: "+moduleConstructor.prototype.displayName);
            this._preparedModule=moduleConstructor;
        },
        addModule: function(moduleId,moduleConstructor,e,moduleConfig,startModuleId,sendToAll){
            if(!moduleConfig){moduleConfig=moduleConstructor.prototype.getDefaultConfig.call(null,e);}
            var newModule=new moduleConstructor(moduleId,moduleConfig);
            
            if(startModuleId){
                var startModule=this._allModules[startModuleId];
                if(startModule){
                    startModule.addChildConnection(moduleId);
                    newModule.addParentConnection(startModuleId);
                }
            }
            
            if(sendToAll){
                var moduleConfig=newModule.getConfig();
                moduleConfig.parentModuleId=startModuleId;
                this._clientSocket.broadcastEvent("addModule",[newModule._id,moduleConfig,startModuleId]);
            }
        },
        removeModule: function(moduleId,sendToAll){
            this._allModules[moduleId].remove();
            if(sendToAll){
                this._clientSocket.broadcastEvent("removeModule",[moduleId]);
            }
//            delete this._allModules[moduleId];
//            this.redraw();
        },
        cancelAllModules: function(){
            this.hideNotification("module");
            this._drawLineOnDrag=false;
            this._preparedModule=null;
        },
        drawModule: function(newModule){
            var addObj=newModule.getDomObj();
            this._renderer.addToLayer(addObj);
        },
        registerModuleTrigger:function(bindEvent,action,callback,callbackArguments){
            if(!this._moduleEvents[bindEvent]){
                this._moduleEvents[bindEvent]={};
            }
            this._moduleEvents[bindEvent][action]={
                'callback':callback,
                'callbackArguments':callbackArguments
            }
        },
        releaseModuleTrigger:function(bindEvent,action){
            delete this._moduleEvents[bindEvent][action];
        },
        handleModuleTrigger:function(bindEvent,e){
            switch(bindEvent){
                case 'mousedown':
                    this.handleModuleMouseDown(e);
                    break;
            }
            
            var handled=false;
            var moduleId=this.getModuleId(e.shape);
            
            if(this._moduleEvents[bindEvent]){
                var self=this;
                for(var action in this._moduleEvents[bindEvent]){
                    handled=true;
                    var c=this._moduleEvents[bindEvent][action];
                    var sendArguments=$.extend(c.callbackArguments,true,[moduleId,e]);
                    c.callback.apply(self._runningAction[action],sendArguments);
                }
            }
            return handled;
        },
        
        handleModuleMouseDown:function(e){
            if(this._drawLineOnDrag){
                this.startLine(e);
                return true;
            }
            return false;
        },
        startLine:function(e){
            this._startLineShape=e.shape;
            this._updateLine=true;
            return false;
        },
        endLine:function(e){
            this._renderer._tempLayer.clear();
            this._updateLine=false;
            this._startLineShape=null;
            return false;
        },
        updateLine:function(e){
            if(this._updateLine){
                var context = this._renderer._tempLayer.getContext();
                this._renderer._tempLayer.clear();
                
                var moduleId=this.getModuleId(this._startLineShape);
                var module=this._allModules[moduleId];
                var startPoint=module.getRealPosition();
                var endPoint=this.getOffsetPositionFromCursor(e);
                
                context.beginPath();
                context.moveTo(startPoint.x, startPoint.y);
                context.lineTo(endPoint.x, endPoint.y);
                context.strokeStyle = "#000";
                context.lineWidth = 2;
                context.stroke();
                context.closePath();
            }
        },
        
        getModuleId: function(node){
            if(node){
                if(node.parentModule){
                    return node.parentModule;
                }else if(node.parent){
                    return this.getModuleId(node.parent);
                }
            }
            return null;
        },
        cancelDragIfNotAllowed: function(e){
            if(this._drawLineOnDrag){
                this._renderer.cancelDrag(e);
            }
        },
        
        //notification
        showNotification: function(notificationType,setHtml,duration){
            console.log("showNotification");
            if(duration&&$(this._notificationDiv[notificationType]).css("display")!="none"){
                //queue the notification
                console.log("queue the notification");
                this._notificationQueue[notificationType].unshift({
                    'setHtml':setHtml,
                    'duration':duration
                });
            }else{
                $(this._notificationDiv[notificationType])
                    .html(setHtml)
                    .fadeIn(500);

                if(duration){
                    var self=this;
                    setTimeout(function(){
                        self.hideNotification(notificationType);
                    },duration);
                }
            }
        },
        showQueuedNotification: function(notificationType){
            console.log("showQueuedNotification:"+notificationType);
            if(this._notificationQueue[notificationType].length){
                var showNotification=this._notificationQueue[notificationType].pop();
                this.showNotification(notificationType,showNotification.setHtml,showNotification.duration || 1000);
            }
        },
        hideNotification: function(notificationType){
            console.log("hideNotification:"+notificationType);
            var self=this;
            $(this._notificationDiv[notificationType]).fadeOut(500,function(){
                self.showQueuedNotification(notificationType);
            });
        },
        
        //users
        addUser: function(userConfig,initializing){
            if(!initializing){
                this.showNotification("user","<div class='userColorIcon' style='background-color:"+userConfig.color+"'>&nbsp;</div> A new user has logged in.",1500);
            }
            new User(userConfig);
        },
        removeUser: function(userId){
            if(this._allUsers[userId]){
                this.showNotification("user","<div class='userColorIcon' style='background-color:"+this._allUsers[userId]._color+"'>&nbsp;</div> A user has logged out.",1500);
                this._allUsers[userId].remove();
                delete this._allUsers[userId];
                this.redrawCursorLayer();
            }
        },
        drawUser: function(newUser){
            var addObj=newUser._cursor;
            addObj.x=addObj.x;
            addObj.y=addObj.y;
            
            this._renderer.addToCursorLayer(addObj);
        },
        
        //styles
        applyStyle:function(objectType,className){
            var bindObject=this.getBindObject(objectType);
            $(bindObject).addClass(className);
        },
        removeStyle:function(objectType,className){
            var bindObject=this.getBindObject(objectType);
            $(bindObject).removeClass(className);
        },
        getOffsetPositionFromCursor:function(e,xOffset,yOffset){
            if(!xOffset){xOffset=0;}
            if(!yOffset){yOffset=0;}
            return this.getOffsetPosition(e.clientX+xOffset,e.clientY+yOffset);
        },
        getOffsetPosition:function(x,y){
            var canvasLeft=parseInt($(this._renderer._content).css("left")) || 0;
            var canvasTop=parseInt($(this._renderer._content).css("top")) || 0;
            return {
                'x':x-canvasLeft,
                'y':y-canvasTop
            };
        },
        redraw:function(){
            this._renderer.redraw();
        },
        redrawCursorLayer:function(){
            this._renderer.redrawCursorLayer();
        }
    });
    
    return Map;
});