import { SlashCommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import CommandsClient from '../commandsClient';
import moment from 'moment-timezone';
import UserWrapper from '../model/userWrapper';
import Scheduler from '../scheduler';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timezone')
        .setDescription('Set your timezone.')
        .addStringOption(option => 
            option.setName('timezone')
                .setDescription('The timezone.')
                .setRequired(true)
                .setAutocomplete(true)
        ),
    async autocomplete(interaction: AutocompleteInteraction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
		const choices = moment.tz.names();
		const filtered = choices.filter(choice => choice.toLowerCase().includes(focusedValue));

        // https://stackoverflow.com/questions/73449317/how-to-add-more-than-25-choices-to-autocomplete-option-discord-js-v14
        let options;
        if (filtered.length > 25) {
            options = filtered.slice(0, 25);
        } else {
            options = filtered;
        }

		await interaction.respond(
			options.map(choice => ({ name: choice, value: choice })),
		);
    },
    async execute(interaction: ChatInputCommandInteraction, client: CommandsClient) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const user = Scheduler.instance.getUser(interaction.user);

            const timezone = interaction.options.getString('timezone') ?? '';
            user.timezone = timezone;

            interaction.editReply(`Timezone set to \`${timezone}\`.`);
        } catch (err) {
            console.error(err);
        }
    },
};