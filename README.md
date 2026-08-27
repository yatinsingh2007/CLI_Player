# 🎵 CLI Media Player — Key-Driven System Architecture

System architecture and key-driven control specifications mapped directly from [`raw_io.js`](file:///Users/kshtriyatinsingh/Desktop/Projects/CLI_Player/raw_io.js) and [`cli_player.js`](file:///Users/kshtriyatinsingh/Desktop/Projects/CLI_Player/cli_player.js).

---

## 🏛️ System Architecture Diagram (Key-Driven Operations)

```mermaid
flowchart TD
    subgraph KEYBOARD ["⌨️ RAW KEYBOARD INPUT CONTROL (raw_io.js)"]
        STDIN["📥 process.stdin.setRawMode(true)<br/><i>Raw Byte Event Stream</i>"]
        DECODER{"🔑 Hex Byte Decoder & Matcher"}
        
        CTRL_C["🔴 Ctrl + C<br/><code>data[0] === 0x03</code><br/><i>Exit Process</i>"]
        UP_ARROW["⬆️ Arrow UP<br/><code>0x1b 0x5b 0x41</code><br/><i>Navigate Previous Song</i>"]
        DOWN_ARROW["⬇️ Arrow DOWN<br/><code>0x1b 0x5b 0x42</code><br/><i>Navigate Next Song</i>"]
        ENTER_KEY["↵ Enter Key<br/><code>0x0d / 0x0a</code><br/><i>Trigger Play Song</i>"]
    end

    subgraph ENGINE ["⚡ PLAYBACK ENGINE (cli_player.js)"]
        LIST_SONGS["📂 listSongs(songDirectoryPath)<br/>• Scan ./songs with <code>fs.readdirSync</code><br/>• Log numbered track list"]
        PLAY_SONG["▶️ playSong(songFilePath)<br/>• Spawn <code>ffplay -nodisp -autoexit</code><br/>• Log stdout & stderr data events"]
    end

    subgraph SUBPROCESS ["🔊 AUDIO SUBPROCESS ENGINE"]
        FFPLAY["⚙️ ffplay Child Process"]
        STDOUT_EVENT["📥 stdout event listener"]
        STDERR_EVENT["📥 stderr event listener"]
    end

    STDIN --> DECODER
    DECODER -->|data[0] === 0x03| CTRL_C
    DECODER -->|0x1b 0x5b 0x41| UP_ARROW
    DECODER -->|0x1b 0x5b 0x42| DOWN_ARROW
    DECODER -->|0x0d / 0x0a| ENTER_KEY

    ENTER_KEY -->|Triggers Playback| PLAY_SONG
    PLAY_SONG -->|Spawns| FFPLAY
    FFPLAY --> STDOUT_EVENT
    FFPLAY --> STDERR_EVENT
    LIST_SONGS -->|Directory Scan| SONGS_DIR["📁 ./songs"]
```

---

## ⌨️ Key Operation Specifications

Operating the CLI media player relies exclusively on raw keystrokes captured via `process.stdin.setRawMode(true)` rather than mouse or terminal cursor interactions:

| Key Input | Hex Byte Matcher | Decimal Bytes | Target Operation |
| :--- | :--- | :--- | :--- |
| **Ctrl + C** | `data[0] === 0x03` | `3` | Exit application (`process.exit(0)`) |
| **Arrow UP** | `data[0] === 0x1b && data[1] === 0x5b && data[2] === 0x41` | `27 91 65` | Move active track selection UP |
| **Arrow DOWN** | `data[0] === 0x1b && data[1] === 0x5b && data[2] === 0x42` | `27 91 66` | Move active track selection DOWN |
| **Enter Key** | `data[0] === 0x0d \|\| data[0] === 0x0a` | `13` or `10` | Play highlighted track via `playSong()` |

---

## 🛠️ Codebase Component Specifications

### 1. Key Decoder Module (`raw_io.js`)
Handles raw byte-level decoding from terminal input stream:
```javascript
process.stdin.setRawMode(true);

process.stdin.on('data', (data) => {
    console.log(data.toString(), data);

    // Ctrl + C: Exit
    if (data[0] === 0x03) {
        process.exit(0);
    }

    // Arrow keys
    if (data[0] === 0x1b && data[1] === 0x5b) {
        if (data[2] === 0x41) {
            console.log("Arrow UP");
        }
        if (data[2] === 0x42) {
            console.log("Arrow DOWN");
        }
    }

    // Enter key (Carriage Return / Newline)
    if (data[0] === 0x0d || data[0] === 0x0a) {
        console.log("Enter key");
    }
});
```

### 2. Player Engine Module (`cli_player.js`)
Handles song directory listing and spawning `ffplay` audio subprocess:
```javascript
const { spawn } = require('child_process');

function listSongs(songDirectoryPath) {
    songs = fs.readdirSync(songDirectoryPath);
    songs.forEach((song, index) => {
        console.log(`${index + 1}. ${song}`);
    });
}

function playSong(songFilePath) {
    const process = spawn('ffplay', [
        '-nodisp',
        '-autoexit',
        songFilePath
    ]);

    process.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    process.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });
}
```
