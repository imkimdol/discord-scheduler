import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import CommandsClient from '../commandsClient';
import { eventStringOption, organizingEventAutocomplete } from '../helpers/eventHelper';
import Scheduler from '../scheduler';
import SchedulerEvent from '../model/event';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Delete an event that you are organizing.')
        .addStringOption(eventStringOption)
    ,
    autocomplete: organizingEventAutocomplete,
    async execute(interaction: ChatInputCommandInteraction, client: CommandsClient) {
        await interaction.deferReply();

        try {
            const user = Scheduler.instance.getUser(interaction.user);
            
            let eventName = interaction.options.getString('event') ?? null;
            let event: SchedulerEvent | null;
            if (!eventName) {
                event = user.getLatestEvent(true);
            } else {
                event = user.getEventFromName(eventName, true);
            }
            if (!event) {
                await interaction.editReply(`The event could not be found.`);
                return;
            }

            eventName = event.name;
            event.delete();
            interaction.editReply(`Deleted event \`${eventName}\``);
        } catch (err) {
            console.error(err);
        }
    },
};