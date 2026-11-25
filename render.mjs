// Build tool (not run by the grader): renders frontpage.html to entry.png.
//
//   node render.mjs
//
// It screenshots the page with the workspace Chrome at 2x scale, then uses
// Python/PIL to downscale to the final 768x1024 with a Lanczos filter, which
// keeps the small serif type crisp. The result is written beside this file
// as entry.png — the file main.ts ships to the grader's output directory.

import { execFileSync } from "node:child_process";
import { existsSync, statSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const chrome = "/home/hatch/workspace/.tmp/chrome/chrome-linux64/chrome";
const htmlPath = join(here, "frontpage.html");
const rawShot = join(here, ".frontpage-2x.png");
const finalPng = join(here, "entry.png");

if (!existsSync(chrome)) {
  throw new Error(`Chrome not found at ${chrome}`);
}

execFileSync(
  chrome,
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=2",
    "--window-size=768,1024",
    `--screenshot=${rawShot}`,
    `file://${htmlPath}`,
  ],
  { stdio: "inherit" },
);

const resizeScript = [
  "from PIL import Image",
  `im = Image.open(${JSON.stringify(rawShot)}).convert("RGB")`,
  'im = im.resize((768, 1024), Image.LANCZOS)',
  `im.save(${JSON.stringify(finalPng)}, optimize=True)`,
  "print(im.size)",
].join("\n");

execFileSync("python3", ["-c", resizeScript], { stdio: "inherit" });
unlinkSync(rawShot);

const bytes = statSync(finalPng).size;
console.log(`entry.png written: ${bytes} bytes (cap 1048576)`);
if (bytes > 1048576) {
  throw new Error("entry.png exceeds the 1 MiB competition cap");
}
