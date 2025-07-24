import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandUserOption } from "discord.js";

module.exports = {
    embed: new EmbedBuilder()
        .setTitle('giveitem')
        .setDescription('Only admins can use this command to cheat in items to a specific player inventory')
        .setFields([{name:'[Id]',value:'The ID of the item you want to cheat in.'},
            {name:'[Amount]',value:'The amount of items to give.'},
            {name:'{User}',value:'The user you want to give the items to. By default it gives it to the player using the command.'}
        ]),
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('test command!')
        .addStringOption((option)=>option.setName('item').setDescription('The item you wish to get')
            .setRequired(true)),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        
		interaction.reply("hi");
	},
};