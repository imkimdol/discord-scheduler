import { ClientUser, Events } from 'discord.js';
import CommandsClient from './../commandsClient';

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client: CommandsClient) {
        const user = client.user as ClientUser;
        console.log(`Ready! Logged in as ${user.tag}`);
    },
};