module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`${client.user.username} hazır!`);
        client.user.setActivity(client.config.playing);
    },
};
