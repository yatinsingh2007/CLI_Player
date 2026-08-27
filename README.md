# 🎵 CLI Media Player

A lightweight, key-driven Command Line Interface (CLI) audio media player built with Node.js. It scans local audio files from the `songs/` directory and streams playback through an isolated `ffplay` subprocess, controlled using raw keyboard inputs.

---

## 🏛️ System Architecture Diagram

```mermaid
graph TD
    subgraph KEYBOARD["Raw Keyboard Input Engine"]
        STDIN["Raw Terminal Input Stream"]
        DECODER["Key Byte Decoder"]
        NAV_KEYS["Up and Down Arrow Keys"]
        PLAY_KEY["Enter Key"]
        EXIT_KEY["Ctrl plus C Key"]
    end

    subgraph ENGINE["CLI Player Engine"]
        SCANNER["Directory Scanner"]
        CONTROLLER["Playback Controller"]
        STATE["Selection State Store"]
    end

    subgraph AUDIO["Audio Subprocess Engine"]
        FFPLAY["ffplay Child Process"]
        STDOUT_LOG["stdout Logger"]
        STDERR_LOG["stderr Logger"]
    end

    STDIN --> DECODER
    DECODER --> NAV_KEYS
    DECODER --> PLAY_KEY
    DECODER --> EXIT_KEY

    NAV_KEYS --> STATE
    PLAY_KEY --> CONTROLLER
    EXIT_KEY --> CONTROLLER

    SCANNER --> STATE
    CONTROLLER --> FFPLAY
    FFPLAY --> STDOUT_LOG
    FFPLAY --> STDERR_LOG
```

---

## 🔄 User Interaction Workflow Diagram

```mermaid
flowchart TD
    START["🚀 Start CLI Application"] --> SCAN["📂 Scan songs Directory"]
    SCAN --> DISPLAY["📜 Display Numbered Song List"]
    DISPLAY --> RAW_MODE["⌨️ Enable Raw Terminal Input Mode"]
    RAW_MODE --> WAIT["⏳ Wait for User Keypress Event"]

    WAIT -->|Press Up or Down Arrow| NAV["⬆️/⬇️ Navigate Track Selection"]
    NAV --> WAIT

    WAIT -->|Press Enter Key| PLAY["▶️ Spawn ffplay Subprocess"]
    PLAY --> STREAM["🔊 Stream Audio Playback"]
    STREAM --> WAIT

    WAIT -->|Press Ctrl plus C| EXIT["🔴 Terminate Process and Exit"]
```
