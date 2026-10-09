const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5500;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.xsl': 'application/xml; charset=utf-8'
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '/index.html') {
    const htmlView = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Experiment 9 - XML Formatters</title>
  <style>
    body {
      font-family: sans-serif;
      margin: 30px;
      background: #ffffff;
      color: #000000;
    }
    h1 {
      font-size: 1.6em;
      border-bottom: 2px solid #ccc;
      padding-bottom: 8px;
    }
    .author-title {
      font-size: 1em;
      color: #333;
      margin-bottom: 20px;
    }
    .nav-links {
      margin-bottom: 25px;
    }
    .nav-links a {
      display: inline-block;
      margin-right: 15px;
      padding: 8px 14px;
      background: #eee;
      color: #000;
      text-decoration: none;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    .nav-links a:hover {
      background: #ddd;
    }
    .section {
      margin-bottom: 35px;
    }
    .section-title {
      font-size: 1.2em;
      font-weight: bold;
      margin-bottom: 10px;
      color: #222;
    }
    /* Simple Card Styling */
    catalog {
      display: block;
      padding: 0;
    }
    book {
      display: block;
      border: 1px solid #ccc;
      margin: 10px 0;
      padding: 15px;
      border-radius: 5px;
      background: #fff;
    }
    title {
      display: block;
      font-weight: bold;
      font-size: 1.2em;
    }
    author {
      display: block;
      font-style: italic;
      color: #555;
    }
    price::before {
      content: 'Price: Rs. ';
      font-weight: bold;
    }
    /* Simple Table Styling */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 10px;
      text-align: left;
    }
    th {
      background-color: #eee;
    }
  </style>
</head>
<body>

  <h1>Experiment No. 9: Practicing with XML Formatters</h1>
  <div class="author-title"><strong>Student Author:</strong> Edwin Moses</div>

  <div class="nav-links">
    <a href="/books.xml" target="_blank">📄 View Raw books.xml (CSS View)</a>
    <a href="/books_xslt.xml" target="_blank">📊 View Raw books_xslt.xml (XSLT View)</a>
  </div>

  <div class="section">
    <div class="section-title">1. CSS Styled Output (Card View):</div>
    <catalog>
      <book>
        <title>Web Technologies</title>
        <author>Edwin Moses</author>
        <price>650.00</price>
      </book>
      <book>
        <title>Angular Projects</title>
        <author>Vignesh Kumar</author>
        <price>1200.00</price>
      </book>
      <book>
        <title>XML Expert Guide</title>
        <author>Sarveshwaran</author>
        <price>850.00</price>
      </book>
    </catalog>
  </div>

  <div class="section">
    <div class="section-title">2. XSLT Styled Output (Table View):</div>
    <h2>Book Inventory</h2>
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Author</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Web Technologies</td>
          <td>Edwin Moses</td>
          <td>650.00</td>
        </tr>
        <tr>
          <td>Angular Projects</td>
          <td>Vignesh Kumar</td>
          <td>1200.00</td>
        </tr>
        <tr>
          <td>XML Expert Guide</td>
          <td>Sarveshwaran</td>
          <td>850.00</td>
        </tr>
      </tbody>
    </table>
  </div>

</body>
</html>`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(htmlView);
    return;
  }

  const filePath = path.join(__dirname, reqPath.slice(1));
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'text/plain';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 File Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Experiment 9 Server Running on Port ${PORT}`);
  console.log(`🌐 Chrome View: http://localhost:${PORT}/`);
  console.log(`====================================================`);
});
