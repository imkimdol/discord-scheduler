import { SlashCommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import CommandsClient from '../commandsClient';
import Scheduler from '../scheduler';
import moment from 'moment';
import SuggestedTime from '../model/suggestedTime';
import { momentToSimpleString } from '../helpers/timeHelper';
import SchedulerEvent from '../model/event';

const supportedDateFormats = ['MMMM DD, h:mm a', 'YYYY/MM/DD HH:mm'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggest')
        .setDescription('Suggest a new time. An event can only have up to 25 timeslots.')
        .addStringOption(option => 
            option.setName('time')
                .setDescription('The suggested time. Use formats "March 25, 2:05 pm" or "2024/03/25 14:05".')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('event')
                .setDescription('Name of the event. If names clash, the earliest created event is used.')
                .setAutocomplete(true)
        ),
    async autocomplete(interaction: AutocompleteInteraction) {
            const focusedValue = interaction.options.getFocused();
            const user = Scheduler.instance.getUser(interaction.user);
            const events = Object.values(user.events);
            const eventNames = events.map(event => event.name);
            const filtered = eventNames.filter(name => name.startsWith(focusedValue));
    
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
        await interaction.deferReply();

        try {
            const user = Scheduler.instance.getUser(interaction.user);
            if (!user.timezone) {
                await interaction.editReply('You have no timezone set. Please set a timezone.');
                return;
            }

            const timeString = interaction.options.getString('time') ?? '';
            const time = moment.tz(timeString, supportedDateFormats, true, user.timezone);
            if (!time.isValid()) {
                await interaction.editReply('Invalid time format.');
                return;
            }

            const eventName = interaction.options.getString('event') ?? null;
            let event: SchedulerEvent | null;
            if (!eventName) {
                event = user.getLatestEvent();
            } else {
                event = user.getEventFromName(eventName);
            }
            if (!event) {
                await interaction.editReply(`The event could not be found.`);
                return;
            }

            const suggestedTime = new SuggestedTime(time, user);
            event.addSuggestedTime(suggestedTime);

            try {
                event.updateMessage(user);
            } catch {
                event.message = null;
            }

            interaction.editReply(`Suggested time of ${momentToSimpleString(time, user.timezone)} added.`);
        } catch (err) {
            console.error(err);
        }
    },
};