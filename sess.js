let sess = document.cookie.split(';').map(e=>e.split("=")).filter(e=>{return e[0]=='logged'})
if (sess.length) {
    console.log((sess))
}else{
    requestView('login')
}

