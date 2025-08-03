import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, Message, SlashCommandBuilder, SlashCommandUserOption, User } from "discord.js";

module.exports = {
    locked: true,
    embed: new EmbedBuilder()
        .setTitle('test')
        .setDescription('Test a specific command')
        .setFields([{name:'[Respond]',value:'What the bot will reply to the message with. Allows for the bot to be used for command testing.'}]),
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('test command!')
        .addStringOption((option)=>option.setName('respond').setDescription('Try executing this command')
            .setRequired(true)),
	async execute(interaction: ChatInputCommandInteraction | Message, profileData: any, inputs: {[key: string]: any}) {

        let item : string = inputs ? inputs["respond"] : (interaction as ChatInputCommandInteraction).options.getString('respond', true)

		interaction.reply({content:item});
	},
};