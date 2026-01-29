import axios from "axios";

export default {
  command: "tiktok",
  description: "Download video TikTok HD + info lengkap",
  ownerOnly: false,

  async execute(ctx) {
    try {
      const text = ctx.message.text.split(" ").slice(1).join(" ");

      if (!text || !text.includes("tiktok.com")) {
        return ctx.reply(
          "❌ Masukkan link TikTok!\n\nContoh:\n/tiktok https://vt.tiktok.com/xxxx"
        );
      }

      await ctx.reply("⏳ Tunggu masseh...");

      // API TikWM (public, no key)
      const api = `https://tikwm.com/api/?url=${encodeURIComponent(text)}&hd=1`;
      const res = await axios.get(api);

      if (!res.data || !res.data.data) {
        return ctx.reply("eror jir, coba lagi");
      }

      const data = res.data.data;

      const videoUrl = data.play; // no watermark
      const author = data.author;

      const caption =
        "🎵 *TIKTOK DOWNLOADER*\n\n" +
        `👤 Username: @${author.unique_id}\n` +
        `🧾 Nickname: ${author.nickname}\n\n` +
        `👁️ Views: ${data.play_count}\n` +
        `❤️ Likes: ${data.digg_count}\n` +
        `💬 Comments: ${data.comment_count}\n` +
        `🔁 Share: ${data.share_count}\n` +
        `💾 Save: ${data.download_count}\n\n` +
        `🎬 Quality: HD\n` +
        `📡 Source: tikwm.com\n` +
        `⏱️ Expired: ❌ Tidak Expired`;

      await ctx.replyWithVideo(
        { url: videoUrl },
        {
          caption,
          parse_mode: "Markdown"
        }
      );

    } catch (err) {
      console.error(err);
      ctx.reply("❌ Terjadi error saat download TikTok");
    }
  }
};
