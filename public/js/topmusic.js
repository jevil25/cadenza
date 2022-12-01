function song(name){
    console.log(name)
    let data = {songname: name};

    fetch("/getmusic", {
        method: "POST",
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(data)
        }).then(res => {
        console.log("Request complete! response:", res);
        });
}