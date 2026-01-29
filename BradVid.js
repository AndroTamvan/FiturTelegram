import axios from "axios";

export default {
  command: "bradvid",
  description: "Random Brad video animation",
  ownerOnly: false,

  async execute(ctx) {
    try {
      await ctx.reply("⏳ Mengambil video...");

      // API random video (safe & public)
      const api = "https://api.waifu.pics/sfw/dance";
      const res = await axios.get(api);

      if (!res.data || !res.data.url) {
        return ctx.reply("❌ Gagal mengambil video");
      }

      const videoUrl = res.data.url;

      await ctx.replyWithAnimation(
        { url: videoUrl },
        {
          caption:
            "🎬 *Brad Video Animation*\n\n" +
            "📡 Source: Public API\n" +
            "📂 Type: Animation (GIF)\n" +
            "⏱️ Expired: ❌ Tidak Expired\n",
          parse_mode: "Markdown"
        }
      );

    } catch (err) {
      console.error(err);
      ctx.reply("❌ Terjadi kesalahan saat mengambil video");
    }
  }
};
