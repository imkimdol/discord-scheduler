import { SlashCommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRow, ActionRowBuilder, Interaction, StringSelectMenuInteraction } from 'discord.js';
import CommandsClient from '../commandsClient';
import Scheduler from '../scheduler';
import moment from 'moment';
import SuggestedTime from '../model/suggestedTime';
import { momentToSimpleString } from '../helpers/timeHelper';
import SchedulerEvent from '../model/event';
import { eventAutocomplete, eventStringOption } from '../helpers/eventHelper';
import UserWrapper from '../model/userWrapper';

const supportedDateFormats = ['ha', 'h:mm a', 'MMMM DD, h:mm a', 'YYYY/MM/DD HH:mm'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unsuggest')
        .setDescription('Remove a time that you suggested.')
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
                event = user.getLatestEvent();
            } else {
                event = user.getEventFromName(eventName);
            }
            if (!event) {
                await interaction.editReply(`The event could not be found.`);
                return;
            }

            const suggestedTimes = event.suggestedTimes.filter(time => time.suggester.id === user.id);
            if (suggestedTimes.length === 0) {
                await interaction.editReply(`There are no suggested times to remove.`);
                return;
            }

            const selectMenu = buildSelectMenu(user, suggestedTimes);
            const reply = await interaction.editReply({ components: [selectMenu] });

            let indexes: number[] = [];
            try {
                const collectorFilter = (i: Interaction) => i.user.id === interaction.user.id;
                const selectInteraction = await reply.awaitMessageComponent({ filter: collectorFilter, time: 300_000 }) as StringSelectMenuInteraction;
                indexes = selectInteraction.values.map(v => Number.parseInt(v));
                const toRemove = suggestedTimes[indexes[0]];
                event.removeSuggestedTime(toRemove);
                selectInteraction.update({ content: `Removed time \`${momentToSimpleString(toRemove.time, user.timezone)}\` from event ${event.name}.`, components: [] });
            } catch {}

            try {
                event.updateMessage(user);
            } catch {
                event.message = null;
            }
        } catch (err) {
            console.error(err);
        }
    },
};

const buildSelectMenu = (user: UserWrapper, suggestedTimes: ReadonlyArray<SuggestedTime>) => {
    if (!user.timezone) throw new Error('User has no timezone.');
    const timezone = user.timezone;

    const selectMenu = new StringSelectMenuBuilder()
		.setCustomId('unsuggest')
		.setPlaceholder('Remove a suggested time:')
    
    suggestedTimes.forEach((time, index) => {
        const option = new StringSelectMenuOptionBuilder()
            .setLabel(momentToSimpleString(time.time, timezone))
            .setValue(index.toString());
        selectMenu.addOptions(option);
    });
    
    return new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(selectMenu);
};