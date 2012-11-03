define(['jquery','mapModule'], function($,MapModule) {
    var Blob = MapModule.extend({
        className:"blob",
        init: function(){
            console.log("DRAW A BLOB");
        }
    });
    
    return Blob;
});