import { ApplicationCommandOptionType, Events, Message, SlashCommandBuilder, User } from "discord.js";

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message: Message) {
        if(!message.inGuild()) return;
        if(message.content.startsWith('>')) {
            const params = message.content.match(/[^\s"']+|"([^"]*)"/g)
            console.log(params)
            if (params == null) {
                return
            }
            const commandName = params[0].substring(1)
            const command = message.client.commands.get(commandName);
            if (!command) {
                return;
            }
            const slashCommand : SlashCommandBuilder = command.data
            if(!slashCommand) {
                return
            }

            const options = slashCommand.options
            const inputs: {
                [key: string]: any,
                } = {}
            let i = 1
            for(let opt of options) {
                if(!params[i]) {
                    message.reply("Parameters unusable")
                    return;
                }

                switch(opt.toJSON().type) {
                    case ApplicationCommandOptionType.Integer: inputs[opt.toJSON().name] = parseInt(params[i]); break;
                    case ApplicationCommandOptionType.Boolean: inputs[opt.toJSON().name] = params[i] === "true"; break;
                    case ApplicationCommandOptionType.Number: inputs[opt.toJSON().name] = Number(params[i]); break;
                    case ApplicationCommandOptionType.User: inputs[opt.toJSON().name] = message.mentions.members.find((val,key)=> `<@${val.id}>` === params[i]); break;
                    case ApplicationCommandOptionType.String: inputs[opt.toJSON().name] = params[i]; break;
                }
                if(opt.toJSON().required && !inputs[opt.toJSON().name]) {
                    message.reply("Parameters unusable")
                    return;
                }
                i++
                
            }

            command.execute(message,null,inputs)

        }
    }

}