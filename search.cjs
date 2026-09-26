const fs = require('fs');
const path = require('path');

function searchFiles(dir, regex) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.gemini') continue;
        
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            searchFiles(filePath, regex);
        } else if (stat.isFile()) {
            const ext = path.extname(file);
            if (['.js', '.jsx', '.json', '.html', '.css', '.md'].includes(ext)) {
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n');
                lines.forEach((line, i) => {
                    if (regex.test(line)) {
                        console.log(`${filePath}:${i+1}: ${line.trim()}`);
                    }
                });
            }
        }
    }
}

searchFiles(__dirname, /Finan/i);
