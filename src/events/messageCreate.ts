import { Events, Message } from "discord.js";

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message: Message) {
        if(!message.inGuild()) return;
        if(message.content.startsWith('>')) {
            const params = message.content.match(/(?:[^\\s"']+|"[^"]*"|'[^']*')+/g)
            if (params == null) {
                return
            }
            const commandName = params[0].substring(1)
            const command = message.client.commands.get(commandName);
            if (!command) {
                return;
            }

            console.log(params)
        }
    }

}