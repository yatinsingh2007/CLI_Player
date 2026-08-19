const { spawn } = require('child_process')
function listSongs(songDirectoryPath) {
    songs = fs.readdirSync(songDirectoryPath)
    songs.forEach((song, index) => {
        console.log(`${index + 1}. ${song}`)
    })
}


function playSong(songFilePath){
    const process = spawn('ffplay' , [
        '-nodisp',
        '-autoexit',
        songFilePath
    ])

    process.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`)
    })

    process.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`)
    })
}

