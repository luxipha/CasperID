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

    content = content.replace(/dark:bg-slate-200 dark:bg-white\/10/g, 'dark:bg-white/10');
    content = content.replace(/dark:bg-slate-100 dark:bg-white\/5/g, 'dark:bg-white/5');
    content = content.replace(/dark:border-slate-200 dark:border-white\/10/g, 'dark:border-white/10');
    content = content.replace(/bg-slate-200 dark:bg-slate-200 dark:bg-white\/10/g, 'bg-slate-200 dark:bg-white/10');
    content = content.replace(/bg-slate-200 dark:bg-white\/10 bg-black\/10/g, 'bg-slate-200 dark:bg-white/10');

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log('Fixed', path.basename(file));
    }
});
