import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, User } from 'discord.js';
import CommandsClient from '../commandsClient';
import SchedulerEvent from '../model/event';
import Scheduler from '../scheduler';
import * as EventHelper from '../helpers/eventHelper';
import UserWrapper from '../model/userWrapper';
import moment from 'moment';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('schedule')
        .setDescription('Schedule a new event.')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('Name of the scheduled event.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('attendees')
                .setDescription('Attendees for the event. Enter comma-separated mentioned users.')
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction, client: CommandsClient) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const user = Scheduler.instance.getUser(interaction.user);
            if (!user.timezone) {
                await interaction.editReply('You have no timezone set. Please set a timezone.');
                return;
            }
            
            const name = interaction.options.getString('name') ?? 'Unnamed Event';
            const attendeesString = interaction.options.getString('attendees') ?? '';
            
            const attendees = await attendeesStringToSchedulerUserArray(attendeesString, client);
            const now = moment.utc();
            const event = new SchedulerEvent(name, user, attendees, now);

            const embed = EventHelper.createEventEmbed(event, user);
            const message = await interaction.channel?.send({ embeds: [embed] });
            if (message) event.message = message;

            interaction.editReply('Created new event.');
        } catch (err) {
            console.error(err);
        }
    }
};

const attendeesStringToSchedulerUserArray = async (attendeesString: string, client: CommandsClient): Promise<UserWrapper[]> => {
    const attendees = [] as UserWrapper[];

    for (const attendeeString of attendeesString.replace(' ', '').split(',')) {
        if (UserWrapper.mentionRegex.test(attendeeString)) {
            const attendeeId = attendeeString.substring(2, attendeeString.length-1);
            console.log(attendeeId);
            const user = await client.users.fetch(attendeeId) as User;
            const extendedUser = new UserWrapper(user);
            attendees.push(extendedUser);
        }
    }

    return attendees;
};