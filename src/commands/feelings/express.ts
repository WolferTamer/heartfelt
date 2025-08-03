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

import { AttachmentBuilder, ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, Message, MessageFlags, SlashCommandBuilder, SlashCommandUserOption, User } from "discord.js";

module.exports = {
    embed: new EmbedBuilder()
        .setTitle('express')
        .setDescription('Express/explain how you feel to another user.')
        .setFields([{name:'[User]',value:'The user you want to express yourself to.'},
            {name:'[Feeling]',value:'How you\'re feeling about that user.'},
            {name:'{message}',value:'A message to go along with that feeling.'}
        ]),
    data: new SlashCommandBuilder()
        .setName('express')
        .setDescription('Express the emotions you\'re feeling towards someone.')
        .addUserOption((option)=>option.setName('user').setDescription('The user you want to express yourself to')
            .setRequired(true))
        .addStringOption((option)=> option.setChoices(
                {name:'Mad',value:'mad'},
                {name:'Annoyed',value:'annoyed'},
                {name:'Love',value:'love'},
                {name:'Joyful',value:'joyful'},
                {name:'Sad',value:'sad'},
                {name:'Sympathy',value:'sympathy'},
                {name:'Pride',value:'pride'}
            ).setName('feeling').setDescription('How you\re feeling towards your connection.').setRequired(true))
        .addStringOption((option) => option.setName('message')
            .setDescription('The mesage or reasoning you have for your feelings.').setRequired(false)),
    async execute(interaction: ChatInputCommandInteraction | Message, profileData: any, inputs: {[key: string]: any}) {

        let user : User = inputs ? inputs["user"] : (interaction as ChatInputCommandInteraction).options.getUser('user', true)
        let author : User = interaction instanceof Message ? interaction.author : interaction.user
        let feeling : string = inputs ? inputs["feeling"] : (interaction as ChatInputCommandInteraction).options.getString('feeling', true)
        let message : string | null = inputs ? inputs["message"] : (interaction as ChatInputCommandInteraction).options.getString('message', false)

        let matches = false
        let index = 0
        for (let i = 0; i < profileData.connections.length; i++) {
            if(profileData.connections[i].connectionid === user.id) {
                matches = true
                index = i
            }
        }
        if(!matches) {
            if (interaction instanceof ChatInputCommandInteraction) {
                interaction.reply({content:"It doesn't seem like you have a connection with that user", flags: MessageFlags.Ephemeral})
            } else {
                interaction.reply({content:"It doesn't seem like you have a connection with that user"})
            }
            return
        }

        try {
            profileData.connections[index].mood = feeling
            profileData.connections[index].note = message
            profileData.save()
        } catch (e) {
            interaction.reply("There was an error")
            return
        }

        let pathname = `./public/images/heartfelt_${feeling}.png`
        let filename = `${feeling}.png`
        
        const fileAttachment = new AttachmentBuilder(pathname, { name: filename });

        let embed = new EmbedBuilder()
            .setAuthor({name:author.displayName,iconURL:author.displayAvatarURL()})
            .setColor(0x0000ff)
            .setDescription(message)
            .setTitle(`${author.displayName} is feeling ${feeling} towards you`)
            .setTimestamp(Date.now())
            .setImage(`attachment://${filename}`)

        interaction.reply({embeds:[embed],content:"Your expression as been updated to:",files:[fileAttachment]});
    },
};