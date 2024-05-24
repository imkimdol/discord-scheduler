import { v1 as uuid } from 'uuid';
import SuggestedTime from './suggestedTime';
import { Message } from 'discord.js';
import UserWrapper from './userWrapper';
import { Moment } from 'moment-timezone';
 
type NullableMoment = Moment | null;
type NullableMessage = Message | null;

export default class SchedulerEvent {
    private _id: string;
    private _name: string;
    private _organizer: UserWrapper;
    private _attendees: UserWrapper[];
    private _suggestedTimes: SuggestedTime[];
    private _chosenTime: NullableMoment;

    public message: NullableMessage;

    public get id(): string { return this._id; };
    public get name(): string { return this._name; };
    public get organizer(): UserWrapper { return this._organizer; };
    public get attendees(): ReadonlyArray<UserWrapper> { return this._attendees; };
    public get suggestedTimes(): ReadonlyArray<SuggestedTime> { return this._suggestedTimes; };
    public get chosenTime(): NullableMoment { return this._chosenTime; };

    private set id(value: string) { this._id = value; };
    private set name(value: string) { this._name = value; };
    private set organizer(value: UserWrapper) { this._organizer = value; };
    private set attendees(value: UserWrapper[]) { this._attendees = value; };
    private set suggestedTimes(value: SuggestedTime[]) { this._suggestedTimes = value; };
    private set chosenTime(value: Moment) { this._chosenTime = value; };

    constructor(name: string, organizer: UserWrapper, attendees: UserWrapper[]) {
        this._id = uuid();
        this._name = name;
        this._organizer = organizer;
        this._attendees = attendees;
        this._suggestedTimes = [];
        this._chosenTime = null;
        
        this.message = null;
    };
};