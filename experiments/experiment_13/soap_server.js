const soap = require('soap');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Service implementation object
const service = {
  CalculatorService: {
    CalculatorPort: {
      Add: function (args) {
        console.log('[SOAP Server] Received Add request with args:', args);
        const a = Number(args.a || (args.parameters && args.parameters.a) || 0);
        const b = Number(args.b || (args.parameters && args.parameters.b) || 0);
        const resValue = a + b;
        console.log(`[SOAP Server] Calculated ${a} + ${b} = ${resValue}`);
        return { result: resValue };
      }
    }
  }
};

// Read WSDL description file
const xmlPath = path.join(__dirname, 'calculator.wsdl');
const xml = fs.readFileSync(xmlPath, 'utf8');

// Create HTTP server
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('SOAP Calculator Service running on /wsdl');
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`✅ SOAP Service is running on http://localhost:${PORT}/wsdl`);
});

// Bind SOAP service listener to HTTP server
soap.listen(server, '/wsdl', service, xml);
