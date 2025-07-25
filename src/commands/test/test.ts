import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, Message, SlashCommandBuilder, SlashCommandUserOption, User } from "discord.js";

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
        .addUserOption((option)=>option.setName('item').setDescription('The item you wish to get')
            .setRequired(true)),
	async execute(interaction: ChatInputCommandInteraction | Message, profileData: any, inputs: {[key: string]: any}) {

        let item : User = inputs ? inputs["item"] : (interaction as ChatInputCommandInteraction).options.getUser('item', true)

		interaction.reply(`${item}`);
	},
};