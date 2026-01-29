import axios from "axios";

export default {
  command: "brad",
  description: "Generate brat image dari text",
  ownerOnly: false,

  async execute(ctx) {
    try {
      const text = ctx.message.text.split(" ").slice(1).join(" ");

      if (!text) {
        return ctx.reply("❌ Contoh:\n/brad vortex2026");
      }

      await ctx.reply("🎨 otw massehh..");

      /**
       * API brat-style (text to image)
       * public + no key + no expired
       */
      const apiUrl =
        "https://api.memegen.link/images/custom/" +
        encodeURIComponent(text) +
        ".png?background=https://i.imgur.com/8pQe0ZQ.jpg";

      // cek api hidup
      await axios.get(apiUrl);

      await ctx.replyWithPhoto(
        { url: apiUrl },
        {
          caption:
            "🖼️ *BRAT IMAGE*\n\n" +
            "📝 Text: " + text + "\n" +
            "📡 Source: memegen.link\n" +
            "⏱️ Expired: ❌ Tidak Expired\n",
          parse_mode: "Markdown"
        }
      );

    } catch (err) {
      console.error(err);
      ctx.reply("❌ Gagal membuat brat image");
    }
  }
};
