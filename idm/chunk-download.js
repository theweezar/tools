"use strict";

const fs = require("fs");
const path = require("path");
const { Command } = require("commander");
const termkit = require("terminal-kit");
const term = termkit.terminal;

// process.on("exit", doExit);
// require("readline").emitKeypressEvents(process.stdin);
// if (process.stdin.isTTY) {
//   process.stdin.setRawMode(true);
//   process.stdin.resume();
// }
// process.stdin.on("keypress", async (str, key) => {
//   if (key.ctrl && key.name === "c") {
//     exitTriggered = true;
//     term.clear();
//     await doExit();
//     process.exit();
//   }
// });

/* ---------------- Helpers ---------------- */

/**
 * Get file size via HEAD request
 * @param {string} url File URL
 * @returns {Promise<number>} File size in bytes
 */
async function getFileSize(url) {
  const res = await fetch(url, { method: "HEAD" });
  if (!res.ok) throw new Error(`HEAD request failed (${res.status})`);

  const size = res.headers.get("content-length");
  if (!size) throw new Error("Content-Length not found");

  return Number(size);
}

/**
 * Create chunks based on file size and desired chunk count
 * @param {number} fileSize File size in bytes
 * @param {number} chunkCount Number of chunks to create
 * @returns {Array<{index: number, start: number, end: number}>} Array of chunk objects
 */
function createChunks(fileSize, chunkCount) {
  const chunkSize = Math.ceil(fileSize / chunkCount);
  return Array.from({ length: chunkCount }, (_, i) => {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize - 1, fileSize - 1);
    return { index: i, start, end };
  }).filter(c => c.start <= c.end);
}

/**
 * Create multiple progress bars
 * @param {number} count Number of progress bars to create
 * @returns {Array<termkit.Terminal.ProgressBarController>} Array of progress bar objects
 */
function createProgressBars(count) {
  return Array.from({ length: count }, (_, i) => {
    return term.progressBar({
      width: 50,
      percent: true,
      eta: true,
      y: 3 + i,
      title: `Chunk ${i} `,
    });
  });
}

/* ---------------- Main logic ---------------- */

class InternetDownloader {
  constructor(url, output, chunks = 10, parallel = 5) {
    this.url = url;
    this.output = path.resolve(output);
    this.chunks = chunks;
    this.parallel = parallel;

    this.complete = false;
    this.fileHandle = null;
    this.exitTriggered = false;
    this.readers = [];

    this.beforeDownloadCb = null;
    this.chunkReadingCb = null;
    this.chunkCompleteCb = null;
  }

  triggerExit() {
    this.exitTriggered = true;
  }

  isExit() {
    return this.exitTriggered;
  }

  triggerComplete() {
    this.complete = true;
  }

  isComplete() {
    return this.complete;
  }

  setBeforeDownloadCallback(cb) {
    this.beforeDownloadCb = cb;
  }

  applyBeforeDownloadCallback(chunkList) {
    if (this.beforeDownloadCb) {
      this.beforeDownloadCb(chunkList);
    }
  }

  setChunkReadingCallback(cb) {
    this.chunkReadingCb = cb;
  }

  applyChunkReadingCallback(chunkIndex, downloaded, total) {
    if (this.chunkReadingCb) {
      this.chunkReadingCb(chunkIndex, downloaded, total);
    }
  }

  setChunkCompleteCallback(cb) {
    this.chunkCompleteCb = cb;
  }

  applyChunkCompleteCallback(chunkIndex) {
    if (this.chunkCompleteCb) {
      this.chunkCompleteCb(chunkIndex);
    }
  }

  /**
   * Create and prepare file handle
   * @param {number} size File size in bytes
   * @returns {Promise<fs.promises.FileHandle>} File handle
   */
  async createFileHandle(size) {
    const fh = await fs.promises.open(this.output, "w+");
    await fh.truncate(size);
    this.fileHandle = fh;
    console.log(`Created file: ${this.output} (${size} bytes)`);
    return fh;
  }

  /**
   * Close file handle if open
   */
  async closeHandle() {
    if (this.fileHandle) {
      await this.fileHandle.close().catch(() => { });
      this.fileHandle = null;
    }
  }

  /**
   * Remove output file if download not complete
   */
  removeIfNotComplete() {
    if (fs.existsSync(this.output)) {
      fs.unlinkSync(this.output);
    }
  };

  /**
   * Abort all active readers
   */
  abortReaders() {
    for (const reader of this.readers) {
      reader.cancel().catch(() => { });
    }
  }

  /**
   * Cleanup on exit
   */
  async doExit() {
    await this.closeHandle();
    this.abortReaders();
    if (!this.isComplete()) {
      term.red("Cleaning up incomplete file...");
      this.removeIfNotComplete();
    }
  }

  /**
   * Download a single chunk
   * @param {{index: number, start: number, end: number}} chunk Chunk information
   */
  async downloadChunk(chunk) {
    const res = await fetch(this.url, {
      headers: { Range: `bytes=${chunk.start}-${chunk.end}` },
    });

    if (res.status !== 206) {
      throw new Error(`Range not supported (status ${res.status})`);
    }

    const reader = res.body.getReader();
    const total = chunk.end - chunk.start + 1;
    let offset = chunk.start;
    let downloaded = 0;
    this.readers.push(reader);

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done || this.isExit()) {
          reader.cancel();
          break;
        }
        await this.fileHandle.write(value, 0, value.length, offset);
        offset += value.length;
        downloaded += value.length;
        this.applyChunkReadingCallback(chunk.index, downloaded, total);
      }
    } catch (error) {
      reader.cancel();
      throw error;
    }

    if (this.isExit()) return;

    reader.cancel();

    this.applyChunkCompleteCallback(chunk.index);
  }

  /**
   * Main download function
   */
  async download() {
    try {
      const size = await getFileSize(this.url);
      const chunkList = createChunks(size, this.chunks);

      await this.createFileHandle(size);

      let index = 0;

      const worker = async () => {
        console.log("Worker started");
        while (true) {
          const i = index++;
          if (i >= chunkList.length) break;
          await this.downloadChunk(chunkList[i]);
        }
      };

      this.applyBeforeDownloadCallback(chunkList);
      await Promise.all(Array.from({ length: this.parallel }, worker));
      await this.closeHandle();
      this.triggerComplete();
    } catch (err) {
      await this.closeHandle();
      await this.removeIfNotComplete();
    }
  }
}

/* ---------------- CLI ---------------- */
const program = new Command();

program
  .requiredOption("-u, --url <url>", "Download URL")
  .requiredOption("-o, --output <path>", "Output file path")
  .option("-c, --chunks <number>", "Number of chunks", v => Number(v), 10)
  .option("-p, --parallel <number>", "Max parallel downloads", v => Number(v), 5)
  .action(async (options) => {
    const { url, output, chunks, parallel } = options;
    const downloader = new InternetDownloader(url, output, chunks, parallel);
    let bars;

    downloader.setBeforeDownloadCallback((chunkList) => {
      bars = createProgressBars(chunkList.length);
    });
    downloader.setChunkReadingCallback((chunkIndex, downloaded, total) => {
      bars[chunkIndex].update(downloaded / total);
    });
    downloader.setChunkCompleteCallback((chunkIndex) => {
      bars[chunkIndex].update(1);
    });

    await downloader.download();
  });

program.parse();