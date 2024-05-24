import { User } from "discord.js";
import moment from "moment-timezone";

type NullableString = string | null;

export default class UserWrapper {
    static readonly mentionRegex: RegExp = /<@\d+>/;

    private _user: User;
    private _timezone: NullableString;

    public get user(): User { return this._user; };
    public get id(): string { return this._user.id; };
    public get timezone(): NullableString { return this._timezone; };

    private set user(value: User) { this._user = value; };
    public set timezone(value: string) {
        if (moment.tz.names().includes(value)) this._timezone = value;
    };

    constructor(user: User) {
        this._user = user;
        this._timezone = null;
    }

    toMention(): string {
        return '<@' + this.user.id + '>';
    };
}