function playmusic(music){
    let data = {songname: music};

    fetch("/playmusic", {
    method: "POST",
    headers: {'Content-Type': 'application/json'}, 
    body: JSON.stringify(data)
    }).then(res => {
    console.log("Request complete! response:", res);
    });
}