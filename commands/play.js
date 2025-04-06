const { SlashCommandBuilder } = require('@discordjs/builders');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const { MessageEmbed } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const play = require('play-dl');
const ytdl = require('ytdl-core');
const yts = require('yt-search');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Müzik çal')
        .addStringOption(option =>
            option.setName('şarkı')
                .setDescription('Şarkı adı, YouTube veya Spotify bağlantısı')
                .setRequired(true)),

    async execute(interaction, client) {
        // Blacklist kontrolü
        const blacklist = await db.get('blacklist') || [];
        if (blacklist.includes(interaction.user.id)) {
            return interaction.reply({ content: 'Kara listede olduğunuz için müzik çalamazsınız!', ephemeral: true });
        }
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply('Müzik çalmak için bir ses kanalında olmalısınız!');
        }

        await interaction.deferReply();

        const query = interaction.options.getString('şarkı');
        let songInfo;
        let url;

        try {
            // Spotify bağlantısı kontrolü
            if (query.includes('spotify.com')) {
                const spotifyData = await play.spotify(query);
                const searchResult = await yts(`${spotifyData.name} ${spotifyData.artists[0].name}`);
                url = searchResult.videos[0].url;
                songInfo = {
                    title: spotifyData.name,
                    url: url,
                    thumbnail: searchResult.videos[0].thumbnail,
                    duration: searchResult.videos[0].duration
                };
            }
            // YouTube bağlantısı kontrolü
            else if (ytdl.validateURL(query)) {
                const videoInfo = await ytdl.getInfo(query);
                url = query;
                songInfo = {
                    title: videoInfo.videoDetails.title,
                    url: url,
                    thumbnail: videoInfo.videoDetails.thumbnails[0].url,
                    duration: parseInt(videoInfo.videoDetails.lengthSeconds)
                };
            }
            // İsim ile arama
            else {
                const searchResult = await yts(query);
                if (!searchResult.videos.length) {
                    return interaction.editReply('Şarkı bulunamadı!');
                }
                const video = searchResult.videos[0];
                url = video.url;
                songInfo = {
                    title: video.title,
                    url: url,
                    thumbnail: video.thumbnail,
                    duration: video.duration
                };
            }

            const queue = client.queue;
            const serverQueue = queue.get(interaction.guildId);

            if (!serverQueue) {
                const queueConstruct = {
                    textChannel: interaction.channel,
                    voiceChannel: voiceChannel,
                    connection: null,
                    songs: [],
                    volume: 5,
                    playing: true,
                    player: createAudioPlayer()
                };

                queue.set(interaction.guildId, queueConstruct);
                queueConstruct.songs.push(songInfo);

                try {
                    const connection = joinVoiceChannel({
                        channelId: voiceChannel.id,
                        guildId: interaction.guildId,
                        adapterCreator: interaction.guild.voiceAdapterCreator,
                    });
                    queueConstruct.connection = connection;
                    await playSong(interaction.guild, queueConstruct.songs[0], client);
                } catch (err) {
                    console.error(err);
                    queue.delete(interaction.guildId);
                    return interaction.editReply('Bir hata oluştu!');
                }
            } else {
                serverQueue.songs.push(songInfo);
                const embed = new MessageEmbed()
                    .setTitle('Sıraya Eklendi! 🎵')
                    .setDescription(`**${songInfo.title}** sıraya eklendi!`)
                    .setThumbnail(songInfo.thumbnail)
                    .setColor('#00ff00');
                return interaction.editReply({ embeds: [embed] });
            }

        } catch (error) {
            console.error(error);
            return interaction.editReply('Şarkı çalınırken bir hata oluştu!');
        }
    },
};

async function playSong(guild, song, client) {
    const queue = client.queue;
    const serverQueue = queue.get(guild.id);

    if (!song) {
        serverQueue.connection.destroy();
        queue.delete(guild.id);
        return;
    }

    const stream = await play.stream(song.url);
    const resource = createAudioResource(stream.stream, {
        inputType: stream.type
    });
    
    serverQueue.player.play(resource);
    serverQueue.connection.subscribe(serverQueue.player);

    serverQueue.player.on('stateChange', (oldState, newState) => {
        if (newState.status === 'idle') {
            serverQueue.songs.shift();
            playSong(guild, serverQueue.songs[0], client);
        }
    });

    const embed = new MessageEmbed()
        .setTitle('Şimdi Çalıyor 🎵')
        .setDescription(`**${song.title}**`)
        .setThumbnail(song.thumbnail)
        .setColor('#00ff00');
    
    serverQueue.textChannel.send({ embeds: [embed] });
}
