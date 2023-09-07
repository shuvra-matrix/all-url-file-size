# all-url-file-size

**all-url-file-size** is a Node.js module that allows you to retrieve the file size of a resource hosted at a given URL without downloading the entire file in bytes. This can be useful for various purposes, such as checking the size of remote files before deciding whether to download them.

## Installation

You can install this module using npm or yarn:

```bash
    npm install all-url-file-size
```

### Usage

To use file-size-from-url, require it in your Node.js application:

```bash
    const aufs = require('all-url-file-size');
```

### Getting the File Size

You can use the getFileSize function to retrieve the file size from a URL:

```bash
    const url = 'https://example.com/sample-file.zip';

    aufs(url)
    .then(size => {
        console.log(`File size at ${url}: ${size} bytes`);
    })
    .catch(error => {
        console.error(`Error: ${error.message}`);
    });
```

### License

This project is licensed under the MIT License - see the LICENSE.md file for details.
