import { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, APIMessageActionRowComponent, SelectMenuComponent, StringSelectMenuInteraction, Interaction } from 'discord.js';
import CommandsClient from '../commandsClient';
import { eventAutocomplete, eventStringOption, organizingEventAutocomplete } from '../helpers/eventHelper';
import Scheduler from '../scheduler';
import SchedulerEvent from '../model/event';
import UserWrapper from '../model/userWrapper';
import SuggestedTime from '../model/suggestedTime';
import { momentToSimpleString } from '../helpers/timeHelper';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('choose')
        .setDescription('Choose a time.')
        .addStringOption(eventStringOption)
    ,
    autocomplete: organizingEventAutocomplete,
    async execute(interaction: ChatInputCommandInteraction, client: CommandsClient) {
        await interaction.deferReply();

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
                event = user.getLatestEvent(true);
            } else {
                event = user.getEventFromName(eventName, true);
            }
            if (!event) {
                await interaction.editReply(`The event could not be found.`);
                return;
            }
            
            const suggestedTimes = event.suggestedTimes;
            if (suggestedTimes.length === 0) {
                await interaction.editReply(`There are no suggested times to choose.`);
                return;
            }

            const selectMenu = buildSelectMenu(user, suggestedTimes);
            const reply = await interaction.editReply({ components: [selectMenu] });

            let indexes: number[] = [];
            try {
                const collectorFilter = (i: Interaction) => i.user.id === interaction.user.id;
                const selectInteraction = await reply.awaitMessageComponent({ filter: collectorFilter, time: 300_000 }) as StringSelectMenuInteraction;
                indexes = selectInteraction.values.map(v => Number.parseInt(v));
                const chosenTime = suggestedTimes[indexes[0]].time;
                event.chosenTime = chosenTime;
                selectInteraction.update({ content: `${user.toMention()} decided \`${event.name}\` should be held at \`${momentToSimpleString(chosenTime, user.timezone)}\`.`, components: [] });
            } catch {}

            try {
                event.updateMessage(user);
            } catch {}
        } catch (err) {
            console.error(err);
        }
    },
};

// TODO merge with function in vote.ts
const buildSelectMenu = (user: UserWrapper, associatedTimes: ReadonlyArray<SuggestedTime>) => {
    if (!user.timezone) throw new Error('User has no timezone.');
    const timezone = user.timezone;

    const selectMenu = new StringSelectMenuBuilder()
		.setCustomId('vote')
		.setPlaceholder('Vote for times:')
    
    associatedTimes.forEach((time, index) => {
        const option = new StringSelectMenuOptionBuilder()
            .setLabel(momentToSimpleString(time.time, timezone))
            .setDescription(`Suggested by ${time.suggester.user.displayName}`)
            .setValue(index.toString());
        selectMenu.addOptions(option);
    });
    
    return new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(selectMenu);
};