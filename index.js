const axios = require("axios");

function fileSizeUrl(url) {
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
        res(fileSizeInBytes);
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
