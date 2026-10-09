<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/">
    <html>
      <head>
        <title>Book Inventory - XSLT Transformation</title>
        <style>
          body { font-family: sans-serif; margin: 20px; }
          h2 { color: #1e293b; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background-color: #eee; text-align: left; padding: 10px; font-weight: bold; border: 1px solid #ddd; }
          td { padding: 10px; border: 1px solid #ddd; }
          tr:nth-child(even) { background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <h2>Book Inventory</h2>
        <table border="1" style="width:100%; border-collapse: collapse;">
          <tr style="background-color: #eee;">
            <th>Title</th>
            <th>Author</th>
            <th>Price</th>
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
