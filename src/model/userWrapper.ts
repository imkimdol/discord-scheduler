import { User } from "discord.js";
import moment from "moment-timezone";
import SchedulerEvent from "./event";

type NullableString = string | null;
type SchedulerEventDictionary = { [key: string]: SchedulerEvent };

export default class UserWrapper {
    static readonly mentionRegex: RegExp = /<@\d+>/;
    
    private _user: User;
    private _timezone: NullableString;
    private _organizingEvents: SchedulerEventDictionary;
    private _attendingEvents: SchedulerEventDictionary;

    public get user(): User { return this._user; };
    public get id(): string { return this._user.id; };
    public get timezone(): NullableString { return this._timezone; };
    public get events(): Readonly<SchedulerEventDictionary> { return {...this._attendingEvents, ...this._organizingEvents} };
    public get organizingEvents(): Readonly<SchedulerEventDictionary> { return this._organizingEvents; };
    public get attendingEvents(): Readonly<SchedulerEventDictionary> { return this._attendingEvents; };

    private set user(value: User) { this._user = value; };
    public set timezone(value: string) {
        if (!moment.tz.names().includes(value)) throw new Error('Invalid timezone.');
        this._timezone = value;
    };

    constructor(user: User) {
        this._user = user;
        this._timezone = null;
        this._organizingEvents = {};
        this._attendingEvents = {};
    };

    toMention(): string {
        return '<@' + this.user.id + '>';
    };

    getEventFromName(eventName: string): SchedulerEvent | null {
        let earliestEvent: SchedulerEvent | null = null;
        
        const eventsArray = Object.values(this.events);
        eventsArray.forEach((event: SchedulerEvent) => {
            if (event.name !== eventName) return;

            if (!earliestEvent) earliestEvent = event;
            else if (event.created.isBefore(earliestEvent.created)) earliestEvent = event;
        });

        return earliestEvent;
    };
    getLatestEvent(): SchedulerEvent | null {
        let latestEvent: SchedulerEvent | null = null;
        
        const eventsArray = Object.values(this.events);
        eventsArray.forEach((event: SchedulerEvent) => {
            if (!latestEvent) latestEvent = event;
            else if (event.created.isAfter(latestEvent.created)) latestEvent = event;
        });

        return latestEvent;
    }
    addOrganizingEvent(event: SchedulerEvent): void {
        this._organizingEvents[event.id] = event;
    };
    removeOrganizingEvent(event: SchedulerEvent): void {
        delete this._organizingEvents[event.id];
    };
    addAttendingEvent(event: SchedulerEvent): void {
        this._attendingEvents[event.id] = event;
    };
    removeAttendingEvent(event: SchedulerEvent): void {
        delete this._attendingEvents[event.id];
    };
}