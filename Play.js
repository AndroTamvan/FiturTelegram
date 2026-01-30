import yts from "yt-search";
import ytdl from "ytdl-core";
import axios from "axios";

export default {
  command: "play",
  description: "Play lagu dari YouTube (MP3 + Thumbnail)",
  ownerOnly: false,

  async execute(ctx) {
    const query = ctx.message.text.split(" ").slice(1).join(" ");
    if (!query) {
      return ctx.reply("❌ Masukin judul lagu\n\nContoh:\n/play payung teduh akad");
    }

    const info = await ctx.reply("🔍 Cari lagu di YouTube...");

    try {
      // SEARCH
      const search = await yts(query);
      const video = search.videos[0];
      if (!video) {
        return ctx.telegram.editMessageText(
          ctx.chat.id,
          info.message_id,
          null,
          "❌ Lagu tidak ditemukan"
        );
      }

      const caption =
        `🎧 *PLAY MUSIC*\n\n` +
        `🎵 Judul: ${video.title}\n` +
        `📺 Channel: ${video.author.name}\n` +
        `⏱ Durasi: ${video.timestamp}\n` +
        `👁 Views: ${video.views.toLocaleString()}\n\n` +
        `🔗 ${video.url}`;

      // THUMBNAIL
      await ctx.replyWithPhoto(video.thumbnail, {
        caption,
        parse_mode: "Markdown"
      });

      // AUDIO STREAM
      const audioStream = ytdl(video.url, {
        filter: "audioonly",
        quality: "highestaudio",
        highWaterMark: 1 << 25
      });

      await ctx.replyWithAudio(
        { source: audioStream },
        {
          title: video.title,
          performer: video.author.name,
          duration: video.seconds,
          thumb: await axios
            .get(video.thumbnail, { responseType: "arraybuffer" })
            .then(r => Buffer.from(r.data))
        }
      );

      await ctx.telegram.deleteMessage(ctx.chat.id, info.message_id);

    } catch (e) {
      console.error(e);
      ctx.telegram.editMessageText(
        ctx.chat.id,
        info.message_id,
        null,
        "❌ Gagal play lagu (YouTube limit / network error)"
      );
    }
  }
};
