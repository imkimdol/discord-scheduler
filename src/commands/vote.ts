import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import CommandsClient from '../commandsClient';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Vote for times.'),
    async execute(interaction: ChatInputCommandInteraction, client: CommandsClient) {
        await interaction.deferReply();

        try {
            interaction.editReply('Unimplemented.');
        } catch (err) {
            console.error(err);
        }
    },
};