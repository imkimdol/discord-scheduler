import { AutocompleteInteraction, EmbedBuilder, SlashCommandStringOption, User } from "discord.js";
import SchedulerEvent from "../model/event";
import UserWrapper from "../model/userWrapper";
import SuggestedTime from "../model/suggestedTime";
import { momentToSimpleString } from "./timeHelper";
import Scheduler from "../scheduler";

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
        const votesArray = Object.values(time.votes);
        votesArray.forEach(vote => {
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
    let chosenTime = '';
    if (!event.chosenTime) {
        const timeInstructions = 'Time is currently undecided. Use /suggest to suggest a time or /vote to vote for a suggested time. Organizers can choose a time with /choose.';
        embed.setFooter({ text: timeInstructions });
    } else {
        chosenTime = `\nTime is set to \`${momentToSimpleString(event.chosenTime, user.timezone)}\`.`;
    }
    const description = `An event organized by <@${event.organizer.id}>.${chosenTime}\n${attendees}`;

    embed.setTitle(event.name);
    embed.setDescription(description);
    embed.setFields(suggestedTimesToFields(event.suggestedTimes, user.timezone));

    return embed;
};

export const eventStringOption = (option: SlashCommandStringOption) => {
    return option.setName('event')
        .setDescription('Name of the event. If names clash, the earliest created event is used.')
        .setAutocomplete(true)
};

// TODO merge duplicated functionality into one function
export const eventAutocomplete = async (interaction: AutocompleteInteraction) => {
    const focusedValue = interaction.options.getFocused();
    const user = Scheduler.instance.getUser(interaction.user);
    const events = Object.values(user.events);
    const eventNames = events.map(event => event.name);
    const filtered = eventNames.filter(name => name.startsWith(focusedValue));

    // https://stackoverflow.com/questions/73449317/how-to-add-more-than-25-choices-to-autocomplete-option-discord-js-v14
    let options;
    if (filtered.length > 25) {
        options = filtered.slice(0, 25);
    } else {
        options = filtered;
    }

    await interaction.respond(
        options.map(choice => ({ name: choice, value: choice })),
    );
};

export const organizingEventAutocomplete = async (interaction: AutocompleteInteraction) => {
    const focusedValue = interaction.options.getFocused();
    const user = Scheduler.instance.getUser(interaction.user);
    const events = Object.values(user.organizingEvents);
    const eventNames = events.map(event => event.name);
    const filtered = eventNames.filter(name => name.startsWith(focusedValue));

    // https://stackoverflow.com/questions/73449317/how-to-add-more-than-25-choices-to-autocomplete-option-discord-js-v14
    let options;
    if (filtered.length > 25) {
        options = filtered.slice(0, 25);
    } else {
        options = filtered;
    }

    await interaction.respond(
        options.map(choice => ({ name: choice, value: choice })),
    );
};