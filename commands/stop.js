const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Müziği durdur ve sırayı temizle'),
    async execute(interaction, client) {
        const queue = client.queue;
        const serverQueue = queue.get(interaction.guildId);

        if (!interaction.member.voice.channel) {
            return interaction.reply('Bu komutu kullanmak için bir ses kanalında olmalısınız!');
        }

        if (!serverQueue) {
            return interaction.reply('Durdurulacak müzik yok!');
        }

        serverQueue.songs = [];
        serverQueue.player.stop();
        interaction.reply('⏹️ Müzik durduruldu ve sıra temizlendi!');
    },
};
