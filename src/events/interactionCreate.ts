import { Events, BaseInteraction } from 'discord.js';
import CommandsClient from './../commandsClient';

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction: BaseInteraction, client: CommandsClient) {
        if (!interaction.isChatInputCommand()) return;

        const command: any = client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
    },
};