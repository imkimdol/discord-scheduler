import { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, APIMessageActionRowComponent, SelectMenuComponent, StringSelectMenuInteraction, Interaction } from 'discord.js';
import CommandsClient from '../commandsClient';
import { eventAutocomplete, eventStringOption } from '../helpers/eventHelper';
import Scheduler from '../scheduler';
import SchedulerEvent from '../model/event';
import UserWrapper from '../model/userWrapper';
import SuggestedTime from '../model/suggestedTime';
import { momentToSimpleString } from '../helpers/timeHelper';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Vote for times.')
        .addStringOption(eventStringOption)
    ,
    autocomplete: eventAutocomplete,
    async execute(interaction: ChatInputCommandInteraction, client: CommandsClient) {
        await interaction.deferReply({ ephemeral: true });

        try {
            // TODO: clean up function
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

            const suggestedTimes = event.suggestedTimes;
            if (suggestedTimes.length === 0) {
                await interaction.editReply(`There are no suggested times to vote for.`);
                return;
            }

            const selectMenu = buildSelectMenu(user, suggestedTimes);
            const reply = await interaction.editReply({ components: [selectMenu] });
            
            let indexes: number[] = [];
            try {
                const collectorFilter = (i: Interaction) => i.user.id === interaction.user.id;
                const selectInteraction = await reply.awaitMessageComponent({ filter: collectorFilter, time: 300_000 }) as StringSelectMenuInteraction;
                indexes = selectInteraction.values.map(v => Number.parseInt(v));
                selectInteraction.update({ content: 'Voted.', components: [] });
            } catch {}

            suggestedTimes.forEach(time => time.removeVote(user));
            indexes.forEach(i => suggestedTimes[i].addVote(user));

            try {
                event.updateMessage(user);
            } catch {}
        } catch (err) {
            console.error(err);
        }
    },
};

const buildSelectMenu = (user: UserWrapper, suggestedTimes: ReadonlyArray<SuggestedTime>) => {
    if (!user.timezone) throw new Error('User has no timezone.');
    const timezone = user.timezone;

    const selectMenu = new StringSelectMenuBuilder()
		.setCustomId('vote')
		.setPlaceholder('Vote for times:')
        .setMinValues(1)
        .setMaxValues(suggestedTimes.length);
    
    suggestedTimes.forEach((time, index) => {
        const option = new StringSelectMenuOptionBuilder()
            .setLabel(momentToSimpleString(time.time, timezone))
            .setDescription(`Suggested by ${time.suggester.user.displayName}`)
            .setValue(index.toString());
        selectMenu.addOptions(option);
    });
    
    return new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(selectMenu);
};