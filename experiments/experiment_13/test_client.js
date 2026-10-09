const http = require('http');

console.log('====================================================');
console.log('    EXPERIMENT 13: WEB SERVICES TESTING & COMPARISON');
console.log('====================================================\n');

// 1. TEST SOAP SERVICE (PORT 8000)
function testSOAP() {
  return new Promise((resolve) => {
    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://www.examples.com/wsdl/CalculatorService.wsdl">
   <soapenv:Header/>
   <soapenv:Body>
      <tns:AddRequest>
         <a>3</a>
         <b>5</b>
      </tns:AddRequest>
   </soapenv:Body>
</soapenv:Envelope>`;

    console.log('--- [1] SOAP REQUEST (XML Envelope) ---');
    console.log(soapEnvelope);

    const reqOptions = {
      hostname: 'localhost',
      port: 8000,
      path: '/wsdl',
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'Content-Length': Buffer.byteLength(soapEnvelope),
        'SOAPAction': 'Add'
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('\n--- [1] SOAP RESPONSE (XML Response) ---');
        console.log(data);
        resolve(data);
      });
    });

    req.on('error', (err) => {
      console.error('SOAP Request Error:', err.message);
      resolve(null);
    });

    req.write(soapEnvelope);
    req.end();
  });
}

// 2. TEST REST SERVICE (PORT 4000)
function testREST() {
  return new Promise((resolve) => {
    const jsonBody = JSON.stringify({ a: 3, b: 5 });

    console.log('\n----------------------------------------------------');
    console.log('--- [2] REST REQUEST (JSON Payload) ---');
    console.log(`POST /api/add HTTP/1.1`);
    console.log(`Content-Type: application/json`);
    console.log(jsonBody);

    const reqOptions = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/add',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(jsonBody)
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('\n--- [2] REST RESPONSE (JSON Response) ---');
        console.log(data);
        resolve(data);
      });
    });

    req.on('error', (err) => {
      console.error('REST Request Error:', err.message);
      resolve(null);
    });

    req.write(jsonBody);
    req.end();
  });
}

async function runComparison() {
  await testSOAP();
  await testREST();

  console.log('\n====================================================');
  console.log('             SUMMARY & COMPARISON RESULTS           ');
  console.log('====================================================');
  console.log('Feature         | SOAP Web Service             | REST Web Service');
  console.log('----------------|------------------------------|-----------------------------');
  console.log('Protocol/Style  | Strict XML Protocol          | Architectural Style over HTTP');
  console.log('Data Format     | XML Envelope                 | JSON / Plain text / XML');
  console.log('Contract        | Formal WSDL Contract         | Schema-less / OpenAPI');
  console.log('Transport       | HTTP, SMTP, JMS, TCP         | Strictly HTTP / HTTPS');
  console.log('Payload Size    | Verbose (XML headers/tags)   | Lightweight & Compact');
  console.log('====================================================\n');
}

runComparison();
