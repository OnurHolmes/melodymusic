const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Çalan müziği duraklat'),
    async execute(interaction, client) {
        const queue = client.queue;
        const serverQueue = queue.get(interaction.guildId);

        if (!interaction.member.voice.channel) {
            return interaction.reply('Bu komutu kullanmak için bir ses kanalında olmalısınız!');
        }

        if (!serverQueue) {
            return interaction.reply('Şu anda çalan bir müzik yok!');
        }

        if (serverQueue.player.pause()) {
            interaction.reply('⏸️ Müzik duraklatıldı!');
        }
    },
};
