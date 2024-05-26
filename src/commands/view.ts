import { SlashCommandBuilder, ChatInputCommandInteraction, StringSelectMenuInteraction, Interaction } from 'discord.js';
import CommandsClient from '../commandsClient';
import { createEventEmbed, eventAutocomplete, eventStringOption } from '../helpers/eventHelper';
import Scheduler from '../scheduler';
import SchedulerEvent from '../model/event';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('view')
        .setDescription('View an event.')
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

            const eventName = interaction.options.getString('event') ?? null;
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
            
            const embed = createEventEmbed(event, user);
            const message = await interaction.editReply({ embeds: [embed]});
            try {
                await event.message?.delete();
            } catch {}
            event.message = message;
        } catch (err) {
            console.error(err);
        }
    },
};