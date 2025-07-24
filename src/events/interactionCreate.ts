import { Collection, Events, Interaction } from "discord.js";

module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction: Interaction) {
        if(!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        const {cooldowns} = interaction.client
        if(!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection());
        }


        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const defaultCooldown = 5;
        const cooldownAmount = (command.cooldown ?? defaultCooldown) * 1_000;

        if(timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount
            if(now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime / 1_000)
                return interaction.reply({content: `You can use ${command.data.name} again <t:${expiredTimestamp}:R>.`})
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id),cooldownAmount)
        try {
            //Try running the command. Respond using the return value
            await command.execute(interaction);
            
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    }
}