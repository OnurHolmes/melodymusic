const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Komut yardımını gösterir'),
    async execute(interaction) {
        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('help_menu')
                    .setPlaceholder('Bir komut kategorisi seçin')
                    .addOptions([
                        {
                            label: 'Müzik Komutları',
                            description: 'Müzik ile ilgili komutlar',
                            value: 'music',
                            emoji: '🎵'
                        },
                        {
                            label: 'Premium Özel Komutlar',
                            description: 'Premium üyelere özel komutlar',
                            value: 'premium',
                            emoji: '⭐'
                        },
                        {
                            label: 'Admin Özel Komutlar',
                            description: 'Yönetici komutları',
                            value: 'admin',
                            emoji: '⚙️'
                        }
                    ]),
            );

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Bot Komutları')
            .setDescription('Aşağıdan bir kategori seçin')
            .addField('Müzik Nasıl Dinlenir?', '/play <şarkı adı/url>')
            .addField('Komut Kategorileri:', 
                '🎵 : Müzik Komutları\n' +
                '⭐ : Premium Özel Komutlar\n' +
                '⚙️ : Admin Özel Komutlar'
            );

        await interaction.reply({ embeds: [embed], components: [row] });

        const filter = i => i.customId === 'help_menu' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            const helpEmbed = new MessageEmbed()
                .setColor('#0099ff');

            switch (i.values[0]) {
                case 'music':
                    helpEmbed
                        .setTitle('🎵 Müzik Komutları')
                        .addFields(
                            { name: '/play', value: 'Müzik ismi veya linki girince o şarkıyı çalar' },
                            { name: '/stop', value: 'Müziği durdurur ve botu ses kanalından çıkarır' },
                            { name: '/skip', value: 'Çalan şarkıyı geçer' }
                        );
                    break;
                case 'premium':
                    helpEmbed
                        .setTitle('⭐ Premium Özel Komutlar')
                        .setDescription('Premium özellikler yakında eklenecek!');
                    break;
                case 'admin':
                    helpEmbed
                        .setTitle('⚙️ Admin Özel Komutlar')
                        .addFields(
                            { name: '/blacklist-ekle', value: 'Belirtilen kullanıcıyı kara listeye alır' },
                            { name: '/blacklist-liste', value: 'Kara listedeki kullanıcıları gösterir' },
                            { name: '/whitelist', value: 'Kullanıcıyı kara listeden çıkarır' }
                        );
                    break;
            }

            await i.update({ embeds: [helpEmbed], components: [row] });
        });
    },
};
