import { AutocompleteInteraction, ChannelType, ChatInputCommandInteraction, Collection, Events, GuildChannel, GuildTextBasedChannel, PermissionFlagsBits } from "discord.js"
import { Dorei_Client } from "../../client/client"
import {Event} from "../../client/essentials/event"
import Command from "../../client/essentials/command"
import chalk from "chalk"
import config from "../../config"

export default class CommandHandler extends Event {

    constructor(client: Dorei_Client) {
        super(client, {
            name: Events.InteractionCreate,
            description: "Command Handler event",

        })
    }
    execute(interaction: ChatInputCommandInteraction | AutocompleteInteraction) {
        if (interaction.isChatInputCommand()) {
            //this.client.reloadConfig()
            const command: Command = this.client.commands.get(interaction.commandName)

            if (!command) return interaction.reply({ content: "This command does not exist!", ephemeral: true }) && this.client.commands.delete(interaction.commandName)

            const isNSFW = interaction.channel.type === ChannelType.GuildText && interaction.channel.nsfw
            if(command.nsfw && !isNSFW) return interaction.reply({ content: "This command can only be used in NSFW channels!", ephemeral: true })

            const { cooldowns } = this.client

            if (!cooldowns.has(command.name) ) cooldowns.set(command.name, new Collection())

            
            if(!command?.cooldownFilteredUsers?.includes(interaction.user.id) ) {
                const now = Date.now()
                const timestamps = cooldowns.get(command.name)
                const cooldownAmount = (command.cooldown || 3) * 1000

                if (timestamps.has(interaction.user.id) && (now < (timestamps.get(interaction.user.id) || 0) + cooldownAmount))
                    return interaction.reply({ content: `You are on cooldown for ${((((timestamps.get(interaction.user.id) || 0) + cooldownAmount) - now) / 1000).toFixed(1)} seconds`, ephemeral: true })
    
                timestamps.set(interaction.user.id, now)
                setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount)
            }

            

            
            
            

            try {
                const subCommandGroup = interaction.options.getSubcommandGroup(false)
                const subCommand = `${interaction.commandName}${subCommandGroup ? `.${subCommandGroup}` : ""}.${interaction.options.getSubcommand(false) || ""}`


                //@ts-ignore
                return command?.execute(interaction) || this.client.subcommands.get(subCommand)?.execute(interaction)

            } catch (e) {
                console.error(e)
            }

        } else if (interaction.isAutocomplete()) {
            const command = this.client.commands.get(interaction.commandName);

            if (!command) {
                console.log(chalk.red(`No command matching ${interaction.commandName} was found.`))
                return;
            }

            try {
                command.autoComplete(interaction);
            } catch (error) {
                console.error(error);
            }
        }
    }}