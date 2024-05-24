import UserWrapper from "./userWrapper";
import { Moment } from "moment-timezone";

export default class SuggestedTime {
    private _time: Moment;
    private _suggester: UserWrapper;
    private _votes: UserWrapper[];

    public get time(): Moment { return this._time; };
    public get suggester(): UserWrapper { return this._suggester; };
    public get votes(): ReadonlyArray<UserWrapper> { return this._votes; };

    private set time(value: Moment) { this._time = value; };
    private set suggester(value: UserWrapper) { this._suggester = value; };
    private set votes(value: UserWrapper[]) { this.votes = value; };

    constructor(time: Moment, suggester: UserWrapper, votes: UserWrapper[]) {
        this._time = time;
        this._suggester = suggester;
        this._votes = votes;
    };
};