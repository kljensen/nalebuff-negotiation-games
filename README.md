

Something like

```
docker-compose up
```

First, create a `settings.json` file for development
```
mkdir -p  settings/dev/
cat >settings/dev/settings.json
{
  "coursera": {
    "clientId": "pqpZ6DMV0L6fHksd8sj2",
    "secret" : "Fw-LfeZS234hSDF92J"
  },
  "public": {
    "auth": "coursera"
  }
}```

Note that these settings are *fake*.

The coursera clientID is obtained from the
[coursera console](https://accounts.coursera.org/console).
