const axios = require("axios");

// Size conversion constants
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
  // Validate format
  const normalizedFormat = format.toUpperCase();
  if (!SIZE_UNITS[normalizedFormat]) {
    throw new FileSizeError(
      `Invalid format: ${format}. Supported formats: ${Object.keys(
        SIZE_UNITS
      ).join(", ")} or 'human'`,
      "INVALID_FORMAT"
    );
  }

  // Input validation
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

  // Retry with exponential backoff
  const getRetryDelay = (attempt) => {
    // Calculate delay: 1s, 2s, 4s, 8s... but cap at 10s
    return Math.min(1000 * Math.pow(2, attempt), 10000);
  };

  try {
    while (attempts < maxAttempts) {
      try {
        if (attempts > 0) {
          // Log retry attempt with wait time
          const delay = getRetryDelay(attempts - 1);
          console.log(
            `Retrying in ${delay / 1000} seconds... (Attempt ${
              attempts + 1
            }/${maxAttempts})`
          );
          // Wait before retry - this helps when server is temporarily unavailable
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        console.log(
          `Attempt ${attempts + 1} to fetch the file size from ${url}`
        );
        // Use HEAD request instead of GET
        const response = await axios.head(url, {
          timeout,
          signal: controller.signal,
          validateStatus: (status) => status === 200,
        });

        const fileSizeInBytes = parseInt(
          response.headers["content-length"],
          10
        );

        if (!fileSizeInBytes) {
          throw new FileSizeError(
            "Content-Length header missing",
            "NO_CONTENT_LENGTH"
          );
        }

        // Convert size based on format
        if (normalizedFormat === "HUMAN") {
          const sizes = [
            { unit: "TB", value: SIZE_UNITS.TB },
            { unit: "GB", value: SIZE_UNITS.GB },
            { unit: "MB", value: SIZE_UNITS.MB },
            { unit: "KB", value: SIZE_UNITS.KB },
            { unit: "B", value: SIZE_UNITS.B },
          ];

          for (const size of sizes) {
            if (fileSizeInBytes >= size.value) {
              return `${(fileSizeInBytes / size.value).toFixed(2)} ${
                size.unit
              }`;
            }
          }
          return `${fileSizeInBytes} B`;
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
        // Continue to next attempt
        continue;
      }
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = getFileSize;
