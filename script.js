let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

async function getSongs(folder) {
    currFolder = folder;

    let response = await fetch(`/${folder}/`);
    let html = await response.text();

    let div = document.createElement("div");
    div.innerHTML = html;

    let as = div.getElementsByTagName("a");
    songs = Array.from(as)
        .filter(el => el.href.endsWith(".mp3"))
        .map(e => e.href.split(`/${folder}/`)[1]);

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (let song of songs) {
        songUL.innerHTML += `
        <li>
            <img class="invert" src="icons/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Spotify</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="icons/play.svg" alt="">
            </div>
        </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
}

function playMusic(track, pause = false) {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) currentSong.play();
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let response = await fetch(`/songs/`);
    let html = await response.text();

    let div = document.createElement("div");
    div.innerHTML = html;
    let anchors = div.getElementsByTagName("a");

    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    Array.from(anchors).forEach(async e => {
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").filter(Boolean).pop();

            let infoResponse = await fetch(`/songs/${folder}/info.json`);
            let info = await infoResponse.json();

            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
                            <path d="M11.596 8.697l-6.363 3.692A.5.5 0 0 1 4 11.942V4.058a.5.5 0 0 1 .757-.424l6.363 3.692a.5.5 0 0 1 0 .871z"/>
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h2>${info.title}</h2>
                    <p>${info.description}</p>
                </div>`;
        }
    });

    setTimeout(() => {
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            });
        });
    }, 1000);
}

async function main() {
    await getSongs("songs/ncs");
    playMusic(songs[0], true);

    displayAlbums();

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = e.offsetX / e.target.getBoundingClientRect().width;
        currentSong.currentTime = percent * currentSong.duration;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    document.querySelector("#previous").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index > 0) playMusic(songs[index - 1]);
    });

    document.querySelector("#next").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });

    document.querySelector(".playbar img").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
        } else {
            currentSong.pause();
        }
    });
}

main();
