const wrapper = document.querySelector('.wrapper')
function processViewData(data){
    wrapper.innerHTML = data
}

function requestView(view){
    const req = new XMLHttpRequest()
    const data = new FormData()
    data.append(
        'action','requestView'
    )
    data.append(
        'view',view
    )
    req.addEventListener(
        'load',e=>{
            console.log(req.response)
            processViewData(req.response)
        }
    )
    req.open('POST','/')
    req.send(data)
}