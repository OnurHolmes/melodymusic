const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklist-liste')
        .setDescription('Kara listedeki kullanıcıları gösterir'),
    async execute(interaction) {
        // Use Application Commands iznini kontrol et
        if (!interaction.member.permissions.has('USE_APPLICATION_COMMANDS')) {
            return interaction.reply({ content: 'Bu komutu kullanma yetkiniz yok!', ephemeral: true });
        }

        const blacklist = await db.get('blacklist') || [];
        const embed = new MessageEmbed()
            .setTitle('Kara Liste')
            .setColor('#ff0000');

        if (blacklist.length === 0) {
            embed.setDescription('Kara listede kimse yok!');
        } else {
            const users = [];
            for (const userId of blacklist) {
                try {
                    const user = await interaction.client.users.fetch(userId);
                    users.push(`${user.tag} (${user.id})`);
                } catch {
                    users.push(`Bilinmeyen Kullanıcı (${userId})`);
                }
            }
            embed.setDescription(users.join('\n'));
        }

        interaction.reply({ embeds: [embed] });
    },
};
