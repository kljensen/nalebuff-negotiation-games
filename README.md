

Something like

```
ROOT_URL="http://coursera-negotiation.som.yale.edu" meteor --settings ./settings.json --port 3000
```

Where settings.json has something like
```
{
  "coursera": {
    "clientID": "YmBCGtmEqIgSRn75bA",
    "secret" : "bVK28sdfsdfsdfPmtlkjsdvnWVVaw"
  },
  "public": {
    "auth": "coursera"
  }
}
```

