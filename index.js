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
    if (message.channel.id !== CHANNEL_ID) return;

    const isThread =
        message.channel.type === ChannelType.PublicThread ||
        message.channel.type === ChannelType.PrivateThread;

    if (!isThread) {
        const userId = message.author.id;
        messageCount[userId] = (messageCount[userId] || 0) + 1;

        if (messageCount[userId] >= 2) {
            const warning = await message.channel.send(
                `hey ${message.author}bb! 🔔 Check pin messages.. & please keep discussion inside threads!^^`
            );
            setTimeout(() => warning.delete(), 8000);
            messageCount[userId] = 0; // reset after warning
        }
    }
});

client.login(process.env.TOKEN);
