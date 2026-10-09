const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('====================================================');
console.log('    EXPERIMENT 9: PRACTICING WITH XML FORMATTERS    ');
console.log('====================================================\n');

const xmlFile = path.join(__dirname, 'books.xml');
const cssFile = path.join(__dirname, 'books.css');
const xslFile = path.join(__dirname, 'books.xsl');

// 1. Verify file existence
console.log('👉 Step 1: Checking files existence...');
if (fs.existsSync(xmlFile) && fs.existsSync(cssFile) && fs.existsSync(xslFile)) {
  console.log('   ✅ books.xml found.');
  console.log('   ✅ books.css found.');
  console.log('   ✅ books.xsl found.');
} else {
  console.error('   ❌ Required XML/CSS/XSL files missing!');
  process.exit(1);
}

// 2. Parse XML Content and simulate CSS Card View rendering with author Edwin Moses
console.log('\n👉 Step 2: Simulating CSS Styled Output (Card View)...');
const xmlContent = fs.readFileSync(xmlFile, 'utf8');
const bookMatches = [...xmlContent.matchAll(/<book>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<author>(.*?)<\/author>[\s\S]*?<price>(.*?)<\/price>[\s\S]*?<\/book>/g)];

console.log('----------------------------------------------------');
bookMatches.forEach((match, idx) => {
  console.log(`Card ${idx + 1}:`);
  console.log(`   Title : \x1b[1m${match[1]}\x1b[0m`);
  console.log(`   Author: \x1b[36m\x1b[1m${match[2]}\x1b[0m`);
  console.log(`   Price : \x1b[32mPrice: Rs. ${match[3]}\x1b[0m`);
  console.log('----------------------------------------------------');
});

// 3. Simulate XSLT Transformation to HTML Table
console.log('\n👉 Step 3: Simulating XSLT Transformation (Table View)...');
let htmlTable = `
<h2>Book Inventory</h2>
<table border="1" style="width:100%; border-collapse: collapse;">
  <tr style="background-color: #eee;">
    <th>Title</th><th>Author</th><th>Price</th>
  </tr>`;

bookMatches.forEach(match => {
  htmlTable += `
  <tr>
    <td style="padding:10px;">${match[1]}</td>
    <td style="padding:10px;"><strong>${match[2]}</strong></td>
    <td style="padding:10px;">${match[3]}</td>
  </tr>`;
});
htmlTable += `
</table>`;

console.log(htmlTable.trim());

// 4. Start HTTP Server for Browser Testing
require('./server');
