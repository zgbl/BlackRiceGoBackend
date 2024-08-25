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

  export default GIBtoSGF; // This exports the function as the default export