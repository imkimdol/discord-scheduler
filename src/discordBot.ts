import dotenv from 'dotenv';
import { Collection, GatewayIntentBits } from 'discord.js';
import CommandsClient from './commandsClient';
import { glob } from 'glob';
import path from 'path';

export default class DiscordBot {
    private client: CommandsClient;

    constructor() {
        dotenv.config();
        this.client = new CommandsClient({ intents: [GatewayIntentBits.Guilds] }, new Collection());

        this.loadCommands();
        this.loadEvents();
        this.logIn();
    }
    
    private loadCommands = () => {
        const commandsPath = path.join(__dirname, '/commands');
        const commandFiles = glob.sync('**/*.js', { cwd: commandsPath });
    
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            // Set a new item in the Collection with the key as the command name and the value as the exported module
            if ('data' in command && 'execute' in command) {
                this.client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
    
    private loadEvents = () => {
        const eventsPath = path.join(__dirname, '/events');
        const eventFiles = glob.sync('**/*.js', { cwd: eventsPath });
        
        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const event = require(filePath);
            if (event.once) {
                this.client.once(event.name, (...args) => event.execute(...args));
            } else {
                this.client.on(event.name, (...args) => event.execute(...args, this.client));
            }
        }
    }
    
    private logIn = () => {
        this.client.login(process.env.DISCORD_TOKEN);
    }
}