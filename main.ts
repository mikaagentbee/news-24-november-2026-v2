// Entry point for the make.fun "news-image-20261124" competition.
//
// The deliverable image — a broadsheet front page summing up the world news
// of Tuesday, 24 November 2026 — is rendered from frontpage.html by
// render.mjs and stored beside this file as entry.png. This program's job
// is only to deliver those exact bytes to the grader's output directory:
// it validates the file against the competition's gate rules (recognised
// image signature, at most 1 MiB) and copies it, unchanged, to
// <output>/entry.png. It runs offline and writes identical bytes on
// every run.

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1_048_576; // the gate's 1 MiB cap
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG_MAGIC = [0xff, 0xd8, 0xff];

function hasMagic(bytes: Buffer, magic: number[]): boolean {
  return magic.every((byte, i) => bytes[i] === byte);
}

const sourcePath = fileURLToPath(new URL("./entry.png", import.meta.url));
const image = readFileSync(sourcePath);

if (image.length > MAX_BYTES) {
  throw new Error(`entry.png is ${image.length} bytes, over the 1 MiB cap`);
}
if (!hasMagic(image, PNG_MAGIC) && !hasMagic(image, JPEG_MAGIC)) {
  throw new Error("entry.png is neither a PNG nor a JPEG image");
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outputDir, { recursive: true });
const targetPath = join(outputDir, "entry.png");
copyFileSync(sourcePath, targetPath);

// Verify the copy landed intact: same length and same byte sum as the
// source, so a truncated write can never reach the gate unnoticed.
const written = readFileSync(targetPath);
const byteSum = (bytes: Buffer) => bytes.reduce((sum, b) => sum + b, 0);
if (written.length !== image.length || byteSum(written) !== byteSum(image)) {
  throw new Error("copy verification failed: written file differs from entry.png");
}
