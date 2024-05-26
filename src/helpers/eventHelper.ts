import { EmbedBuilder, User } from "discord.js";
import SchedulerEvent from "../model/event";
import UserWrapper from "../model/userWrapper";
import SuggestedTime from "../model/suggestedTime";
import { momentToSimpleString } from "./timeHelper";

type Field = { name: string, value: string, inline?: boolean };

const attendeesArrayToString = (attendees: ReadonlyArray<UserWrapper>): string => {
    if (attendees.length === 0) return 'None';
    
    let result = '';
    for (const attendee of attendees) {
        result += attendee.toMention();
        result += ', ';
    }
    result = result.substring(0, result.length-2);
    return result;
};

const suggestedTimesToFields = (times: ReadonlyArray<SuggestedTime>, timezone: string): Field[] => {
    let fields: Field[] = [];

    times.forEach(time => {
        const name = momentToSimpleString(time.time, timezone);
        const inline = true;

        let value = 'Votes:';
        time.votes.forEach(vote => {
            value += '\n';
            value += vote.toMention();
        });

        fields.push({ name: name, value: value, inline: inline });
    });

    return fields;
}

export const createEventEmbed = (event: SchedulerEvent, user: UserWrapper): EmbedBuilder => {
    if (!user.timezone) throw new Error(`User \`${user.id}\` has no timezone.`);
    const embed = new EmbedBuilder();

    const attendees = 'Attendees: ' + attendeesArrayToString(event.attendees);
    let timeInstructions = '';
    let chosenTime = '';
    if (!event.chosenTime) {
        timeInstructions = 'Time is currently undecided. Use /suggest to suggest a time or /vote to vote for a suggested time.\n';
    } else {
        chosenTime = `\nTime is set to \`${momentToSimpleString(event.chosenTime, user.timezone)}\``;
    }
    const description = `An event organized by <@${event.organizer.id}>.${chosenTime}\n${attendees}`;

    embed.setTitle(event.name);
    embed.setDescription(description);
    embed.setFields(suggestedTimesToFields(event.suggestedTimes, user.timezone));
    embed.setFooter({ text: timeInstructions });

    return embed;
};