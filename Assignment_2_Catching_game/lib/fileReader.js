/*
*   loads a text file into a string
*/
export async function loadText(filepath)
{
    return fetch(filepath).then(async function (resp){
        if(resp.status == 200 && resp.ok){
            return resp.text()
        }
        else{
            throw ReferenceError('Status error reading '+filepath)
        }
    },(r)=>{throw ReferenceError('Wow. Request failed completely while reading ' + filepath)})
}

export default loadText 