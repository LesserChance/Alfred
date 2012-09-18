define(['lib/class'], function() {
    //add the now.js script
    var nowPath="http://"+window.location.hostname+":8124/nowjs/now.js";
    var head= document.getElementsByTagName('head')[0];
    var script= document.createElement('script');
    script.type= 'text/javascript';
    script.src= nowPath;
    head.appendChild(script);
    
    //load the main class
    require(["main"]);
});