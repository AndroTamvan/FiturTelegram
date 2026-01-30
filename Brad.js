import { createCanvas } from "canvas";
import GIFEncoder from "gif-encoder-2";
import sharp from "sharp";
import fs from "fs";

export default {
  command: ["brad", "bradvid"],
  description: "Brad Sticker & Bradvid Animated Sticker",
  ownerOnly: false,

  async execute(ctx) {
    const cmd = ctx.message.text.split(" ")[0].replace("/", "");
    const text = ctx.message.text.split(" ").slice(1).join(" ");
    if (!text) return ctx.reply("❌ Masukin teks");

    const SIZE = 512;

    // ======================
    // ===== BRAD STATIC ====
    // ======================
    if (cmd === "brad") {
      const canvas = createCanvas(SIZE, SIZE);
      const c = canvas.getContext("2d");

      drawBG(c, SIZE);
      autoText(c, text, SIZE);

      const png = canvas.toBuffer("image/png");
      const webp = await sharp(png).webp({ quality: 95 }).toBuffer();

      return ctx.replyWithSticker({ source: webp });
    }

    // ======================
    // === BRADVID ANIMASI ==
    // ======================
    if (cmd === "bradvid") {
      const info = await ctx.reply("🎞️ Render sticker...");

      const canvas = createCanvas(SIZE, SIZE);
      const c = canvas.getContext("2d");

      const encoder = new GIFEncoder(SIZE, SIZE);
      const gifFile = `/tmp/bradvid_${Date.now()}.gif`;

      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(90);
      encoder.setQuality(10);

      for (let i = 1; i <= text.length; i++) {
        c.clearRect(0, 0, SIZE, SIZE);
        drawBG(c, SIZE);
        autoText(c, text.slice(0, i), SIZE);
        encoder.addFrame(c);
      }

      encoder.finish();
      fs.writeFileSync(gifFile, encoder.out.getData());

      const webpFile = `/tmp/bradvid_${Date.now()}.webp`;
      await sharp(gifFile).webp({ quality: 90 }).toFile(webpFile);

      await ctx.replyWithSticker({ source: fs.createReadStream(webpFile) });

      fs.unlinkSync(gifFile);
      fs.unlinkSync(webpFile);
      await ctx.telegram.deleteMessage(ctx.chat.id, info.message_id);
    }
  }
};

// ==========================
// ===== DRAW BACKGROUND ====
// ==========================
function drawBG(c, size) {
  c.fillStyle = "#020617";
  c.fillRect(0, 0, size, size);
}

// ==========================
// ===== AUTO TEXT SCALE ====
// ==========================
function autoText(ctx, text, size) {
  let fontSize = 64;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  while (fontSize > 20) {
    ctx.font = `bold ${fontSize}px Sans`;
    const lines = wrapLines(ctx, text, size - 80);
    if (lines.length * fontSize < size - 100) {
      const startY = size / 2 - ((lines.length - 1) * fontSize) / 2;
      lines.forEach((l, i) => {
        ctx.fillStyle = "#ffffff";
        ctx.fillText(l, size / 2, startY + i * fontSize);
      });
      return;
    }
    fontSize -= 4;
  }
}

// ==========================
// ===== TEXT WRAP =========
// ==========================
function wrapLines(ctx, text, maxWidth) {
  const words = text.split(" ");
  let line = "";
  let lines = [];

  for (let w of words) {
    const test = line + w + " ";
    if (ctx.measureText(test).width > maxWidth) {
      lines.push(line.trim());
      line = w + " ";
    } else {
      line = test;
    }
  }
  lines.push(line.trim());
  return lines;
}
