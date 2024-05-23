import { Client, ClientOptions, Collection } from 'discord.js';

export default class CommandsClient extends Client {
    public commands: Collection<unknown, unknown>;

    constructor(options: ClientOptions, commands: Collection<unknown, unknown>) {
        super(options);
        this.commands = commands;
    }
};