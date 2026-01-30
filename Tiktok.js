import axios from "axios";

export default {
  command: ["tiktok", "tt"],
  description: "TikTok Downloader PRO (HD + Slide)",
  ownerOnly: false,

  async execute(ctx) {
    const url = ctx.message.text.split(" ")[1];
    if (!url || !url.includes("tiktok")) {
      return ctx.reply("❌ Masukin link TikTok\n\nContoh:\n/tiktok https://vt.tiktok.com/xxxx");
    }

    const info = await ctx.reply("⬇️ Mengambil data TikTok...");

    try {
      // =============================
      // ===== FETCH DATA ============
      // =============================
      const api = `https://tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;
      const { data } = await axios.get(api);

      if (!data || !data.data) {
        throw "Invalid response";
      }

      const d = data.data;

      // =============================
      // ===== CAPTION ===============
      // =============================
      const caption =
`🎵 *TIKTOK DOWNLOAD*

👤 *User:* ${d.author.nickname} (@${d.author.unique_id})
❤️ *Like:* ${d.digg_count}
💬 *Comment:* ${d.comment_count}
🔁 *Share:* ${d.share_count}
💾 *Save:* ${d.collect_count || 0}
👁️ *Views:* ${d.play_count}

📝 *Caption:*
${d.title || "-"}`;

      // =============================
      // ===== PHOTO SLIDE ===========
      // =============================
      if (d.images && d.images.length > 0) {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          info.message_id,
          null,
          caption,
          { parse_mode: "Markdown" }
        );

        for (const img of d.images) {
          await ctx.replyWithPhoto(img);
        }
        return;
      }

      // =============================
      // ===== VIDEO =================
      // =============================
      const videoURL = d.hdplay || d.play;

      await ctx.telegram.editMessageText(
        ctx.chat.id,
        info.message_id,
        null,
        caption,
        { parse_mode: "Markdown" }
      );

      await ctx.replyWithVideo(videoURL, {
        caption: "🎬 TikTok HD",
        supports_streaming: true
      });

    } catch (e) {
      console.error(e);
      ctx.telegram.editMessageText(
        ctx.chat.id,
        info.message_id,
        null,
        "❌ Gagal download TikTok"
      );
    }
  }
};
