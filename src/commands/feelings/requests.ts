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

import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, CommandInteraction, ComponentType, EmbedBuilder, Message, MessageFlags, SlashCommandBuilder, SlashCommandUserOption, User } from "discord.js";
import { RequestModel, UserModel } from "../../utils/schema";
import { send } from "process";

module.exports = {
    embed: new EmbedBuilder()
        .setTitle('requests')
        .setDescription('View your connection requests.'),
    data: new SlashCommandBuilder()
        .setName('requests')
        .setDescription('View your connection requests.'),
    async execute(interaction: ChatInputCommandInteraction | Message, profileData: any, inputs: {[key: string]: any}) {

        let user : User = interaction instanceof ChatInputCommandInteraction ? interaction.user : interaction.author

        let requests
        try {
            requests = await RequestModel.find({recipient:user.id})
            if(requests.length == 0) {
                if (interaction instanceof ChatInputCommandInteraction) {
                    interaction.reply({content:"No Requests found!",flags:MessageFlags.Ephemeral})
                    return
                } else {
                    interaction.reply({content:"No Requests found!"})
                    return
                }
            } 
        }
        catch (e) {
            if (interaction instanceof ChatInputCommandInteraction) {
                interaction.reply({content:"Unable to find connection requests. Please try again later.",flags:MessageFlags.Ephemeral})
            } else {
                interaction.reply({content:"Unable to find connection requests. Please try again later."})
            }
            return
        }
        let embeds : EmbedBuilder[] = []
        let senders : User[] = []
        for (let r of requests) {
            let sender = await interaction.client.users.fetch(r.sender!)
            senders.push(sender)
            embeds.push(new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('Connection Request Sent!')
            .setImage(sender.displayAvatarURL())
            .setDescription(`${sender.displayName} wants to connect with you! Do you wish to accept?`))
        }
        let index = 0;

        let leftButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setCustomId('left')
            .setLabel('<-')
            .setDisabled(true)

        let rightButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setCustomId('right')
            .setLabel('->')

        let acceptButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setCustomId('acceptconnection')
            .setLabel('Accept!')
        
        let actionRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([leftButton,acceptButton,rightButton])

        let reply = await interaction.reply({embeds:[embeds[index]],components:[actionRow]})

        const collectorFilter = (i:ButtonInteraction) => i.user.id === user.id;

        let collector = reply.createMessageComponentCollector({ componentType: ComponentType.Button, time: 300_000, filter:collectorFilter });
        collector.on('collect', async (i:ButtonInteraction) => {
            if(i.customId === "left") {
                index = Math.min(index+1,embeds.length-1)
                if(index != 0) {
                    leftButton.setDisabled(false)
                } else {
                    leftButton.setDisabled(true)
                }
                if(index != embeds.length-1) {
                    rightButton.setDisabled(false)
                } else {
                    rightButton.setDisabled(true)
                }
                reply.edit({embeds:[embeds[index]],components:[actionRow]})
            } else if (i.customId === "right") {
                index = Math.max(index+1,embeds.length-1)
                if(index != 0) {
                    leftButton.setDisabled(false)
                } else {
                    leftButton.setDisabled(true)
                }
                if(index != embeds.length-1) {
                    rightButton.setDisabled(false)
                } else {
                    rightButton.setDisabled(true)
                }
                reply.edit({embeds:[embeds[index]],components:[actionRow]})
            } else if (i.customId === "acceptconnection") {
                try {
                    let rec = UserModel.updateOne({userid:user.id},{$push: {connections:{connectionid:senders[index].id}}})
                    let send = UserModel.updateOne({userid:senders[index].id}, {$push:{connections: {connectionid:user.id}}})
                    RequestModel.deleteOne({sender:senders[index].id,recipient:user.id})
                    await rec
                    await send
                    i.reply("Accepted connection!")

                } catch (e) {
                    i.reply({content:"Failed to accept connection.",flags:MessageFlags.Ephemeral})
                }
            }
        })

    },
};