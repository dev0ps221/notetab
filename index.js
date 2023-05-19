const { MongoClient } = require('mongodb');

const url = 'mongodb://127.0.0.1:2727';
const client = new MongoClient(url);

const http = require('http')
const fs = require('fs');
const { delimiter } = require('path');
const { match } = require('assert');

const assets = {
    '/app.js':'js/app.js',
    '/sess.js':'js/sess.js',
    '/app.css':'css/app.css'
}
const views = {
    'home':'app.html',
    'notes':'notes.html',
    'login':'login.html',
    'register':'register.html'
}

let notetab = null
let users   = null 
let notes   = null


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

const server = http.createServer(
    (request,response)=>{
        response.statusCode = 200
        if(request.method.toLowerCase()=='get'){

            let reqextarr = request.url.split('.')
            if(reqextarr[reqextarr.length-1] == 'js'){
                response.setHeader('Content-Type', 'text/javascript');
            }

            TextResponse(response,processGet(request,response))
        }

        if(request.method.toLowerCase()=='post'){
            let body = []
            
            request.on(
                'data', (chunk) => {
                    body.push(chunk);
                }
            )
            request.on('end', () => {
                body = body.toString()
                
                
                // const delim =  body.toString().split('\r\n')[0]
                // let fields = body.split(delim).filter(elem=>elem.match('form-data')).map(elem=>elem.split(';')[1].split('\r\n\r\n').map(e=>{return e.replace('name=','').replace('\r\n','').replaceAll("\"",'').trim()})).map(([name,val])=>{ return {name,val} })
                let fields = body.split('&').map(e=>e.split('=')).map(([name,val])=>{return {name,val}})
                processPost(fields,response)
            })

        }


        function TextResponse(response,data){
            try{
                if(data){
                    response.write(data)
                    response.end();
                }
            }catch(e){
                console.log(e)
            }
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
                }else{
                    response.writeHead(301, { Location: "/" });
                    response.end();
                }
            }
        }

        function matchPostField(fieldname,fields){
            let match = null
            fields.forEach(
                f=>{
                    if(f.name == fieldname) match = f.val
                }
            )
            return match
        }
        function processPost(fields,response){
            let username = null
            let password = null
            const action = matchPostField('action', fields)
            if(action){
                switch (action){

                    case 'requestView':
                        const view = matchPostField('view', fields)
                        if(view){
                            TextResponse(response, echoView(view))
                        }
                        break;
                    case 'login':
                        username = matchPostField('username', fields)
                        password = matchPostField('pass', fields)
                        if(username && password){
                            const searchData = {username,password}
                            refreshMongoStuff()
                            console.log(users)
                            users.findOne( 
                                searchData
                                ,(e,data)=>{
                                    console.log(data)
                                } 
                            )
                           
                        }else{
                            console.log('missing fields')
                        }
                        break;

                    case 'register':
                        refreshMongoStuff()
                        username = matchPostField('username', fields)
                        password = matchPostField('pass', fields)
                        if(username && password){
                            users.insertOne({username,password}).then(data=>{
                                const userid = (data.insertedId.toString())
                                TextResponse(
                                    response, cookieScript('logged',userid)
                                )
                            })
                        }
                        break;
            
                    default:
                        console.log('unrecognized action')
                        console.log(action)
                        TextResponse(response, 'unrecognized action')
                        break;

                }
            }
        }    
    }   
)
function cookieScript(name,value){
    const scriptstring = `
        <script>
            document.cookie = ${ name+'='+value};
            document.location.href = '/'
        </script>
    `
    console.log(scriptstring)
    return scriptstring 
}
function refreshMongoStuff(){
        
    console.log('connected to mongodb server')


    users = notetab.collection('users')

    notes = notetab.collection('notes')

    console.log('connected to notetab')

}
server.listen(
    8080,e=>{
        console.log(('server is listening on 8080'))

        notetab =  client.db('notetab')

        refreshMongoStuff()

    }
)