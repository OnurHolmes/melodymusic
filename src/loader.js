const { readdirSync } = require('fs');

// Commands loader
const commands = readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commands) {
    const command = require(`../commands/${file}`);
    console.log(`✅ ${file} komutu yüklendi`);
    client.commands.set(command.data.name, command);
}

// Events loader
const events = readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of events) {
    const event = require(`../events/${file}`);
    console.log(`✅ ${file} eventi yüklendi`);
    
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}
