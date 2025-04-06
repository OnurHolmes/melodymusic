const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Çalan şarkıyı geç'),
    async execute(interaction, client) {
        const queue = client.queue;
        const serverQueue = queue.get(interaction.guildId);

        if (!interaction.member.voice.channel) {
            return interaction.reply('Bu komutu kullanmak için bir ses kanalında olmalısınız!');
        }

        if (!serverQueue) {
            return interaction.reply('Geçilecek şarkı yok!');
        }

        serverQueue.player.stop();
        interaction.reply('⏭️ Şarkı geçildi!');
    },
};
