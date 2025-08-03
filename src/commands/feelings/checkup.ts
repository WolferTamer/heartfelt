import { AttachmentBuilder, ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, Message, MessageFlags, SlashCommandBuilder, SlashCommandUserOption, User } from "discord.js";
import { UserModel } from "../../utils/schema";

module.exports = {
    embed: new EmbedBuilder()
        .setTitle('checkup')
        .setDescription('Check up on one of your connections.')
        .setFields([{name:'[User]',value:'The user you want to check up on.'}
        ]),
    data: new SlashCommandBuilder()
        .setName('checkup')
        .setDescription('Check how someone is feeling towards you')
        .addUserOption((option)=>option.setName('user').setDescription('The user you want to express yourself to')
            .setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction | Message, profileData: any, inputs: {[key: string]: any}) {

        let user : User = inputs ? inputs["user"] : (interaction as ChatInputCommandInteraction).options.getUser('user', true)
        let author : User = interaction instanceof Message ? interaction.author : interaction.user

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

        let targetProfile
        try {
            targetProfile = await UserModel.findOne({userid:user.id})
            if(!targetProfile) {
                interaction.reply("Error, we cannot find that user.")
                return
            }
        } catch (e) {
            interaction.reply("There was an error")
            return
        }

        let expressInfo = targetProfile.connections.find(v => v.connectionid === author.id)
        if(!expressInfo) {
            interaction.reply("Connection not found.")
            return
        }
        let message = expressInfo.note
        let feeling = expressInfo.mood
        
        let pathname = `./public/images/heartfelt_${feeling}.png`
        let filename = `${feeling}.png`
                
        const fileAttachment = new AttachmentBuilder(pathname, { name: filename });

        let embed = new EmbedBuilder()
            .setAuthor({name:user.displayName,iconURL:user.displayAvatarURL()})
            .setColor(0x0000ff)
            .setDescription(message)
            .setTitle(`${user.displayName} is feeling ${feeling} towards you`)
            .setTimestamp(Date.now())
            .setImage(`attachment://${filename}`)

        interaction.reply({embeds:[embed],files:[fileAttachment]});
    },
};