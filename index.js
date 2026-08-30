const { Client, GatewayIntentBits, ChannelType } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const CHANNEL_ID = "1508029068363300885";
const messageCount = {};

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    // If someone tags the bot
    if (message.mentions.has(client.user)) {
        await message.reply("Shh... preparing for war rn!");
        return;
    }

    if (message.channel.id !== CHANNEL_ID) return;

    const isThread =
        message.channel.type === ChannelType.PublicThread ||
        message.channel.type === ChannelType.PrivateThread;

    if (!isThread) {
        const userId = message.author.id;
        messageCount[userId] = (messageCount[userId] || 0) + 1;

        if (messageCount[userId] >= 2) {
            const warning = await message.channel.send(
                `hey ${message.author} bb! Check pin messages. Please keep discussion inside threads!^^`
            );
            setTimeout(() => warning.delete(), 8000);
            messageCount[userId] = 0;
        }
    }
});

client.login(process.env.TOKEN);
