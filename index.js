const { Client, GatewayIntentBits, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

const CHANNEL_ID = "1508029068363300885";
const ROLE_CHANNEL_ID = "1118955072756392008";
const messageCount = {};

const roles = [
    { label: "🐐", roleId: "1533173333598666923" },
    { label: "🕵🏻", roleId: "1533173630106599555" },
    { label: "🔍", roleId: "1533173639279542404" },
    { label: "🗓️", roleId: "1543575688144224276" },
    { label: "🪂", roleId: "1533174641168748615" },
    { label: "🥷🏻", roleId: "1533173621621657872" },
];

let roleMsgSent = false;

client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);

    if (roleMsgSent) return;
    roleMsgSent = true;

    const channel = await client.channels.fetch(ROLE_CHANNEL_ID);

    const embed = new EmbedBuilder()
        .setTitle("Research & Calls")
        .setDescription(
            `<a:blue_arrow:1533138835637272646> <#1118959364313718816>\n` +
            `<a:blue_arrow:1533138835637272646> <#1509203944885321799>\n` +
            `<a:blue_arrow:1533138835637272646> <#1508874990416691321> Mint Analysis 🔍\n` +
            `<a:blue_arrow:1533138835637272646> <#1537367024844541952> Daily Mint Reminders 🗓️\n` +
            `<a:blue_arrow:1533138835637272646> <#1510554220460380230> Airdrops 🪂\n` +
            `<a:blue_arrow:1533138835637272646> <#1231623313617584129> Early Finds 🥷🏻`
        )
        .setImage("https://media.discordapp.net/attachments/1129724505032503306/1544296065828790302/83a4c5dc-a0ec-403c-a079-53b003b8e528.png?ex=6a97fd49&is=6a96abc9&hm=a64fc277516e3f47cd8c462e949a8cf864cd3c8613892cc5a8088ec0a0c0b2e0&=&format=webp&quality=lossless&width=2048&height=683") // ⬅️ replace with your image URL
        .setColor("#000000");

    const row1 = new ActionRowBuilder().addComponents(
        roles.slice(0, 3).map(r =>
            new ButtonBuilder()
                .setCustomId(r.roleId)
                .setLabel(r.label)
                .setStyle(ButtonStyle.Secondary)
        )
    );

    const row2 = new ActionRowBuilder().addComponents(
        roles.slice(3, 6).map(r =>
            new ButtonBuilder()
                .setCustomId(r.roleId)
                .setLabel(r.label)
                .setStyle(ButtonStyle.Secondary)
        )
    );

    await channel.send({ embeds: [embed], components: [row1, row2] });
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    const roleId = interaction.customId;
    const member = interaction.member;
    const role = interaction.guild.roles.cache.get(roleId);

    if (!role) return interaction.reply({ content: "Role not found!", ephemeral: true });

    if (member.roles.cache.has(roleId)) {
        await member.roles.remove(role);
        await interaction.reply({ content: `Removed **${role.name}**!`, ephemeral: true });
    } else {
        await member.roles.add(role);
        await interaction.reply({ content: `Added **${role.name}**!`, ephemeral: true });
    }
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    if (message.mentions.has(client.user)) {
        await message.reply("Shh... Making money rn....");
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
                `hey ${message.author}bb! 🔔 Check pin messages.. & please keep discussion inside threads!^^`
            );
            setTimeout(() => warning.delete(), 8000);
            messageCount[userId] = 0;
        }
    }
});

client.login(process.env.TOKEN);