const { SlashCommandBuilder } = require('@discordjs/builders');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklist-ekle')
        .setDescription('Kullanıcıyı kara listeye alır')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Kara listeye alınacak kullanıcı')
                .setRequired(true)),
    async execute(interaction) {
        // Use Application Commands iznini kontrol et
        if (!interaction.member.permissions.has('USE_APPLICATION_COMMANDS')) {
            return interaction.reply({ content: 'Bu komutu kullanma yetkiniz yok!', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const blacklist = await db.get('blacklist') || [];

        if (blacklist.includes(user.id)) {
            return interaction.reply({ content: 'Bu kullanıcı zaten kara listede!', ephemeral: true });
        }

        blacklist.push(user.id);
        await db.set('blacklist', blacklist);

        interaction.reply(`${user.tag} kara listeye alındı!`);
    },
};
