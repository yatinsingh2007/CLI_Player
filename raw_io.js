process.stdin.setRawMode(true)

process.stdin.on('data', (data) => {
    console.log(data.toString(), data)

    // Ctrl + C: Exit
    if (data[0] === 0x03) {
        process.exit(0)
    }

    // Arrow keys
    if (data[0] === 0x1b && data[1] === 0x5b) {
        if (data[2] === 0x41) {
            console.log("Arrow UP")
        }
        if (data[2] === 0x42) {
            console.log("Arrow DOWN")
        }
    }

    // Enter key (Carriage Return / Newline)
    if (data[0] === 0x0d || data[0] === 0x0a) {
        console.log("Enter key")
    }
})
