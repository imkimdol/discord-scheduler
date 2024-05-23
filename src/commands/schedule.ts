import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, User } from 'discord.js';
import CommandsClient from '../commandsClient';
import SchedulerEvent from '../model/event';
import Scheduler from '../scheduler';
import UserHelper from '../helpers/userHelper';
import * as EventHelper from '../helpers/eventHelper';

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

        const name = interaction.options.getString('name') ?? 'Unnamed Event';
        const attendeesString = interaction.options.getString('attendees') ?? '';
        
        try {
            const user = interaction.user as User;
            const attendees = await attendeesStringToSchedulerUserArray(attendeesString, client);
            const event = new SchedulerEvent(name, user, attendees);

            const embed = EventHelper.createEventEmbed(event);
            const message = await interaction.channel?.send({ embeds: [embed] });
            if (message) event.message = message;
            Scheduler.instance.addEvent(event);

            interaction.editReply('Created new event.');
        } catch (err) {
            console.error(err);
        }
    }
};

const attendeesStringToSchedulerUserArray = async (attendeesString: string, client: CommandsClient): Promise<User[]> => {
    const attendees = [] as User[];

    for (const attendeeString of attendeesString.replace(' ', '').split(',')) {
        if (UserHelper.mentionRegex.test(attendeeString)) {
            const attendeeId = attendeeString.substring(2, attendeeString.length-1);
            console.log(attendeeId);
            const user = await client.users.fetch(attendeeId) as User;
            attendees.push(user);
        }
    }

    return attendees;
};