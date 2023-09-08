const axios = require("axios");

function fileSizeUrl(url, format = "bytes") {
  if (typeof url !== "string" || url.length === 0)
    throw new Error("this is not a valid url");
  return new Promise(async (res, rej) => {
    try {
      let fileSizeInBytes = 0;
      const response = await axios.get(url, { responseType: "stream" });
      response.data.on("data", (dataChunk) => {
        fileSizeInBytes += dataChunk.length;
      });

      response.data.on("end", () => {
        let fileSize;
        let formatType = format.toLowerCase();
        if (formatType === "mb") {
          fileSize = fileSizeInBytes / 1048576;
        }
        if (formatType === "kb") {
          fileSize = fileSizeInBytes / 1024;
        } else {
          fileSize = fileSizeInBytes;
        }
        res(fileSize);
      });

      response.data.on("error", (error) => {
        const err = new Error("could not get the file size");
        rej(err);
      });
    } catch (error) {
      const err = new Error("Invalid URL");
      rej(err);
    }
  });
}

module.exports = fileSizeUrl;
