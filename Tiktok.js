import axios from "axios";

export default {
  command: ["tt", "tiktok"],
  description: "TikTok Downloader HD (No WM, Real Data)",
  ownerOnly: false,

  async execute(ctx) {
    const text = ctx.message.text.split(" ").slice(1).join(" ");
    if (!text) return ctx.reply("❌ Kirim link TikTok\n\nContoh:\n/tt https://vt.tiktok.com/xxxx");

    const info = await ctx.reply("🔍 Mengambil data TikTok...");

    try {
      const api = `https://tikwm.com/api/?url=${encodeURIComponent(text)}&hd=1`;
      const { data } = await axios.get(api, { timeout: 15000 });

      if (!data || !data.data) {
        return ctx.telegram.editMessageText(
          ctx.chat.id,
          info.message_id,
          null,
          "❌ Gagal ambil data TikTok"
        );
      }

      const v = data.data;

      const caption =
        `🎵 *TIKTOK DOWNLOADER*\n\n` +
        `👤 User: ${v.author.nickname} (@${v.author.unique_id})\n` +
        `❤️ Like: ${v.digg_count}\n` +
        `💬 Komentar: ${v.comment_count}\n` +
        `🔁 Share: ${v.share_count}\n` +
        `⭐ Save: ${v.collect_count}\n` +
        `👁 Views: ${v.play_count}\n\n` +
        `📝 Caption:\n${v.title || "-"}`;

      // thumbnail
      if (v.cover) {
        await ctx.replyWithPhoto(v.cover, { caption: "🖼 Thumbnail" });
      }

      // video
      await ctx.replyWithVideo(
        { url: v.play },
        {
          caption,
          parse_mode: "Markdown"
        }
      );

      // audio
      await ctx.replyWithAudio(
        { url: v.music },
        {
          title: v.music_info?.title || "TikTok Audio",
          performer: v.music_info?.author || v.author.nickname,
          thumb: v.cover
        }
      );

      await ctx.telegram.deleteMessage(ctx.chat.id, info.message_id);

    } catch (err) {
      console.error(err);
      ctx.telegram.editMessageText(
        ctx.chat.id,
        info.message_id,
        null,
        "❌ Error TikTok API / Video private / Region lock"
      );
    }
  }
};
