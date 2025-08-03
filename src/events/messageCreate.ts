import { ApplicationCommandOptionType, Events, Message, SlashCommandBuilder, APIApplicationCommandOptionWithAutocompleteOrChoicesWrapper, APIApplicationCommandStringOption, APIApplicationCommandOptionChoice } from "discord.js";
import {UserModel} from "../utils/schema";

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message: Message) {
        if(!message.inGuild()) return;
        if(message.content.startsWith('>')) {
            console.log(message.author.id)
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
                    if(!opt.toJSON().required) {
                        break;
                    }
                    message.reply("Parameters unusable")
                    return;
                }
                params[i] = params[i].replaceAll('"','')                
                let choiceoption = (opt.toJSON() as APIApplicationCommandOptionWithAutocompleteOrChoicesWrapper<APIApplicationCommandStringOption,APIApplicationCommandOptionChoice>)

                let matched = false
                if(choiceoption.choices) {
                    for (let choice of choiceoption.choices) {
                        if(params[i] === choice.name || params[i] === choice.value) {
                            matched = true;
                            break;
                        }
                    }
                    if(!matched) {
                        message.reply(`${params[i]} does not match an existing choice.`)
                        return;
                    }
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

            let profileData
            try{
                profileData = await UserModel.findOne({userid:message.author.id});
                if(!profileData) {
                    let profile = await UserModel.create({
                        userid: message.author.id
                    });
                    profile.save();
                    profileData = await UserModel.findOne({userid:message.author.id});
                }
            } catch (e) {
                console.log(e)
            }

            command.execute(message,profileData,inputs)

        }
    }

}