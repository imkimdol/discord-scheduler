import { User } from "discord.js";

export default class ExtendedUser {
    static readonly mentionRegex: RegExp = /<@\d+>/;

    private _user: User;

    public get user(): User { return this._user; };
    public get id(): string { return this._user.id; };

    private set user(value: User) { this._user = value; };

    constructor(user: User) {
        this._user = user;
    }

    toMention(): string {
        return '<@' + this.user.id + '>';
    };
}