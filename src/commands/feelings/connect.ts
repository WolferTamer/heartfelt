//SO HOW WILL THIS WORK

//Starts off with you having to request a connection with someone
//If they accept, you can start doing things

//FEELINGS OPTION:
//express how you're feeling towards someone at that moment. Base emotions are available, custom drawings for each
//Of them. In the future you can use your own pictures. Add a message explaining what made you feel bad.
//They can then find and read the message by doing a /checkup command.
//The idea is that sometimes you have specific feelings about someone, but don't necessarily want to express them
//directly. And by forcing the person to go out of their way to check on you, it doesn't feel like a "gimmie"
//for expressing them.

import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, Message, MessageFlags, SlashCommandBuilder, SlashCommandUserOption, User } from "discord.js";
import { RequestModel } from "../../utils/schema";

module.exports = {
    embed: new EmbedBuilder()
        .setTitle('connect')
        .setDescription('Start a relationship with another user.')
        .setFields([{name:'[User]',value:'The user you want to connect with.'}
        ]),
    data: new SlashCommandBuilder()
        .setName('connect')
        .setDescription('Start a relationship with another user.')
        .addUserOption((option)=>option.setName('user').setDescription('The user you want to connect with')
            .setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction | Message, profileData: any, inputs: {[key: string]: any}) {

        let recipient : User = inputs ? inputs["user"] : (interaction as ChatInputCommandInteraction).options.getUser('user', true)
        let sender : User = interaction instanceof ChatInputCommandInteraction ? interaction.user : interaction.author

        let request
        try {
            request = await RequestModel.findOne({sender:sender.id,recipient:recipient.id})
            if(!request) {
                let tempRequest = await RequestModel.create({sender:sender.id,recipient:recipient.id})
                tempRequest.save();
                request = await RequestModel.findOne({sender:sender.id,recipient:recipient.id})
            } else if (interaction instanceof ChatInputCommandInteraction) {
                interaction.reply({content:"You have already sent a connection request to this user.",flags:MessageFlags.Ephemeral})
                return
            } else {
                interaction.reply({content:"You have already sent a connection request to this user."})
                return
            }
        }
        catch (e) {
            if (interaction instanceof ChatInputCommandInteraction) {
                interaction.reply({content:"Unable to send connection request. Please try again later.",flags:MessageFlags.Ephemeral})
            } else {
                interaction.reply({content:"Unable to send connection request. Please try again later."})
            }
            return
        }
        let embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('Connection Request Sent!')
            .setImage(recipient.displayAvatarURL())
            .setDescription(`Request successfully sent to ${recipient.displayName}! They must interact with the bot to see they have a request.`)
        interaction.reply({embeds:[embed]})
    },
};