import { EmbedBuilder, User } from "discord.js";
import SchedulerEvent from "../model/event";
import ExtendedUser from "../model/extendedUser";

const attendeesArrayToString = (attendees: ReadonlyArray<ExtendedUser>): string => {
    if (attendees.length === 0) return 'None';
    
    let result = '';
    for (const attendee of attendees) {
        result += attendee.toMention();
        result += ', ';
    }
    result = result.substring(0, result.length-2);
    return result;
};

export const createEventEmbed = (event: SchedulerEvent): EmbedBuilder => {
    const embed = new EmbedBuilder();

    const attendees = 'Attendees: ' + attendeesArrayToString(event.attendees);
    let timeInstructions: string;
    if (!event.chosenTime) {
        timeInstructions = 'Time is currently undecided. Use `/suggest` to suggest a time or `/vote` to vote for a suggested time.';
    } else {
        timeInstructions = `Time is set to ...`;
    }
    const description = `An event organized by <@${event.organizer.id}>.\n\n${attendees}\n\n${timeInstructions}`;
    console.log(description)

    embed.setTitle(event.name);
    embed.setDescription(description);
    embed.setFooter({ text: `ID: ${event.id}` })

    return embed;
};