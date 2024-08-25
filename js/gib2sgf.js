export async function GIBtoSGF(gibContent) {
    let info = {};
    let moves = '';
    let Hcap = 0;
   //console.log('gibContent is', gibContent);
    // Split the GIB content into lines for processing
    const lines = gibContent.split(/\r?\n/);
    //console.log('lines is', lines);
  
    for (const line of lines) {
        const trimmedLine = line.trim();
  
        if (trimmedLine.startsWith('\\HS')) {
            continue; // Header line, skip it
        }
  
        if (/GAMEWHITELEVEL/.test(trimmedLine)) {
            info.wr = trimmedLine.split('=')[1].trim();
        } else if (/GAMEBLACKLEVEL/.test(trimmedLine)) {
            info.br = trimmedLine.split('=')[1].trim();
        } else if (/GAMEBLACKNICK/.test(trimmedLine)) {
            info.bp = trimmedLine.split('=')[1].trim();
        } else if (/GAMEWHITENICK/.test(trimmedLine)) {
            info.wp = trimmedLine.split('=')[1].trim();
        } else if (/GAMERESULT/.test(trimmedLine)) {
            info.res = trimmedLine.split('=')[1].trim();
        } else if (/GAMEWHITENAME/.test(trimmedLine)) {
            info.wname = trimmedLine.split('=')[1].trim();
        } else if (/GAMEBLACKNAME/.test(trimmedLine)) {
            info.bname = trimmedLine.split('=')[1].trim();
        } else if (/GAMEDATE/.test(trimmedLine)) {
            const [_, yr, mn, dy] = trimmedLine.match(/GAMEDATE=(\d{4})(\d{2})(\d{2})/);
            info.date = `${yr}-${mn}-${dy}`;
        } else if (/GAMETAG/.test(trimmedLine)) {
            break;
        } else if (/INI\s+[\d]+\s+[\d]+\s+[\d]+/.test(trimmedLine)) {
            const [_, , , hcap] = trimmedLine.match(/INI\s+[\d]+\s+[\d]+\s+([\d]+)/);
            Hcap = parseInt(hcap);
        } else if (/STO/.test(trimmedLine)) {
            const [_, , , colorCode, x, y] = trimmedLine.match(/STO\s+[\d]+\s+[\d]+\s+([\d]+)\s+([\d]+)\s+([\d]+)/);
            const col = String.fromCharCode(parseInt(x) + 96);
            const row = String.fromCharCode(parseInt(y) + 96);
            const color = colorCode == 1 ? 'B' : 'W';
            moves += `;${color}[${col}${row}]`;
        }
    }
  
    const wp = info.wp || info.wname || '';
    const bp = info.bp || info.bname || '';
    const wr = info.wp ? info.wr || '' : '';
    const br = info.bp ? info.br || '' : '';
    const res = info.res || '';
    const date = info.date || '';
    console.log('info is', info);
    console.log('gib2sgf.js line 55, wp is', wp);
  
    let sgfContent = `(;GM[1]FF[4]CA[UTF-8]AP[gokifu.com]SO[http://gokifu.com]ST[1]
  SZ[19]PW[${wp}]WR[${wr}]PB[${bp}]BR[${br}]RE[${res}]DT[${date}]
  `;
  
    if (Hcap > 0) {
        sgfContent += `HA[${Hcap}]`;
    }
  
    const handicapPositions = {
        2: 'AB[pd][dp]',
        3: 'AB[pd][dp][pp]',
        4: 'AB[dd][pd][dp][pp]',
        5: 'AB[dd][pd][jj][dp][pp]',
        6: 'AB[dd][pd][dj][pj][dp][pp]',
        7: 'AB[dd][pd][dj][jj][pj][dp][pp]',
        8: 'AB[dd][jd][pd][dj][pj][dp][jp][pp]',
        9: 'AB[dd][jd][pd][dj][jj][pj][dp][jp][pp]'
    };
  
    if (Hcap >= 2 && Hcap <= 9) {
        sgfContent += handicapPositions[Hcap];
    }
  
    sgfContent += moves;
    sgfContent += ')';
  
    return sgfContent;
  }

  export default GIBtoSGF; // This exports the function as the default export