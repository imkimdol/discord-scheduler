import { User } from "discord.js";
import moment from "moment-timezone";

type NullableString = string | null;

export default class UserWrapper {
    static readonly mentionRegex: RegExp = /<@\d+>/;

    private _user: User;
    private _zone: NullableString;

    public get user(): User { return this._user; };
    public get id(): string { return this._user.id; };
    public get zone(): NullableString { return this._zone; };

    private set user(value: User) { this._user = value; };
    private set zone(value: string) {
        if (moment.tz.names().includes(value)) this._zone = value;
    };

    constructor(user: User) {
        this._user = user;
        this._zone = null;
    }

    toMention(): string {
        return '<@' + this.user.id + '>';
    };
}