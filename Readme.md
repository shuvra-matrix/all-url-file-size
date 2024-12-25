# all-url-file-size

**all-url-file-size** is a Node.js module that allows you to retrieve the file size of a resource hosted at a given URL without downloading it while specifying the format (mb, kb, or bytes). This can be useful for various purposes, such as checking the size of remote files before deciding whether to download them.

## Installation

You can install this module using npm or yarn:

```bash
npm install all-url-file-size
```

### Usage

To use all-url-file-size, require it in your Node.js application:

```javascript
const aufs = require("all-url-file-size");
```

### Getting the File Size

You can use the aufs function to retrieve the file size from a URL:

```javascript
const url = "https://example.com/sample-file.zip";

aufs(url)
  .then((size) => {
    console.log(`File size at ${url}: ${size} bytes`);
  })
  .catch((error) => {
    console.error(`Error: ${error.message}`);
  });
```

### Specifying the Format

You can specify the format for the file size by providing the format parameter as either 'bytes', 'kb', 'mb', 'gb', 'tb' . default value is bytes.

```javascript
const url = "https://example.com/sample-file.zip";
const format = "mb";

aufs(url, format)
  .then((size) => {
    console.log(`File size at ${url}: ${size} MB`);
  })
  .catch((error) => {
    console.error(`Error: ${error.message}`);
  });
```

### Timeout and Max Attempt

You can also set a timeout and maximum attempts for the file size retrieval. The default timeout is 20 seconds, and the default max attempt is 4.

```javascript
const url = "https://example.com/sample-file.zip";
const format = "mb";
const timeout = 30000; // 30 seconds
const maxAttempt = 5;

aufs(url, format, timeout, maxAttempt)
  .then((size) => {
    console.log(`File size at ${url}: ${size} MB`);
  })
  .catch((error) => {
    console.error(`Error: ${error.message}`);
  });
```

### License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/shuvra-matrix/all-url-file-size/blob/main/LICENSE.md) file for details.
