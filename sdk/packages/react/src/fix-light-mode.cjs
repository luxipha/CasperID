const fs = require('fs');
const path = require('path');

const srcDir = '/Users/abisoye/Projects/casperId/sdk/packages/react/src';

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walkDir(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walkDir(srcDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Fix Missing Borders
    content = content.replace(/border-white\/10/g, 'border-slate-200 dark:border-white/10');
    
    // Fix Muted Backgrounds
    content = content.replace(/bg-white\/10(?!\])/g, 'bg-slate-200 dark:bg-white/10');
    content = content.replace(/bg-white\/5(?!\])/g, 'bg-slate-100 dark:bg-white/5');

    // Fix Specific Text Issues (not inside buttons if possible)
    // text-white/90
    content = content.replace(/text-white\/90/g, 'text-slate-800 dark:text-white/90');
    // text-white/70
    content = content.replace(/text-white\/70/g, 'text-slate-600 dark:text-white/70');
    // text-slate-300
    content = content.replace(/text-slate-300/g, 'text-slate-500 dark:text-slate-300');
    // dark:text-slate-300 that might get messed up by the previous rule
    content = content.replace(/dark:text-slate-500 dark:text-slate-300/g, 'dark:text-slate-300');

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log('Fixed', path.basename(file));
    }
});
