const http = require('http')
const fs = require('fs')
const assets = {
    '/sess.js':'sess.js'
}
const views = {
    'home':'app.html',
    'notes':'notes.html',
    'login':'login.html',
    'register':'register.html'
}
function echoView(viewname){
    if(Object.keys(views).includes(viewname)){
        data = fs.readFileSync(views[viewname]).toString()
        return data
    }
}
function echoAsset(assetname){
    if(Object.keys(assets).includes(assetname)){
        data = fs.readFileSync(assets[assetname]).toString()
        return data
    }
}
const server = http.createServer()
server.listen(8080,e=>{

    function TextResponse(response,data){
        response.write(data);
        response.end();
    }
    function jsonResponse(response,data){
        response.setHeader('Content-Type', 'application/json');
        response.write(data);
        response.end();
        
    }
    function processGet(request){
        if(request.url == '/'){
            return echoView('home')
        }else{
            if(Object.keys(assets).includes(request.url)){
                return echoAsset(request.url)
            }
        }
    }
    function processPost(request,response){
        console.log(request)
    }
    server.on(
        'request',(request,response)=>{
            response.statusCode = 200
            if(request.method.toLowerCase()=='get'){

                let reqextarr = request.url.split('.')
                if(reqextarr[reqextarr.length-1] == 'js'){
                    response.setHeader('Content-Type', 'text/javascript');
                }

                TextResponse(response,processGet(request))
            }
            if(request.method.toLowerCase()=='post'){
                processPost(request,response)
            }
        }
    )
    
    console.log(('server is listening on 8080'))
})
