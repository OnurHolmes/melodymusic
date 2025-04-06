const { Client, Intents, Collection } = require('discord.js');
require('dotenv').config();

global.client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES
    ]
});

client.commands = new Collection();
client.queue = new Map();

client.config = require('./config');

require('./src/loader');

client.login(process.env.TOKEN);

async function execute(message, args) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        return message.channel.send('Müzik çalmak için bir ses kanalında olmalısınız!');
    }

    if (!args.length) {
        return message.channel.send('Lütfen bir şarkı adı veya URL girin!');
    }

    try {
        const searchString = args.join(' ');
        const videoResult = await yts(searchString);
        const video = videoResult.videos[0];

        const song = {
            title: video.title,
            url: video.url,
            duration: video.duration,
            thumbnail: video.thumbnail
        };

        if (!serverQueue) {
            const queueConstruct = {
                textChannel: message.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                volume: 5,
                playing: true,
                player: createAudioPlayer()
            };

            queue.set(message.guild.id, queueConstruct);
            queueConstruct.songs.push(song);

            try {
                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: voiceChannel.guild.id,
                    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                });
                queueConstruct.connection = connection;
                play(message.guild, queueConstruct.songs[0]);
            } catch (err) {
                console.error(err);
                queue.delete(message.guild.id);
                return message.channel.send('Bir hata oluştu!');
            }
        } else {
            serverQueue.songs.push(song);
            const embed = new MessageEmbed()
                .setTitle('Sıraya Eklendi! 🎵')
                .setDescription(`**${song.title}** sıraya eklendi!`)
                .setThumbnail(song.thumbnail)
                .setColor('#00ff00');
            return message.channel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error(error);
        return message.channel.send('Arama sonuçlarında bir hata oluştu!');
    }
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.connection.destroy();
        queue.delete(guild.id);
        return;
    }

    const stream = ytdl(song.url, { filter: 'audioonly', quality: 'highestaudio' });
    const resource = createAudioResource(stream);
    
    serverQueue.player.play(resource);
    serverQueue.connection.subscribe(serverQueue.player);

    serverQueue.player.on(AudioPlayerStatus.Idle, () => {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
    });

    const embed = new MessageEmbed()
        .setTitle('Şimdi Çalıyor 🎵')
        .setDescription(`**${song.title}**`)
        .setThumbnail(song.thumbnail)
        .setColor('#00ff00');
    
    serverQueue.textChannel.send({ embeds: [embed] });
}

function skip(message, serverQueue) {
    if (!message.member.voice.channel) {
        return message.channel.send('Şarkıyı geçmek için bir ses kanalında olmalısınız!');
    }
    if (!serverQueue) {
        return message.channel.send('Geçilecek şarkı yok!');
    }
    serverQueue.player.stop();
    message.channel.send('⏭️ Şarkı geçildi!');
}

function stop(message, serverQueue) {
    if (!message.member.voice.channel) {
        return message.channel.send('Müziği durdurmak için bir ses kanalında olmalısınız!');
    }
    if (!serverQueue) {
        return message.channel.send('Durdurulacak müzik yok!');
    }
    serverQueue.songs = [];
    serverQueue.player.stop();
    message.channel.send('⏹️ Müzik durduruldu!');
}

function help(message) {
    const embed = new MessageEmbed()
        .setTitle('Bot Komutları')
        .setDescription('İşte kullanabileceğiniz komutlar:')
        .addFields(
            { name: '!çal', value: 'Şarkı çalar (URL veya isim ile)' },
            { name: '!dur', value: 'Müziği durdurur' },
            { name: '!geç', value: 'Sıradaki şarkıya geçer' },
            { name: '!yardım', value: 'Bu mesajı gösterir' }
        )
        .setColor('#00ff00');
    message.channel.send({ embeds: [embed] });
}

// Botu başlat
client.login(process.env.TOKEN);
