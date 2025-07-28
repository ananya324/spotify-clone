let currentSong = new Audio;
let songs = []
let currfolder;

async function getsongs(folder) {
    currfolder = folder;
    let data = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await data.text();
    console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    //play the first song 

    //show all the songs in the playlist
    let songUl = document.querySelector(".newsongs").getElementsByTagName("ul")[0];
    songUl.innerHTML = ""; // Clear previous list
    for (const song of songs) {
        songUl.innerHTML += `<li>
  <img class="invert" src="icons/music.svg" alt="" height="49px">
  <div class="info">
      <div>${song.replaceAll("%20", " ")}</div>
      <div></div>
  </div>
  <svg class="hehe" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="48" fill="white"/>
    <polygon points="40,30 70,50 40,70" fill="black"/>
  </svg>
</li>`;
    }
    //attach an even listener to each song
    Array.from(document.querySelector(".newsongs").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs
}
const playMusic = (track, pause = false) => {

    // let audio = new Audio(audio)
    currentSong.src = `/${currfolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "icons/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"


}

async function displayAlbums() {
    let data = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await data.text();
    console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            //Get the metadata of every folder0
            let data = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let response = await data.json();
            console.log(response)
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div  class="play">
                            <svg width="52" height="52" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <!-- Green Circle -->
                                <circle cx="50" cy="50" r="48" fill="#1ED760" />

                                <!-- Black Play Triangle -->
                                <polygon points="40,30 70,50 40,70" fill="black" />
                            </svg>

                        </div>
                        <img src="/songs/${folder}/cover1.jpeg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`

        }
    }
    console.log(anchors);
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {

            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })

}

async function main() {
    //get the list of all the songs
    await getsongs("songs/ncs")
    playMusic(songs[0], true)
    console.log(songs)
    //Display all the albums on the page
    displayAlbums()

    //show all the songs in the playlist
    let songUl = document.querySelector(".newsongs").getElementsByTagName("ul")[0];
    songUl.innerHTML = ""; // Clear previous list
    for (const song of songs) {
        songUl.innerHTML += `<li>
  <img class="invert" src="icons/music.svg" alt="" height="49px">
  <div class="info">
      <div>${song.replaceAll("%20", " ")}</div>
      <div></div>
  </div>
  <svg class="hehe" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="48" fill="white"/>
    <polygon points="40,30 70,50 40,70" fill="black"/>
  </svg>
</li>`;

    }
    //attach an even listener to each song
    Array.from(document.querySelector(".newsongs").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })


    //attach an event listener to play , next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "icons/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "icons/playbutton.svg"
        }
    })

    //listen for timeupdate event 
    currentSong.addEventListener("timeupdate", () => {
        const current = secondToMinutesSeconds(currentSong.currentTime);
        const total = secondToMinutesSeconds(currentSong.duration || 0); // prevent NaN before song loads
        document.querySelector(".songtime").innerHTML = `${current} / ${total}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        document.querySelector(".progress").style.width = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    function secondToMinutesSeconds(sec) {
        let minutes = Math.floor(sec / 60);
        let seconds = Math.floor(sec % 60);
        if (seconds < 10) seconds = "0" + seconds;
        return `${minutes}:${seconds}`;
    }


    //add an eventlistner to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let seekbar = e.currentTarget;
        let clickposition = e.offsetX;
        let width = seekbar.clientWidth;
        let percentage = clickposition / width;
        currentSong.currentTime = percentage * currentSong.duration;

        document.querySelector(".circle").style.left = (percentage * 100) + "%";
    })


    document.querySelector(".hamburger").addEventListener("click", () => {
        const leftpanel = document.querySelector(".left");
        if (leftpanel.style.left == "0%") {
            leftpanel.style.left = "-100%"
            document.querySelector(".hamburger").style.stroke = "whitesmoke"
        }
        else {
            leftpanel.style.left = "0%"
            document.querySelector(".hamburger").style.stroke = "grey"

        }

    })

    next.addEventListener("click", () => {
        console.log("next clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        } else {
            console.log("Already at the last song");
            // Optional: Loop back to first song
            // playMusic(songs[0]);
        }
    });

    previous.addEventListener("click", () => {
        console.log("previous clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index > 0) {
            playMusic(songs[index - 1]);
        } else {
            console.log("Already at the first song");
            // Optional: Loop to last song
            // playMusic(songs[songs.length - 1]);
        }
    });
    currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        } else {
            console.log("Playlist ended");
            // Optional: Loop to first song
            // playMusic(songs[0]);
        }
    });

    document.querySelector(".range input").addEventListener("input", (e) => {
        let volume = e.target.value / 100; // Convert 0–100 to 0–1
        currentSong.volume = volume;
        console.log("Volume set to:", volume);
    });

    //add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        console.log(e.target)
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = 0.10;
        }
    })



}


main();
