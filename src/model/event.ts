import { v1 as uuid } from 'uuid';
import SuggestedTime from './suggestedTime';
import { Message } from 'discord.js';
import UserWrapper from './userWrapper';
import { Moment } from 'moment-timezone';
import Scheduler from '../scheduler';
import { compareTimes } from '../helpers/timeHelper';
import { createEventEmbed } from '../helpers/eventHelper';
 
type NullableMoment = Moment | null;
type NullableMessage = Message | null;

export default class SchedulerEvent {
    private _id: string;
    private _name: string;
    private _organizer: UserWrapper;
    private _attendees: UserWrapper[];
    private _created: Moment;
    private _suggestedTimes: SuggestedTime[]; // max 25, always sorted
    private _chosenTime: NullableMoment;

    public message: NullableMessage;

    public get id(): string { return this._id; };
    public get name(): string { return this._name; };
    public get organizer(): UserWrapper { return this._organizer; };
    public get attendees(): ReadonlyArray<UserWrapper> { return this._attendees; };
    public get created(): Moment { return this._created; };
    public get suggestedTimes(): ReadonlyArray<SuggestedTime> { return this._suggestedTimes; };
    public get chosenTime(): NullableMoment { return this._chosenTime; };

    private set id(value: string) { this._id = value; };
    private set name(value: string) { this._name = value; };
    private set organizer(value: UserWrapper) { this._organizer = value; };
    private set suggestedTimes(value: SuggestedTime[]) { this._suggestedTimes = value; };
    private set created(value: Moment) { this._created = value; };
    public set chosenTime(value: Moment) { this._chosenTime = value; };

    constructor(name: string, organizer: UserWrapper, attendees: UserWrapper[], created: Moment) {
        this._id = uuid();
        this._name = name;
        this._organizer = organizer;
        this._attendees = attendees;
        this._suggestedTimes = [];
        this._created = created;
        this._chosenTime = null;
        this.message = null;

        Scheduler.instance.addEvent(this);
        this.organizer.addOrganizingEvent(this);
        this.attendees.forEach(a => a.addAttendingEvent(this));
    };

    delete() {
        try {
            this.message?.delete();
        } catch {}

        Scheduler.instance.removeEvent(this);
        this.organizer.removeOrganizingEvent(this);
        this.attendees.forEach(a => a.removeAttendingEvent(this));
    };

    addSuggestedTime(time: SuggestedTime) {
        if (this._suggestedTimes.length < 25) {
            this._suggestedTimes.push(time);
            this._suggestedTimes = this._suggestedTimes.sort(compareTimes);
        }
    };

    removeSuggestedTime(time: SuggestedTime) {
        this._suggestedTimes = this._suggestedTimes.filter(t => t !== time);
    };

    updateMessage(user: UserWrapper) {
        if (!this.message) return;

        const embed = createEventEmbed(this, user);
        this.message.edit({ embeds: [embed] });
    };
};