# JavaScript helpers for Readium publication rendering

## Getting started

Make sure to have NodeJs already installed.

### Install all dependencies

```bash
npm install
```

### Start developing and serve your app

```bash
npm start
```

### Build your application

```bash
npm run build
```

> **Warning:** `assets/helpers/flutterReadiumTools.js` also carries hand-maintained lines 2 and 3, which a
> webpack build (`clean: true`) deletes. Do not rebuild it blindly - see `handwritten/README.md`.

### Run unit tests

```bash
npm run test
```

### Run coverage

```bash
npm run coverage
```

### Docker

Or simply run the example using docker:

```bash
docker-compose up
```
