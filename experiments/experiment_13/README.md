# Experiment No. 13: Practicing with Web Services (SOAP vs REST)

## Aim
To create and consume both a SOAP web service and a RESTful web service, and compare their request/response formats.

## Software / Tools Required
- Node.js
- `soap` npm package (SOAP Server)
- `express` npm package (REST Server)
- Postman / SoapUI / Node HTTP Client

---

## Theory
A **web service** lets applications exchange data over a network using standard protocols:
- **SOAP (Simple Object Access Protocol)**: A strict, XML-based protocol described by a WSDL (Web Services Description Language) contract. It is commonly used in enterprise systems requiring formal contracts and built-in security/transaction standards.
- **REST (Representational State Transfer)**: An architectural style built on plain HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`) exchanging JSON or XML, favoring simplicity, performance, and statelessness.

---

## Implementation Details

### File Structure
- `calculator.wsdl` - WSDL schema contract describing input `AddRequest` and output `AddResponse`.
- `soap_server.js` - SOAP Web Service running on port `8000`.
- `rest_server.js` - RESTful Web Service running on port `4000`.
- `test_client.js` - Client script calling both services and printing a comparison.
- `run_exp13.js` - Automated single-command execution script.

---

## Code Implementation

### 1. SOAP Service (`soap_server.js`)
```javascript
const soap = require('soap');
const http = require('http');
const fs = require('fs');

const service = {
  CalculatorService: {
    CalculatorPort: {
      Add: function (args) {
        return { result: Number(args.a) + Number(args.b) };
      }
    }
  }
};

const xml = fs.readFileSync('calculator.wsdl', 'utf8');
const server = http.createServer((req, res) => res.end('SOAP service running'));
server.listen(8000, () => console.log('SOAP service on port 8000'));
soap.listen(server, '/wsdl', service, xml);
```

### 2. REST Service (`rest_server.js`)
```javascript
const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/add', (req, res) => {
  const { a, b } = req.body;
  res.json({ result: Number(a) + Number(b) });
});

app.listen(4000, () => console.log('REST service on port 4000'));
```

---

## How to Run & Verify

1. Navigate to the experiment directory:
   ```bash
   cd experiments/experiment_13
   npm install
   ```

2. Run both servers & test client in one command:
   ```bash
   node run_exp13.js
   ```

---

## Execution Output

```xml
--- [1] SOAP REQUEST (XML Envelope) ---
<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://www.examples.com/wsdl/CalculatorService.wsdl">
   <soapenv:Header/>
   <soapenv:Body>
      <tns:AddRequest>
         <a>3</a>
         <b>5</b>
      </tns:AddRequest>
   </soapenv:Body>
</soapenv:Envelope>

--- [1] SOAP RESPONSE (XML Response) ---
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <tns:AddResponse>
      <result>8</result>
    </tns:AddResponse>
  </soap:Body>
</soap:Envelope>
```

```json
--- [2] REST REQUEST (JSON Payload) ---
POST /api/add HTTP/1.1
Content-Type: application/json
{ "a": 3, "b": 5 }

--- [2] REST RESPONSE (JSON Response) ---
{ "result": 8 }
```

---

## Comparison Table

| Feature | SOAP Web Service | REST Web Service |
| :--- | :--- | :--- |
| **Protocol / Style** | Strict XML-based Protocol | Architectural Style over HTTP |
| **Data Format** | XML Envelope Only | JSON, Plain Text, XML, etc. |
| **Contract** | Formal WSDL Contract | Schema-less / OpenAPI / Swagger |
| **Transport** | HTTP, SMTP, JMS, TCP | Strictly HTTP / HTTPS |
| **Payload Size** | Verbose (XML headers & namespaces) | Compact & Lightweight |
| **Caching** | Not Cacheable | Cacheable via HTTP Headers |

---

## Result
A SOAP web service and a RESTful web service performing the same operation were implemented, tested, and compared successfully.
