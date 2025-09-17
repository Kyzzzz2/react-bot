require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
const express = require('express');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// IDs autorisés
const allowedUsers = [
    "1162727729716789278",
    "1410167123250118746",
    "1381676303903756401",
    "1397702641739628656",
    "1394583969822933063"
];

// Salon et rôle depuis .env
const targetChannelId = process.env.CHANNEL_ID;
const roleIdToGive = process.env.ROLE_ID;

// Emojis
const tickEmoji = "✅";
const crossEmoji = "❌";

client.on(Events.MessageReactionAdd, async (reaction, user) => {
    try {
        if (reaction.partial) await reaction.fetch();
        if (reaction.message.partial) await reaction.message.fetch();

        if (reaction.message.channel.id !== targetChannelId) return;
        if (!allowedUsers.includes(user.id)) return;

        const messageAuthor = reaction.message.author;
        const member = await reaction.message.guild.members.fetch(messageAuthor.id);

        if (reaction.emoji.name === tickEmoji) {
            if (member && !member.roles.cache.has(roleIdToGive)) {
                await member.roles.add(roleIdToGive);
                await reaction.message.reply(`${messageAuthor}, Tu as maintenant accès à la catégorie premium.`);
                console.log(`Rôle ajouté à ${member.user.tag}`);
            }
        } else if (reaction.emoji.name === crossEmoji) {
            await reaction.message.reply(`${messageAuthor}, Veuillez fournir des preuves valables pour accéder aux salons premium, les fondateurs ont décidé que vos preuves étaient non valables.`);
        }
    } catch (error) {
        console.error('Erreur avec la réaction :', error);
    }
});

client.once(Events.ClientReady, () => {
    console.log(`Connecté en tant que ${client.user.tag}`);
});

// Lancement du bot
client.login(process.env.DISCORD_TOKEN);

// ===================== Serveur Web pour keep-alive =====================
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot Discord en ligne ✅');
});

app.listen(PORT, () => {
    console.log(`Serveur web démarré sur le port ${PORT}`);
});
