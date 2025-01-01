console.log('kskjnjk');
let currentsong = new Audio();
let songs;
let currfolder;
function formatTime(rawTime) {
    // Parse the raw time into a number (in seconds)
    const seconds = Math.floor(Number(rawTime));

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Format to ensure two digits for both minutes and seconds
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = remainingSeconds.toString().padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currfolder=folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
      songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songul.innerHTML=""
    for (const song of songs) {
        songul.innerHTML += `
            <li>
                <img class="invert" width="34" src="music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ").replace(".mp3", "")}</div>
                    <div>song artist</div>
                </div>
                <div class="playnow">
                   <span>play now</span>
                   <img class="invert" src="play.svg" alt="">
                </div>
            </li>`;
    }

    // Attach event listeners to each song in the list
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            const songName = e.querySelector(".info").firstElementChild.innerHTML.trim();
            console.log("Selected song:", songName); // Debugging log
            // console.log(e.querySelector(".info").firstElementChild.innerHTML)
            // playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
            playmusic(songName + ".mp3"); // Ensure .mp3 extension is added
        });
    });
    return songs

}

const playmusic = (track,pause=false) => {
    // console.log("Playing song:", track); // Debugging log
    currentsong.src = `/${currfolder}/`+track; // Full URL
    // currentsong.src = `http://127.0.0.1:3000/songs/${track}`; // Full URL
    // currentsong.src="/songs/"+track
    if(!pause){

        currentsong.play()
        play.src = "pause.svg";
    }
    // .catch(error => {
    //     console.error("Error playing audio:", error);
    // });
    document.querySelector(".songinfo").innerHTML=decodeURI(track)
    document.querySelector(".songtime").innerHTML="00:00 / 00:00"
    
};
async function displayalbums(params) {
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors=div.getElementsByTagName("a")
    let cardcontainer=document.querySelector(".cardcontainer")
    let array=Array.from(anchors)
    for(let index=0;index<array.length;index++){
        const e=array[index];
    
        if(e.href.includes("/songs")){
            let folder=e.href.split("/").slice(-2)[0]
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await a.json();
            cardcontainer.innerHTML=cardcontainer.innerHTML+`<div data-folder="${folder}" class="card">
                        <div  class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28"
                                color="#000000" fill="none">
                                <!-- Larger Green Circular Background -->
                                <circle cx="14" cy="14" r="13" fill="#1DB954" />
                                <!-- Solid Black Play Button -->
                                <path d="M10 7L19 14L10 21V7Z" fill="black" />
                            </svg>





                        </div>
                        <img src=" /songs/${folder}/cover.jpg" alt="">
                        <h2>${response.tittle}</h2>
                        <p>${response.discription}</p>
                    </div>`
        }
    }
        Array.from(document.getElementsByClassName("card")).forEach(e=>{
            e.addEventListener("click",async item=>{
                songs= await getsongs(`songs/${item.currentTarget.dataset.folder}`)
                playmusic(songs[0])
                
            })
        })
    
    }


async function main(params) {
      await getsongs("songs/fav2");
    playmusic(songs[0],true)
    console.log(songs);
// display all the albums
    displayalbums();

    // Play/Pause toggle button
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "pause.svg";
        } else {
            currentsong.pause();
            play.src = "play.svg";
        }
    });
    currentsong.addEventListener("timeupdate",()=>{
        console.log(currentsong.currentTime,currentsong.duration);
        document.querySelector(".songtime").innerHTML=`${formatTime(currentsong.currentTime)}/${formatTime(currentsong.duration)}`
        document.querySelector(".circle").style.left=(currentsong.currentTime/currentsong.duration)*100+"%";
    })
    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent=(e.offsetX/e.target.getBoundingClientRect().width)*100
        document.querySelector(".circle").style.left=percent+"%";
        currentsong.currentTime=((currentsong.duration)*percent)/100
    })
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left="0"
    })
    
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-120%"
    })
    previous.addEventListener("click",()=>{
        currentsong.pause()
        console.log("previous clicked")
        let index=songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if((index-1)>length){

            playmusic(songs[index-1])
        }
    })
    next.addEventListener("click",()=>{
        currentsong.pause()
        console.log("next clicked")
        let index=songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if((index+1)<songs.length){

            playmusic(songs[index+1])
        }
    })
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        console.log(e,e.target,e.target.value)
        currentsong.volume=parseInt(e.target.value)/100
    })
    document.querySelector(".volume>img").addEventListener("click",e=>{
        if(e.target.src.includes("volume.svg")){
          e.target.src=  e.target.src.replace("volume.svg","mute.svg")
            currentsong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else{
            e.target.src=e.target.src.replace("mute.svg","volume.svg")
            currentsong.volume=.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10;
        }
    })
    
}

main();
