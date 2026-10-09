# Web Services, XML & CI/CD Lab Experiments

This directory contains complete, fully functional, and tested implementations for **Experiment No. 9**, **Experiment No. 11**, **Experiment No. 13**, and **Experiment No. 14**.

---

## 📁 Directory Structure

```
experiments/
├── experiment_9/            # Experiment 9: XML Formatters (CSS & XSLT)
│   ├── books.xml            # XML Document referencing books.css
│   ├── books_xslt.xml       # XML Document referencing books.xsl
│   ├── books.css            # CSS Card-Style formatting
│   ├── books.xsl            # XSLT HTML Table transformation
│   ├── run_exp9.js          # Interactive runner & HTTP Live Server
│   └── LAB_REPORT_EXP9.md   # Complete lab report writeup
│
├── experiment_11/           # Experiment 11: CI/CD Pipeline with GitHub Actions
│   ├── .github/workflows/   # ci.yml GitHub Actions workflow file
│   ├── app.js               # Sample application code
│   ├── test/app.test.js     # Automated test suite
│   ├── run_exp11.js         # CI/CD simulator runner
│   └── LAB_REPORT_EXP11.md  # Complete lab report writeup
│
├── experiment_13/           # Experiment 13: SOAP vs REST Web Services
│   ├── calculator.wsdl      # WSDL Contract definition
│   ├── soap_server.js       # SOAP Service (Port 8000)
│   ├── rest_server.js       # REST Service (Port 4000)
│   ├── test_client.js       # Comparison test script
│   ├── run_exp13.js         # Single-command runner
│   └── README.md            # Complete lab report writeup
│
└── experiment_14/           # Experiment 14: REST Web Service with MongoDB Database
    ├── server.js            # Express + Mongoose REST CRUD API (Port 5000)
    ├── test_crud.js         # Automated CRUD test client
    ├── run_exp14.js         # Single-command runner
    └── README.md            # Complete lab report writeup
```

---

## 🚀 Quick Execution Guide

### Run Experiment 9 (Practicing with XML Formatters - CSS & XSLT):
```bash
cd experiments/experiment_9
node run_exp9.js
```

### Run Experiment 11 (CI/CD GitHub Actions Pipeline):
```bash
cd experiments/experiment_11
node run_exp11.js
```

### Run Experiment 13 (SOAP vs REST Comparison):
```bash
cd experiments/experiment_13
node run_exp13.js
```

### Run Experiment 14 (REST Service with Database CRUD):
```bash
cd experiments/experiment_14
node run_exp14.js
```
