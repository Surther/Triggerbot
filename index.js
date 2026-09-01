const { Client, GatewayIntentBits, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
    ],
});

const CHANNEL_ID = "1508029068363300885";
const ROLE_CHANNEL_ID = "1118955072756392008";
const REACTION_MESSAGE_ID = "1544362051055525990";
const messageCount = {};

const reactionRoles = [
    { emoji: "gw_origins:1509624557722402917", roleId: "1150140051590762526" },
    { emoji: "moneyfly:1533153404204093650", roleId: "1533141586416894063" },
    { emoji: "Raidor:1533143097582682236", roleId: "1524330260030816266" },
    { emoji: "scam_origins:1509624479708352653", roleId: "1153758935300440064" },
    { emoji: "pepembmbusiness:1533158525650604226", roleId: "1533140085539864626" },
    { emoji: "pepegamer:1533143536554348796", roleId: "1533140088609837217" },
];

const roles = [
    { label: "Goat Calls 🐐", roleId: "1533173333598666923" },
    { label: "Arash Calls 🕵🏻", roleId: "1533173630106599555" },
    { label: "Mint Analysis 🔍", roleId: "1533173639279542404" },
    { label: "Reminders 🗓️", roleId: "1543575688144224276" },
    { label: "Airdrops 🪂", roleId: "1533174641168748615" },
    { label: "Early Finds 🥷🏻", roleId: "1533173621621657872" },
];

let roleMsgSent = false;

client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);

    if (roleMsgSent) return;
    roleMsgSent = true;

    // Add reactions FIRST
    try {
        const reactionChannel = await client.channels.fetch(ROLE_CHANNEL_ID);
        const reactionMsg = await reactionChannel.messages.fetch(REACTION_MESSAGE_ID);

        for (const r of reactionRoles) {
            const emoji = client.emojis.cache.find(e => `${e.name}:${e.id}` === r.emoji);
            if (emoji) {
                await reactionMsg.react(emoji);
                console.log(`Reacted with ${r.emoji}`);
            } else {
                console.log(`Emoji not found: ${r.emoji}`);
            }
        }
        console.log("Reactions done!");
    } catch (e) {
        console.error("Reaction error:", e);
    }

    // Button embed check
    try {
        const channel = await client.channels.fetch(ROLE_CHANNEL_ID);
        const messages = await channel.messages.fetch({ limit: 10 });
        const existing = messages.find(m => m.author.id === client.user.id && m.embeds.length > 0);
        if (existing) return;

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
            .setImage("https://media.discordapp.net/attachments/1129724505032503306/1544296065828790302/83a4c5dc-a0ec-403c-a079-53b003b8e528.png?ex=6a97fd49&is=6a96abc9&hm=a64fc277516e3f47cd8c462e949a8cf864cd3c8613892cc5a8088ec0a0c0b2e0&=&format=webp&quality=lossless&width=2048&height=683")
            .setColor("#00f2f2");

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
    } catch (error) {
        console.error("Error sending embed:", error);
    }
});

// REACTION ADD
client.on("messageReactionAdd", async (reaction, user) => {
    if (user.bot) return;
    if (reaction.message.id !== REACTION_MESSAGE_ID) return;

    if (reaction.partial) await reaction.fetch();

    const emojiName = reaction.emoji.id
        ? `${reaction.emoji.name}:${reaction.emoji.id}`
        : reaction.emoji.name;

    const roleData = reactionRoles.find(r => r.emoji === emojiName);
    if (!roleData) return;

    const guild = reaction.message.guild;
    const member = await guild.members.fetch(user.id);
    const role = guild.roles.cache.get(roleData.roleId);

    if (role && member) {
        await member.roles.add(role);
        console.log(`Added ${role.name} to ${user.tag}`);
    }
});

// REACTION REMOVE
client.on("messageReactionRemove", async (reaction, user) => {
    if (user.bot) return;
    if (reaction.message.id !== REACTION_MESSAGE_ID) return;

    if (reaction.partial) await reaction.fetch();

    const emojiName = reaction.emoji.id
        ? `${reaction.emoji.name}:${reaction.emoji.id}`
        : reaction.emoji.name;

    const roleData = reactionRoles.find(r => r.emoji === emojiName);
    if (!roleData) return;

    const guild = reaction.message.guild;
    const member = await guild.members.fetch(user.id);
    const role = guild.roles.cache.get(roleData.roleId);

    if (role && member) {
        await member.roles.remove(role);
        console.log(`Removed ${role.name} from ${user.tag}`);
    }
});

// BUTTON ROLES
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    try {
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
    } catch (error) {
        console.error(error);
        if (!interaction.replied) {
            await interaction.reply({ content: "Something went wrong!", ephemeral: true });
        }
    }
});

// THREAD WARNING
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
