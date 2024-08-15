// import "./task_1.js"
// import "./makeShaderMaterial.js"
// import "./GPshading_v2.js"
window.location.href = 'task_1.html'
document.addEventListener("keydown", (e)=>{
    switch(e.key){
        case '1':
            window.location.href = 'task_1.html'
            break;
        case '2':
            window.location.href = 'task_2.html'
            break;
        case '3':
            window.location.href = 'task_3.html'
            break;
        default:
            break;
    }
})