export async function GIBtoSGF1(gibContent) {
    let decodedContent;
    //const decoder = new TextDecoder("gb18030");
    if (gibContent instanceof ArrayBuffer) {
        // 如果是ArrayBuffer（通常来自文件上传）
        const decoder = new TextDecoder("gb18030");
        decodedContent = decoder.decode(gibContent);
    } else if (typeof gibContent === 'string') {
        // 如果已经是字符串
        decodedContent = gibContent;
    } else {
        throw new Error("Unsupported input type");
    }
    
    //let lines = decodedContent.split("\n"); 
    let lines = gibContent.split("\n"); //试试不decode
    //console.log('lines is', lines);
    let header = lines.shift();

    if (!header.startsWith("\\HS")) {
        throw new Error("Invalid GIB file format");
    }

    let blackPlayer = "",
        whitePlayer = "",
        blackRank = "",
        whiteRank = "",
        komi = "",
        gametime = "",
        result = "",
        date = "";
    let handicap = 0;
    let moves = "";

    for (let line of lines) {
        //console.log("Before trim, line is:", line);
        line = line.trim();
        //console.log("After trim, line is:", line);
        if (line.includes("[GAMEBLACKNICK="))
          blackPlayer = extractInfo(line, /\[GAMEBLACKNICK=(.*?)\]/);
        if (line.includes("[GAMEWHITENICK="))
          whitePlayer = extractInfo(line, /\[GAMEWHITENICK=(.*?)\]/);
        if (line.includes("[GAMEBLACKLEVEL="))
          blackRank = convertRank(
            extractInfo(line, /\[GAMEBLACKLEVEL=(.*?)\]/)
          );
        if (line.includes("GAMEWHITELEVEL="))
          whiteRank = convertRank(
            extractInfo(line, /\[GAMEWHITELEVEL=(.*?)\]/)
          );
        if (line.includes("[GAMECONDITION="))
          komi = extractInfo(line, /\[GAMECONDITION=(.*?)\]/);
        if (line.includes("[GAMETIME="))
          gametime = extractInfo(line, /\[GAMETIME=(.*?)\]/);
        if (line.includes("[GAMERESULT="))
          result = extractInfo(line, /\[GAMERESULT=(.*?)\]/);
        if (line.includes("[GAMEDATE="))
          date = line.split("=")[1].replace(/[^0-9]/g, "-");

        if (line.includes("INI")) {
          handicap = parseInt(line.split(" ")[3]);
        }

        if (line.includes("STO")) {
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
    console.log("gametime:", gametime);
    console.log("moves:", moves);

    // Construct SGF
    let sgf = `(;GM[1]FF[4]CA[UTF-8]AP[GIBtoSGF]SZ[19]PB[${blackPlayer}]BR[${blackRank}]PW[${whitePlayer}]WR[${whiteRank}]KM[${komi}]TM[${gametime}]RE[${result}]DT[${date}]`;
    console.log("see if variable works, blackplayer in SGF should be:", `${blackPlayer}`);
    if (handicap > 0) {
        sgf += `HA[${handicap}]`;
    }
    sgf += moves + ")";

    return sgf;
}

function extractInfo(line, pattern) {
    const match = line.match(pattern);
    if (match) {
      return match[1].replace(/[\]\\\s]+$/, "").trim();
    }
    return "";
  }

  function convertRank(numericRank) {
    const numRank = parseInt(numericRank);

    if (numRank >= 18) {
      // 18及以上为段位
      return `${numRank - 17}D`;
    } else {
      // 17及以下为级别
      return `${18 - numRank}K`;
    }
  }


export default GIBtoSGF1; // This exports the function as the default export