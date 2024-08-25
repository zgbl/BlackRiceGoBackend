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


export default GIBtoSGF1; // This exports the function as the default export