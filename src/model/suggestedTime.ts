import UserWrapper from "./userWrapper";
import { Moment } from "moment-timezone";

type VotesDictionary = { [key: string]: UserWrapper };

export default class SuggestedTime {
    private _time: Moment;
    private _suggester: UserWrapper;
    private _votes: VotesDictionary;

    public get time(): Moment { return this._time; };
    public get suggester(): UserWrapper { return this._suggester; };
    public get votes(): Readonly<VotesDictionary> { return this._votes; };

    private set time(value: Moment) { this._time = value; };
    private set suggester(value: UserWrapper) { this._suggester = value; };
    private set votes(value: VotesDictionary) { this.votes = value; };

    constructor(time: Moment, suggester: UserWrapper) {
        this._time = time;
        this._suggester = suggester;
        this._votes = {};

        this._votes[suggester.id] = suggester;
    };

    addVote(vote: UserWrapper): void {
        this._votes[vote.id] = vote;
    };
    removeVote(vote: UserWrapper): void {
        delete this._votes[vote.id];
    };
};