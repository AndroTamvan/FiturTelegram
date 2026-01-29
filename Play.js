import yts from "yt-search";
import ytdl from "ytdl-core";

export default {
  command: "play",
  description: "Play lagu dari YouTube (audio)",
  ownerOnly: false,

  async execute(ctx) {
    try {
      const query = ctx.message.text.split(" ").slice(1).join(" ");

      if (!query) {
        return ctx.reply("❌ Contoh:\n/play dj satu rasa");
      }

      await ctx.reply("🔍 otw kang...");

      // cari video
      const search = await yts(query);
      const video = search.videos[0];

      if (!video) {
        return ctx.reply("Lagunya g ketemu jir");
      }

      const audioStream = ytdl(video.url, {
        filter: "audioonly",
        quality: "highestaudio"
      });

      const caption =
        "🎵 *PLAY MUSIC*\n\n" +
        `📌 Judul: ${video.title}\n` +
        `👤 Channel: ${video.author.name}\n` +
        `⏱️ Durasi: ${video.timestamp}\n` +
        `👁️ Views: ${video.views.toLocaleString()}\n\n` +
        `🎧 Source: YouTube\n` +
        `⏱️ Expired: ❌ Tidak Expired`;

      await ctx.replyWithPhoto(
        { url: video.thumbnail },
        {
          caption,
          parse_mode: "Markdown"
        }
      );

      await ctx.replyWithAudio(
        { source: audioStream },
        {
          title: video.title,
          performer: video.author.name,
          thumb: { url: video.thumbnail }
        }
      );

    } catch (err) {
      console.error(err);
      ctx.reply("❌ Gagal memutar lagu");
    }
  }
};
