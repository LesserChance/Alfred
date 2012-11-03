var globalMap;
define(['jquery', 'map'], function($, Map) {
    var initCanvas = function() {
        $(document).ready(function() {
            new Map();
        });
    }
    initCanvas();
});