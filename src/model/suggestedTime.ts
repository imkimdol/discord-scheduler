import { User } from "discord.js";

export default class SuggestedTime {
    private _time: Date;
    private _suggester: User;
    private _votes: User[];

    public get time(): Date { return this._time; };
    public get suggester(): User { return this._suggester; };
    public get votes(): ReadonlyArray<User> { return this._votes; };

    private set time(value: Date) { this._time = value; };
    private set suggester(value: User) { this._suggester = value; };
    private set votes(value: User[]) { this.votes = value; };

    constructor(time: Date, suggester: User, votes: User[]) {
        this._time = time;
        this._suggester = suggester;
        this._votes = votes;
    };
};