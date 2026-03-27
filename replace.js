const fs = require('fs');
const path = require('path');

const directoryToSearch = [
    'c:\\Users\\Bhanu Prakash\\Desktop\\MERN\\frontend',
    'c:\\Users\\Bhanu Prakash\\Desktop\\MERN\\backend'
];

const searchString = 'http://localhost:5000';
const replaceString = 'https://hostel-management-system-11.onrender.com';

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            if (!fullPath.includes('node_modules') && !fullPath.includes('.git') && !fullPath.includes('dist')) {
                results = results.concat(walkDir(fullPath));
            }
        } else {
            if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.env')) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

directoryToSearch.forEach(dir => {
    const files = walkDir(dir);
    files.forEach(file => {
        let content = fs.readFileSync(file, 'utf8');
        if (content.includes(searchString)) {
            content = content.replace(new RegExp(searchString, 'g'), replaceString);
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Updated: ${file}`);
        }
    });
});
