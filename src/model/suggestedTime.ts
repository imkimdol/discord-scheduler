import ExtendedUser from "./extendedUser";

export default class SuggestedTime {
    private _time: Date;
    private _suggester: ExtendedUser;
    private _votes: ExtendedUser[];

    public get time(): Date { return this._time; };
    public get suggester(): ExtendedUser { return this._suggester; };
    public get votes(): ReadonlyArray<ExtendedUser> { return this._votes; };

    private set time(value: Date) { this._time = value; };
    private set suggester(value: ExtendedUser) { this._suggester = value; };
    private set votes(value: ExtendedUser[]) { this.votes = value; };

    constructor(time: Date, suggester: ExtendedUser, votes: ExtendedUser[]) {
        this._time = time;
        this._suggester = suggester;
        this._votes = votes;
    };
};