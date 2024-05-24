import { Events, BaseInteraction, Base, ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import CommandsClient from './../commandsClient';

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction: BaseInteraction, client: CommandsClient) {
        if (interaction.isChatInputCommand()) {
            await handleChatInputCommand(interaction, client);
        } else if (interaction.isAutocomplete()) {
            await handleAutocomplete(interaction, client);
        } else {
            return;
        }
    }
};

const handleChatInputCommand = async (interaction: ChatInputCommandInteraction, client: CommandsClient) => {
    const command: any = client.commands.get(interaction.commandName);
    if (!command) return console.error(`No command matching ${interaction.commandName} was found.`);

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(`Error executing ${interaction.commandName}`);
        console.error(error);
    }
};

const handleAutocomplete = async (interaction: AutocompleteInteraction, client: CommandsClient) => {
    const command: any = client.commands.get(interaction.commandName);

    try {
        await command.autocomplete(interaction, client);
    } catch (error) {
        console.error(`Error executing ${interaction.commandName}`);
        console.error(error);
    }
};