const { readdirSync } = require("fs");
const { spawn } = require("child_process");
const { join } = require("path");

let allSongs = null;
let userSelectionIndex = 0;
let currentSongProcess = null;
let currentlyPlayingIndex = -1;
let isPaused = false;

function listSongs(songDirPath) {
    allSongs = readdirSync(songDirPath).filter(file => !file.startsWith('.'));

    console.clear();
    console.log("=== Music Player ===");
    console.log("Controls: [↑/↓] Navigate | [Enter] Play | [Space / P] Pause/Play | [Ctrl+C] Exit\n");

    allSongs.forEach((data, index) => {
        const isSelected = userSelectionIndex === index;
        const isPlayingThis = currentlyPlayingIndex === index;

        let statusSymbol = " ";
        if (isPlayingThis) {
            statusSymbol = isPaused ? "⏸" : "▶";
        }

        const cursor = isSelected ? ">" : " ";
        console.log(`${cursor} ${statusSymbol} ${data}`);
    });

    console.log("");
    if (currentlyPlayingIndex !== -1 && currentSongProcess) {
        const stateStr = isPaused ? "PAUSED" : "PLAYING";
        console.log(`Status: [${stateStr}] ${allSongs[currentlyPlayingIndex]}`);
    } else {
        console.log("Status: [STOPPED]");
    }
}

function stopCurrentSong() {
    if (currentSongProcess) {
        currentSongProcess.removeAllListeners('exit');
        currentSongProcess.kill('SIGKILL');
        currentSongProcess = null;
    }
}

function playSong(songPath, songIndex) {
    stopCurrentSong();

    currentlyPlayingIndex = songIndex;
    isPaused = false;

    currentSongProcess = spawn('vlc', ['--intf', 'rc', songPath], {

    });

    currentSongProcess.on('error', (err) => {
        console.error(`Error spawning afplay: ${err.message}`);
    });

    currentSongProcess.on('exit', () => {
        currentSongProcess = null;
        currentlyPlayingIndex = -1;
        isPaused = false;
        listSongs(join(__dirname, 'songs'));
    });
}

function togglePausePlay() {
    if (!currentSongProcess) {
        if (allSongs && allSongs[userSelectionIndex]) {
            playSong(join(__dirname, 'songs', allSongs[userSelectionIndex]), userSelectionIndex);
        }
        return;
    }

    if (isPaused) {
        currentSongProcess.kill('SIGCONT');
        isPaused = false;
    } else {
        currentSongProcess.kill('SIGSTOP');
        isPaused = true;
    }
}


function getSongDuration(songfilePath){
    return new Promise((res , rej) => {
        const afInfoCP = spawn('afinfo',[songfilePath]);
        afInfoCP.stdout.on('data',data=>{
            res(data.toString().split("estimated duration: ")[1].split(".")[0]);
        })
    })
}
listSongs(join(__dirname, 'songs'));
getSongDuration(join(__dirname, 'songs', allSongs[0])).then((duration) => {
    console.log(duration);
});


process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', data => {
    const final = data.toString();

    // Exit on Ctrl+C
    if (final === '\u0003') {
        stopCurrentSong();
        process.exit(0);
    }

    if (allSongs && allSongs.length > 0) {
        if (final === '\u001b[A') { // Up arrow - cyclic navigation
            userSelectionIndex = (userSelectionIndex - 1 + allSongs.length) % allSongs.length;
        } else if (final === '\u001b[B') { // Down arrow - cyclic navigation
            userSelectionIndex = (userSelectionIndex + 1) % allSongs.length;
        } else if (final === '\r' || final === '\n') { // Enter key
            playSong(join(__dirname, 'songs', allSongs[userSelectionIndex]), userSelectionIndex);
        } else if (final === ' ' || final.toLowerCase() === 'p') { // Spacebar or P key
            togglePausePlay();
        }
    }

    listSongs(join(__dirname, 'songs'));
});

