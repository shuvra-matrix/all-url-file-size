const axios = require("axios");
const stream = require("stream");
const util = require("util");
const pipeline = util.promisify(stream.pipeline);

const SIZE_UNITS = {
  BYTES: 1,
  B: 1,
  KB: 1024,
  KIB: 1024,
  MB: 1048576,
  MIB: 1048576,
  GB: 1073741824,
  GIB: 1073741824,
  TB: 1099511627776,
  TIB: 1099511627776,
};

class FileSizeError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "FileSizeError";
    this.code = code;
  }
}

async function getFileSize(
  url,
  format = "bytes",
  timeout = 20000,
  maxAttempts = 4
) {
  const normalizedFormat = format.toUpperCase();
  if (!SIZE_UNITS[normalizedFormat]) {
    throw new FileSizeError(
      `Invalid format: ${format}. Supported formats: ${Object.keys(
        SIZE_UNITS
      ).join(", ")} or 'human'`,
      "INVALID_FORMAT"
    );
  }

  if (typeof timeout !== "number" || timeout < 0) {
    throw new FileSizeError(
      "Timeout must be a positive number",
      "INVALID_TIMEOUT"
    );
  }
  if (typeof maxAttempts !== "number" || maxAttempts < 1) {
    throw new Error("MaxAttempts must be at least 1");
  }

  const urlRegex = /^(https?:\/\/)/;

  if (typeof url !== "string" || url.length === 0 || !urlRegex.test(url)) {
    throw new Error("Invalid URL");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let attempts = 0;

  const getRetryDelay = (attempt) => {
    return Math.min(1000 * Math.pow(2, attempt), 10000);
  };

  try {
    while (attempts < maxAttempts) {
      try {
        if (attempts > 0) {
          const delay = getRetryDelay(attempts - 1);
          console.log(
            `Retrying in ${delay / 1000} seconds... (Attempt ${
              attempts + 1
            }/${maxAttempts})`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        const response = await axios.head(url, {
          timeout,
          signal: controller.signal,
          validateStatus: (status) => status === 200,
        });

        let fileSizeInBytes = parseInt(response.headers["content-length"], 10);

        if (!fileSizeInBytes) {
          const response = await axios.get(url, {
            responseType: "stream",
            timeout,
            signal: controller.signal,
          });

          fileSizeInBytes = 0;
          await pipeline(
            response.data,
            new stream.Writable({
              write(chunk, encoding, callback) {
                fileSizeInBytes += chunk.length;
                callback();
              },
            })
          );
        }

        return fileSizeInBytes / SIZE_UNITS[normalizedFormat];
      } catch (error) {
        attempts++;
        const isNetworkError =
          error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT";
        console.error(
          `Attempt ${attempts} failed: ${error.message}${
            isNetworkError ? " (Network issue)" : ""
          }`
        );

        if (attempts >= maxAttempts) {
          throw new Error(
            `Failed to get file size after ${maxAttempts} attempts. Last error: ${error.message}`
          );
        }
        continue;
      }
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = getFileSize;
