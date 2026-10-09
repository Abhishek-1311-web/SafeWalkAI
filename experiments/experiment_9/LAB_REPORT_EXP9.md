# EXPERIMENT NO. 9 - LAB RECORD SHEET

**EXPERIMENT TITLE**: Practicing with XML Formatters  
**STUDENT NAME**: Edwin Moses  
**REGISTER NOS**: 2403917720521313, 2403917720521301, 2403917720521067  
**COURSE OUTCOME**: CO4 / CO5  

---

## 🎯 1. AIM
To create a well-formed XML document and transform/format it for display using CSS and XSLT.

---

## 📚 2. THEORY
XML (eXtensible Markup Language) stores data as nested elements and attributes. Since raw XML has no visual styling, a CSS stylesheet or an XSLT stylesheet is attached to render it. While CSS merely styles the existing elements, XSLT can transform the XML structure into a completely different format, such as an HTML table.

---

## 📝 3. PROCEDURE
1. Create `books.xml` with book details using **Edwin Moses**, **Vignesh Kumar**, and **Sarveshwaran** as authors.
2. Create `books.css` to define card-style formatting for the browser.
3. Create `books.xsl` to define the HTML table transformation logic.
4. Host the files using Node.js local HTTP server / Live Server (this is required because browsers block XSLT on local `file://` paths).
5. Open `http://localhost:5500/` in Google Chrome to view both CSS and XSLT formatted outputs live.

---

## 💻 4. SOURCE CODE

### File 1: `books.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/css" href="books.css"?>
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
```

### File 2: `books.css`
```css
catalog { display: block; font-family: sans-serif; padding: 20px; }
book { display: block; border: 1px solid #ccc; margin: 10px; padding: 15px; border-radius: 5px; }
title { display: block; font-weight: bold; font-size: 1.2em; } 
author { display: block; font-style: italic; color: #555; } 
price::before { content: 'Price: Rs. '; font-weight: bold; }
```

### File 3: `books.xsl`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/">
    <html>
      <body>
        <h2>Book Inventory</h2>
        <table border="1" style="width:100%; border-collapse: collapse;">
          <tr style="background-color: #eee;">
            <th>Title</th><th>Author</th><th>Price</th>
          </tr>
          <xsl:for-each select="catalog/book">
            <tr>
              <td style="padding:10px;"><xsl:value-of select="title"/></td>
              <td style="padding:10px;"><xsl:value-of select="author"/></td>
              <td style="padding:10px;"><xsl:value-of select="price"/></td>
            </tr>
          </xsl:for-each>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
```

---

## 🖥️ 5. SCREENSHOTS & OUTPUT VERIFICATION

### 1. CSS Styled Output (Card View)
This view displays the XML data as individual cards with bold titles and italicized authors using the `books.css` file:
```text
+-------------------------------------------------------------+
| Web Technologies                                            |
| Edwin Moses                                                 |
| Price: Rs. 650.00                                           |
+-------------------------------------------------------------+
| Angular Projects                                            |
| Vignesh Kumar                                               |
| Price: Rs. 1200.00                                          |
+-------------------------------------------------------------+
| XML Expert Guide                                            |
| Sarveshwaran                                                |
| Price: Rs. 850.00                                           |
+-------------------------------------------------------------+
```

### 2. XSLT Styled Output (Table View)
This view transforms the XML data into a structured HTML table with headers (**Title**, **Author**, **Price**) using the `books.xsl` file:

## Book Inventory

| Title | Author | Price |
|---|---|---|
| Web Technologies | **Edwin Moses** | 650.00 |
| Angular Projects | Vignesh Kumar | 1200.00 |
| XML Expert Guide | Sarveshwaran | 850.00 |

---

## ⚙️ 6. INSTRUCTIONS FOR GOOGLE CHROME VIEWING
1. **Start Server**: Run `node server.js` inside `experiments/experiment_9`.
2. **Open Chrome**: Open Google Chrome and navigate to:
   - Dashboard & Live Visualizer: `http://localhost:5500/`
   - Direct XML with CSS: `http://localhost:5500/books.xml`
   - Direct XML with XSLT: `http://localhost:5500/books_xslt.xml`
3. **Observe**: Verify that **Edwin Moses** is rendered as author in both the Card view and Table view.

---

## 🏆 7. RESULT
An XML document was created, validated, and successfully rendered featuring **Edwin Moses** as author using both CSS and XSLT stylesheets in Google Chrome.
