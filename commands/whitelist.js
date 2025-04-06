const { SlashCommandBuilder } = require('@discordjs/builders');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Kullanıcıyı kara listeden çıkarır')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Kara listeden çıkarılacak kullanıcı')
                .setRequired(true)),
    async execute(interaction) {
        // Use Application Commands iznini kontrol et
        if (!interaction.member.permissions.has('USE_APPLICATION_COMMANDS')) {
            return interaction.reply({ content: 'Bu komutu kullanma yetkiniz yok!', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        let blacklist = await db.get('blacklist') || [];

        if (!blacklist.includes(user.id)) {
            return interaction.reply({ content: 'Bu kullanıcı zaten kara listede değil!', ephemeral: true });
        }

        blacklist = blacklist.filter(id => id !== user.id);
        await db.set('blacklist', blacklist);

        interaction.reply(`${user.tag} kara listeden çıkarıldı!`);
    },
};
