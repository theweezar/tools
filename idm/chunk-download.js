"use strict";

const fs = require("fs");
const { Command } = require("commander");
const termkit = require("terminal-kit");
const term = termkit.terminal;

/* ---------------- CLI ---------------- */

const program = new Command();

program
  .requiredOption("-u, --url <url>", "Download URL")
  .requiredOption("-o, --output <path>", "Output file path")
  .option("-c, --chunks <number>", "Number of chunks", v => Number(v), 10)
  .option("-p, --parallel <number>", "Max parallel downloads", v => Number(v), 5);

program.parse();

const options = program.opts();
const { url, output, chunks, parallel } = options;
const readers = [];
let complete, fileHandle, exitTriggered;

/**
 * Cleanup on exit
 */
async function doExit() {
  await closeHandle();
  abortReaders();
  if (!complete) {
    term.red("Cleaning up incomplete file...");
    removeIfNotComplete();
  }
}

process.on("exit", doExit);

const readline = require("readline");
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
  process.stdin.resume();
}
process.stdin.on("keypress", async (str, key) => {
  if (key.ctrl && key.name === "c") {
    exitTriggered = true;
    term.clear();
    await doExit();
    process.exit();
  }
});

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

/**
 * Create and prepare file handle
 * @param {string} output Output file path
 * @param {number} size File size in bytes
 * @returns {Promise<fs.promises.FileHandle>} File handle
 */
async function createFileHandle(output, size) {
  const fh = await fs.promises.open(output, "w+");
  await fh.truncate(size);
  return fh;
}

/**
 * Close file handle if open
 */
async function closeHandle() {
  if (fileHandle) {
    await fileHandle.close().catch(() => { });
    fileHandle = null;
  }
};

/**
 * Remove output file if download not complete
 */
async function removeIfNotComplete() {
  if (fs.existsSync(output)) {
    fs.unlinkSync(output);
  }
};

/**
 * Abort all active readers
 */
function abortReaders() {
  for (const reader of readers) {
    reader.cancel().catch(() => { });
  }
}

/* ---------------- Main logic ---------------- */
/**
 * Download a single chunk
 * @param {string} url File URL
 * @param {{index: number, start: number, end: number}} chunk Chunk information
 * @param {fs.promises.FileHandle} fileHandle File handle for writing
 * @param {termkit.Terminal.ProgressBarController} bar Progress bar for this chunk
 */
async function downloadChunk(url, chunk, fileHandle, bar) {
  const res = await fetch(url, {
    headers: { Range: `bytes=${chunk.start}-${chunk.end}` },
  });

  if (res.status !== 206) {
    throw new Error(`Range not supported (status ${res.status})`);
  }

  const reader = res.body.getReader();
  const total = chunk.end - chunk.start + 1;
  let offset = chunk.start;
  let downloaded = 0;
  readers.push(reader);

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done || exitTriggered) {
        reader.cancel();
        break;
      }
      await fileHandle.write(value, 0, value.length, offset);
      offset += value.length;
      downloaded += value.length;
      bar.update(downloaded / total);
    }
  } catch (error) {
    reader.cancel();
    throw error;
  }

  if (exitTriggered) return;

  bar.update(1);
}

/**
 * Main download function
 */
async function downloadFile() {
  try {
    const size = await getFileSize(url);
    const chunkList = createChunks(size, chunks);

    term.green(`File size: ${size} bytes\nChunks: ${chunkList.length}, Parallel: ${parallel}`);

    fileHandle = await createFileHandle(output, size);

    let index = 0;
    const bars = createProgressBars(chunkList.length);

    async function worker() {
      while (true) {
        const i = index++;
        if (i >= chunkList.length) break;
        await downloadChunk(url, chunkList[i], fileHandle, bars[i]);
      }
    }

    await Promise.all(Array.from({ length: parallel }, worker));
    await closeHandle();
    term.clear();
    term.green("Download completed successfully");
    complete = true;
  } catch (err) {
    term.clear();
    term.red(`Error: ${err.message}`);
    await closeHandle();
    await removeIfNotComplete();
  }
}

downloadFile();
