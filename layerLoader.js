
/*

 LayerLoader for ESRI JS-API v3.24+
 Joshua A. Lemli, 2018


    `LayerLoader` gets used in an example chunk of code in `app.html`.
 
    `LayerLoader` is a function.
    
    `LayerLoader` exists in the global namespace, but you should use `dojo/ready` to make sure it's ready for use.

        // require the ready function
        require(["dojo/ready"],function(dojoReady){
            // use it with a "callback"
            dojoReady(function(){
                // use the `LayerLoader` function
                LayerLoader( map, layers )
            })
        })
    
    `LayerLoader` takes three parameters
    
        LayerLoader = function (map, layers, timeoutInMilliseconds = 2000 ) { ... }

            map = <your map>
            layers = <your array of esri layers>
            timeoutInMilliseconds = <an option manual timeout in milliseconds> (defaults to 2000 milliseconds)

    `LayerLoader` in action might look like this:

        LayerLoader( myMap, someLayers, 1666 )

*/


var LayerLoader

require([
    "esri/request",
    "dojo/Deferred",
    "dojo/promise/all"
],function(
    esriRequest,
    dojoDeferred,
    dojoPromiseAll
){
    LayerLoader = function (map,layers, timeoutInMilliseconds = 2000 ) {
        console.log("LayerLoader :: beginning an `esri/request` to " + layers.length + " layers")
        if (!map) console.log("LayerLoader :: `esri/map` missing, cannot add layers but will test them anyway")
        var defer = new dojoDeferred()
        var failedLayers = []
        dojoPromiseAll(layers.map(function(layer){
            var urlDefer = new dojoDeferred()
            var request = esriRequest({
                url: layer.url,
                content: { f: "json" },
                handleAs: "json",
                callbackParamName: "callback"
            })
            var killswitch = setTimeout(function(){
                console.log("LayerLoader :: manual timeout - ",layer.url)
                request.cancel()
            }, timeoutInMilliseconds )
            request.then(
                function() {
                    clearTimeout(killswitch)
                    console.log("LayerLoader :: success - ",layer.url)
                    urlDefer.resolve()
                    if (map) map.addLayer(layer)
                },
                function(esriRequestError) {
                    clearTimeout(killswitch)
                    console.log("LayerLoader :: failure - ",layer.url)
                    failedLayers.push(layer)
                    urlDefer.resolve()
                }
            )
            return urlDefer.promise
        })).then(function(){
            if (map) console.log("LayerLoader :: finished adding " + (layers.length - failedLayers.length) + " layers to map")
            if (failedLayers.length) console.log("LayerLoader :: "+failedLayers.length+" failed layers ",failedLayers)
            defer.resolve()
        })
        return defer.promise
    }
})
