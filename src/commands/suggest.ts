import { SlashCommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import CommandsClient from '../commandsClient';
import Scheduler from '../scheduler';
import moment from 'moment';
import SuggestedTime from '../model/suggestedTime';
import { momentToSimpleString } from '../helpers/timeHelper';
import SchedulerEvent from '../model/event';
import { eventAutocomplete, eventStringOption } from '../helpers/eventHelper';

const supportedDateFormats = ['ha', 'h:mm a', 'MMMM DD, h:mm a', 'YYYY/MM/DD HH:mm'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggest')
        .setDescription('Suggest a new time. An event can only have up to 25 timeslots.')
        .addStringOption(option => 
            option.setName('time')
                .setDescription('The suggested time. Use formats "2pm", "2:00 pm", "March 25, 2:00 pm", or "2024/03/25 14:00".')
                .setRequired(true)
        )
        .addStringOption(eventStringOption)
    ,
    autocomplete: eventAutocomplete,
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

            interaction.editReply(`${user.toMention} suggested a time for \`${event.name}\`: \`${momentToSimpleString(time, user.timezone)}\``);
        } catch (err) {
            console.error(err);
        }
    },
};