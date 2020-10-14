const { exec } = require("child_process");  //shell commands
const fs = require('fs')    //module fs, pour le chargement de fichiers
const Discord = require('discord.js')
const {prefix, token} = require('./config.json')    //importe fichier le configuration du bot
const { name } = require('./commands/help')
const client = new Discord.Client()
client.commands = new Discord.Collection()
const cooldowns = new Discord.Collection();

//importe les commandes, depuis chaque fichiers js
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command)
}

//connexion à Discord
client.once('ready', () => {
    console.log(`connecté en tant que ${client.user.tag}`)
})

//event reception de message
client.on('message', message => {
    
    if (!message.content.startsWith(prefix) || message.author.bot) return;  //ne fais rien si le message viens du bot lui-même

    const args = message.content.slice(prefix.length).trim().split(' ');    //separe chaque mots, tel des arguments
    const commandName = args.shift().toLowerCase(); //recupere la commande depuis l'args[0], et le retire des args

    const command = client.commands.get(commandName)    //recupere la commande via son nom ou son alias
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return message.channel.send('je n\'ai pas reconnu ta commande.\nliste complete `$help`');
    //retourne commande inconnue si la commande n'est pas dans la liste des commandes, ni en alias
    if (command.args && !args.length) { //si la commande demande des arguments, et qu'aucun n'est fourni,
        return message.channel.send(`\`${command.name}\` demande des arguments, ${message.author} ! \nsyntaxe: \`${command.usage}\``);
    }
    if (!command.inGuild && message.channel.type === 'text') {  //si la commande est demandée en guild, mais non autorisée en guild
        return message.channel.send(':warning: Je ne peux pas faire ça ici ! \nallons dans un coin plus tranquille... :smirk:')
    }
    if (!command.inDMs && message.channel.type === 'dm') {
        return message.channel.send(':warning: Je ne peux pas faire ça personnellement ! \nallons sur un serveur :globe_with_meridians:')
    }
    //gestion cooldown
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 1) * 1000;  //1sec, cooldown par defaut, pour tout
    
    if (timestamps.has(message.author.id)) {
    	const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`attend encore ${timeLeft.toFixed(1)}s avant de refaire \`${command.name}\``);
    }   }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    
    //execution de la commande
    try {
        command.execute(message, args);
    } catch (error) {
        console.log(error)
        message.reply(`je n\'ai pas pu executer la commande :frowning: \n erreur: ||\`${error}\`||`)
    }
})
//lancement, connexion du bot avec son token
client.login(token)
