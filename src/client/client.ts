import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import "dotenv/config"
import Command from "./essentials/command";
import SubCommand from "./essentials/subCommand"
import { CommandHandler } from "./handlers/commandHandler";
import { EventHandler } from "./handlers/eventHandler";


export class Dorei_Client extends Client implements IDorei_Client {
    public dev: boolean
    public commands: Collection<string, Command> 
    public subCommands: Collection<string, SubCommand>
    public cooldowns: Collection<string, Collection<string, number>>
    public commandHandler: CommandHandler
    public eventHandler: EventHandler

    constructor() {
        super({
            intents:
                [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.GuildMembers,
                    GatewayIntentBits.GuildMessages,
                    GatewayIntentBits.GuildVoiceStates,
                    GatewayIntentBits.MessageContent,
                    GatewayIntentBits.DirectMessages,
                    GatewayIntentBits.DirectMessageTyping,
                    GatewayIntentBits.GuildPresences
                ],
            partials:
                [
                    Partials.Channel,
                    Partials.Message,
                    Partials.GuildMember
                ],

            allowedMentions: {
                    parse: ['users', 'roles', "everyone"],
                    repliedUser: true
                }
            }
        )

        this.dev = (process.argv.slice(2).includes("--dev"))
        this.commands = new Collection()
        this.subCommands = new Collection()
        this.cooldowns = new Collection()
        this.commandHandler = new CommandHandler(this)
        this.eventHandler = new EventHandler(this)
        this.commandHandler.LoadCommands()
        this.eventHandler.LoadEvents()
        
    }    
    

    public login() {
        return super.login(this.dev ? process.env.dev_bot_token : process.env.bot_token)
    }
}



export interface IDorei_Client {
    dev: boolean
}