const axios = require("axios");

async function getFileSize(
  url,
  format = "bytes",
  timeout = 20000,
  maxAttempts = 4
) {
  const urlRegex = /^(https?:\/\/)/;

  if (typeof url !== "string" || url.length === 0 || !urlRegex.test(url)) {
    throw new Error("Invalid URL");
  }

  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const response = await axios.get(url, {
        responseType: "stream",
        timeout,
      });
      let fileSizeInBytes = 0;

      const contentLength = response.headers["content-length"];
      if (contentLength) {
        fileSizeInBytes = parseInt(contentLength, 10);
      } else {
        response.data.on("data", (dataChunk) => {
          fileSizeInBytes += dataChunk.length;
        });

        await new Promise((resolve) => {
          response.data.on("end", resolve);
        });
      }

      if (format.toLowerCase() === "kb") {
        fileSizeInBytes /= 1024;
      } else if (format.toLowerCase() === "mb") {
        fileSizeInBytes /= 1048576;
      }

      return fileSizeInBytes;
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        throw new Error(
          "Sorry We could not get the file size after multiple attempts"
        );
      }
    }
  }
}

module.exports = getFileSize;
