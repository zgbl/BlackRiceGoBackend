export async function GIBtoSGF(gibContent) {
    let info = {};
    let moves = '';
    let Hcap = 0;

    // Ensure gibContent is a string
    if (typeof gibContent !== 'string') {
        throw new Error('GIB content should be a string');
    } 
   //console.log('gibContent is', gibContent);
    // Split the GIB content into lines for processing
    const lines = gibContent.split(/\r?\n/);
    //console.log('lines is', lines);
  
    for (const line of lines) {
        console.log('line is', line);
        const trimmedLine = line.trim();
        console.log('trimmedLine is', trimmedLine);
    
        if (trimmedLine.startsWith('\\HS')) {
            continue; // Header line, skip it
        }
    
        if (/GAMEWHITELEVEL/.test(trimmedLine)) {
            info.wr = trimmedLine.split('=')[1].trim();
        } else if (/GAMEBLACKLEVEL/.test(trimmedLine)) {
            info.br = trimmedLine.split('=')[1].trim();
        } else if (/MOVES/.test(trimmedLine)) {
            // Assuming moves are denoted in a specific format after this line
            // Example handling for moves - adjust according to actual format
            const movesLine = trimmedLine.split('=')[1].trim();
            if (!movesLine) {
                throw new Error('No moves found in GIB content');
            }
            moves = movesLine; // Example assignment
        }
    }
  
       // Ensure info and moves are correctly populated
       if (!info || !moves) {
        throw new Error('Failed to parse GIB content correctly');
    }

    // Return the parsed data
    return { info, moves };
}

export async function GIBtoSGF1(gibContent) {
    let lines = gibContent.split(/\r?\n/); // Handle both \r\n and \n line endings
    let header = lines.shift();

    if (!header.startsWith("\\HS")) {
        throw new Error("Invalid GIB file format");
    }

    let blackPlayer = "",
        whitePlayer = "",
        blackRank = "",
        whiteRank = "",
        result = "",
        date = "";
    let handicap = 0;
    let moves = "";

    for (let line of lines) {
        line = line.trim();
        if (line.startsWith("GAMEBLACKNICK=")) {
            blackPlayer = line.split("=")[1];
        } else if (line.startsWith("GAMEWHITENICK=")) {
            whitePlayer = line.split("=")[1];
        } else if (line.startsWith("GAMEBLACKLEVEL=")) {
            blackRank = line.split("=")[1];
        } else if (line.startsWith("GAMEWHITELEVEL=")) {
            whiteRank = line.split("=")[1];
        } else if (line.startsWith("GAMERESULT=")) {
            result = line.split("=")[1];
        } else if (line.startsWith("GAMEDATE=")) {
            date = line.split("=")[1].replace(/[^0-9]/g, "-");
        } else if (line.startsWith("INI")) {
            handicap = parseInt(line.split(" ")[3], 10);
        } else if (line.startsWith("STO")) {
            let parts = line.split(" ");
            let color = parts[3] === "1" ? "B" : "W";
            let x = String.fromCharCode(parseInt(parts[4]) + 97);
            let y = String.fromCharCode(parseInt(parts[5]) + 97);
            moves += `;${color}[${x}${y}]`;
        }
    }

    // Construct SGF
    let sgf = `(;GM[1]FF[4]CA[UTF-8]AP[GIBtoSGF]SZ[19]PB[${blackPlayer}]BR[${blackRank}]PW[${whitePlayer}]WR[${whiteRank}]RE[${result}]DT[${date}]`;
    if (handicap > 0) {
        sgf += `HA[${handicap}]`;
    }
    sgf += moves + ")";

    return sgf;
}


export default GIBtoSGF; // This exports the function as the default export