import axios from "axios";
import FormData from "form-data";

export default {
  command: "tourl",
  description: "Multi host uploader (fast, real, no fake)",
  ownerOnly: false,

  async execute(ctx) {
    const reply = ctx.message.reply_to_message;
    if (!reply) return ctx.reply("❌ Reply media dengan /tourl");

    let fileId, isImage = false;
    if (reply.photo) {
      fileId = reply.photo.at(-1).file_id;
      isImage = true;
    } else if (reply.video) fileId = reply.video.file_id;
    else if (reply.audio) fileId = reply.audio.file_id;
    else if (reply.document) fileId = reply.document.file_id;
    else return ctx.reply("❌ Media tidak didukung");

    const info = await ctx.reply("📦 Upload ke multi-host...");

    try {
      const tgFile = await ctx.telegram.getFileLink(fileId);
      const buffer = await axios.get(tgFile.href, { responseType: "arraybuffer" });

      const results = [];

      // ===== PARALLEL TASKS =====
      await Promise.allSettled([

        // CATBOX
        (async () => {
          try {
            const form = new FormData();
            form.append("reqtype", "fileupload");
            form.append("fileToUpload", buffer.data, "file");
            const r = await axios.post("https://catbox.moe/user/api.php", form, { headers: form.getHeaders() });
            results.push({ host: "Catbox", ok: true, url: r.data.trim(), exp: "Tanpa Expired" });
          } catch { results.push({ host: "Catbox", ok: false }); }
        })(),

        // POMF2
        (async () => {
          try {
            const form = new FormData();
            form.append("files[]", buffer.data, "file");
            const r = await axios.post("https://pomf2.lain.la/upload.php", form, { headers: form.getHeaders() });
            results.push({ host: "Pomf2", ok: true, url: r.data.files[0].url, exp: "Tanpa Expired" });
          } catch { results.push({ host: "Pomf2", ok: false }); }
        })(),

        // GOFILE
        (async () => {
          try {
            const server = await axios.get("https://api.gofile.io/getServer");
            const form = new FormData();
            form.append("file", buffer.data, "file");
            const r = await axios.post(
              `https://${server.data.data.server}.gofile.io/uploadFile`,
              form,
              { headers: form.getHeaders() }
            );
            results.push({
              host: "GoFile.io",
              ok: true,
              url: r.data.data.downloadPage,
              exp: "Expired jika tidak diakses 10 hari"
            });
          } catch { results.push({ host: "GoFile.io", ok: false }); }
        })(),

        // PIXHOST (IMAGE ONLY)
        isImage ? (async () => {
          try {
            const form = new FormData();
            form.append("img", buffer.data, "image.jpg");
            const r = await axios.post("https://api.pixhost.to/images", form, { headers: form.getHeaders() });
            results.push({ host: "Pixhost", ok: true, url: r.data.show_url, exp: "Tanpa Expired" });
          } catch { results.push({ host: "Pixhost", ok: false }); }
        })() : Promise.resolve(),

        // GITHUB
        (async () => {
          try {
            const GITHUB_TOKEN = "ISI_TOKEN_GITHUB_LU_DI_SINI";
            const GITHUB_USER = "USERNAME_GITHUB";
            const GITHUB_REPO = "NAMA_REPO";

            const filename = `upload_${Date.now()}.bin`;
            const content = Buffer.from(buffer.data).toString("base64");

            await axios.put(
              `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/uploads/${filename}`,
              {
                message: "upload via telegram bot",
                content
              },
              {
                headers: {
                  Authorization: `Bearer ${GITHUB_TOKEN}`,
                  Accept: "application/vnd.github+json"
                }
              }
            );

            results.push({
              host: "GitHub",
              ok: true,
              url: `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/uploads/${filename}`,
              exp: "Tanpa Expired"
            });
          } catch { results.push({ host: "GitHub", ok: false }); }
        })()

      ]);

      // ===== OUTPUT =====
      const text =
        "📦 *MULTI HOST UPLOAD*\n\n" +
        results.map(r =>
          r.ok
            ? `${r.host}: ✅ *Sukses* | ${r.exp}`
            : `${r.host}: ❌ *Gagal*`
        ).join("\n") +
        "\n\n_Button hanya menampilkan yang sukses_";

      const buttons = results
        .filter(r => r.ok)
        .map(r => [{ text: `📋 Copy ${r.host} URL`, url: r.url }]);

      await ctx.telegram.editMessageText(
        ctx.chat.id,
        info.message_id,
        null,
        text,
        {
          parse_mode: "Markdown",
          reply_markup: { inline_keyboard: buttons }
        }
      );

    } catch (e) {
      console.error(e);
      ctx.telegram.editMessageText(
        ctx.chat.id,
        info.message_id,
        null,
        "❌ Upload gagal total"
      );
    }
  }
};
