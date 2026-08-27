# 🎵 Node.js CLI Media Player — System Architecture

A lightweight, zero-dependency Node.js command-line interface (CLI) media player powered by VLC dummy mode, Apple `afinfo` track duration parsing, zero-flicker ANSI rendering, and raw terminal keyboard controls.

---

## 🏛️ System Architecture (Mermaid Diagram)

```mermaid
flowchart TD
    subgraph INPUT ["⌨️ INTERACTIVE INPUT SYSTEM"]
        node1["📥 Terminal Raw Input (process.stdin)"]
        node2["🎮 Key Code Router & Mapper"]
    end

    subgraph ENGINE ["⚡ CORE STATE & METADATA"]
        node3["📂 Songs Directory Scanner"]
        node4["⏱️ macOS Duration Extractor (afinfo)"]
        node5["🧠 Global State Manager"]
    end

    subgraph PLAYBACK ["🔊 VLC PLAYBACK ENGINE"]
        node6["🎛️ VLC Subprocess Controller"]
        node7["📶 Unix Signal Controller"]
        node8["⚙️ VLC Dummy Instance (vlc --intf dummy)"]
    end

    subgraph DISPLAY ["🖥️ ANSI TERMINAL RENDERER"]
        node9["📊 Progress Bar Calculator"]
        node10["🎨 Dynamic ANSI UI Engine"]
        node11["📺 Terminal Display Output (stdout)"]
    end

    node1 --> node2
    node2 -->|Selection & Navigation| node5
    node2 -->|Play / Pause / Stop| node6

    node3 --> node5
    node4 --> node5

    node6 -->|Spawn stdio:pipe| node8
    node6 -->|Send Signal| node7
    node7 -->|SIGSTOP / SIGCONT| node8
    node8 -->|Auto-Play Next Track| node5

    node5 -->|State & Elapsed Time| node9
    node9 --> node10
    node10 --> node11
```

---

## 🔄 Component Data Flow Architecture

```mermaid
flowchart LR
    subgraph USER ["👤 User Input"]
        kb["⌨️ Raw Keypress Bytes"]
    end

    subgraph APP ["⚙️ CLI Core Application"]
        decode["🔑 ASCII Decoder"]
        ctrl["🕹️ Main Controller"]
        state["📦 State Store"]
        afinfo["⏳ afinfo Metadata Parser"]
    end

    subgraph ENGINE ["🔊 VLC Engine"]
        vlc["⚙️ VLC Subprocess"]
    end

    subgraph SCREEN ["🖥️ Display Output"]
        ui["📺 ANSI Terminal UI"]
    end

    kb --> decode
    decode --> ctrl
    ctrl --> state
    afinfo --> state
    ctrl -->|Spawn / Signal| vlc
    state --> ui
```

---

## 🎨 Interactive Terminal UI Preview

```
=====================================================
           🎵  NODE.JS CLI MEDIA PLAYER  🎵          
=====================================================

  AUDIO LIBRARY (4 Tracks):
  ---------------------------------------------------
     ▶ [01] Chris Brown, Tyga - Girl You Loud.mp3
   > ⏸ [02] OneRepublic - Sunshine.mp3
     [03] Samuel Kim & Lorien - I Really Want to Stay at Your House.mp3
     [04] Wuthering Waves, Tarokiki - Voyaging Star's Farewell.mp3
  ---------------------------------------------------

  CURRENT PLAYBACK:
  Track  : OneRepublic - Sunshine.mp3
  Status : [PAUSED]
  Progress: [███████████████░░░░░░░░░░░░░░░] 50.0% (01:21 / 02:42)

=====================================================
Controls: [↑/↓/k/j] Nav | [Enter] Play | [Space] Pause/Play | [S] Stop | [Q] Quit
```

---

## 🛠️ Subsystem Technical Specifications

> [!NOTE]
> All core functions operate natively using Node.js standard libraries (`child_process`, `fs`, `path`) without third-party npm dependencies.

### 1️⃣ Audio Directory Scanner
- **Path:** `./songs` relative to execution root.
- **Filtering Rule:** Ignores dotfiles (`.DS_Store`) and keeps supported extensions (`.mp3`, `.m4a`, `.wav`, `.flac`, `.aac`, `.ogg`).
- **Sorting:** Alphanumeric natural sort order.

### 2️⃣ Metadata Extractor (`afinfo`)
- **Utility:** Apple File Info (`afinfo`)
- **Execution:** Async `execFile('afinfo', [filePath])`
- **Regex Extraction:**
  $$\text{duration} = \text{parseFloat}(\text{stdout.match}(/\text{estimated duration: }([\d.]+)\text{ sec}/i)[1])$$
- **Cache:** In-memory `Map<string, number>` prevents duplicate process spawns.

### 3️⃣ VLC Subprocess Engine
- **Command Flags:** `vlc --intf dummy --play-and-exit <filepath>`
- **Standard I/O:** `stdio: 'pipe'` completely isolates VLC standard output.
- **Process Signals:**
  - `SIGSTOP`: Suspends child process (Pause).
  - `SIGCONT`: Resumes child process (Resume).
  - `SIGKILL`: Kills process on track change or exit.

### 4️⃣ Keyboard Raw Mode Mapping

| Key Input | ASCII Code | Trigger Action |
| :--- | :--- | :--- |
| `Spacebar` | `32` | Toggle Play / Pause |
| `Enter` | `13` / `10` | Play Selected Track |
| `Up Arrow` / `k` | `27 91 65` / `107` | Navigate Up |
| `Down Arrow` / `j` | `27 91 66` / `106` | Navigate Down |
| `S` / `s` | `115` / `83` | Stop Playback |
| `Q` / `q` / `Ctrl+C` | `113` / `81` / `3` | Clean Quit & Restore Terminal |

---

## ⚡ Signal & Process Lifecycle Workflow

```mermaid
flowchart TD
    start["🚀 Process Launch"] --> init["1. Hide Cursor & Enable Raw Stdin Mode"]
    init --> scan["2. Scan ./songs & Parse Track Durations"]
    scan --> render["3. Render Initial ANSI UI Screen"]
    
    render --> loop{"🔄 User Key Event"}
    loop -->|Enter/Space| spawn["Spawn VLC stdio:pipe"]
    loop -->|Up/Down| nav["Update Selection & Re-render"]
    loop -->|Spacebar| signal["Send SIGSTOP / SIGCONT Signal"]
    
    loop -->|Q / Ctrl+C| exit["🛑 Process Cleanup & Termination"]
    exit --> stop_vlc["Kill VLC Subprocess SIGKILL"]
    stop_vlc --> restore["Restore Cursor & Disable Raw Mode"]
```
