export async function GIBtoSGF1(gibContent) {
    let lines = gibContent.split(/\r?\n/); // Handle both \r\n and \n line endings
    console.log('lines is', lines);
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
        console.log("line before trim is", line);
        line = line.trim();
        //console.log("line is", line);
        if (line.startsWith("\[GAMEBLACKNAME=")) {
            blackPlayer = line.split("=")[1];
        } else if (line.startsWith("\[GAMEWHITENAME")) {
            whitePlayer = line.split("=")[1];
            console.log("whitePlayer is", whitePlayer);
        } else if (line.startsWith("\[GAMEBLACKLEVEL=")) {
            blackRank = line.split("=")[1];
        } else if (line.startsWith("\[GAMEWHITELEVEL=")) {
            whiteRank = line.split("=")[1];
            console.log("whiteRank is", whiteRank);
        } else if (line.startsWith("\[GAMERESULT=")) {
            result = line.split("=")[1];
        } else if (line.startsWith("\[GAMEDATE=")) {
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

    // Log variables before constructing SGF
    console.log("blackPlayer:", blackPlayer);
    console.log("whitePlayer:", whitePlayer);
    console.log("blackRank:", blackRank);
    console.log("whiteRank:", whiteRank);
    console.log("result:", result);
    console.log("date:", date);
    console.log("handicap:", handicap);
    console.log("moves:", moves);

    // Construct SGF
    let sgf = `(;GM[1]FF[4]CA[UTF-8]AP[GIBtoSGF]SZ[19]PB[${blackPlayer}]BR[${blackRank}]PW[${whitePlayer}]WR[${whiteRank}]RE[${result}]DT[${date}]`;
    console.log("see if variable works, blackplayer in SGF should be:", `${blackPlayer}`);
    if (handicap > 0) {
        sgf += `HA[${handicap}]`;
    }
    sgf += moves + ")";

    return sgf;
}


export default GIBtoSGF1; // This exports the function as the default export