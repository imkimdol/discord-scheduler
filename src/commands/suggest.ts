import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import CommandsClient from '../commandsClient';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggest')
        .setDescription('Suggest a new time.'),
    async execute(interaction: ChatInputCommandInteraction, client: CommandsClient) {
        await interaction.deferReply();

        try {
            interaction.editReply('Unimplemented.');
        } catch (err) {
            console.error(err);
        }
    },
};