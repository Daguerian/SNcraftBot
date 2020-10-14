const Discord = require('discord.js');  //importation necessaire à l'embed seulement
const { exec } = require("child_process")   //commandes shell
const {screenName, serverQueryPort, serverIP} = require('../config.json')  //recuperation nom du screen
const os = require('os')    //infos cpu, memoire, ect
const Query = require("minecraft-query")

module.exports = {
    name: 'infos',    //nom de la commande, en accord avec son nom de fichier
    aliases: ['info'],   //alias de la commande, pour l'appeler (sur discord$) de plusieurs manieres
    description: 'donne des infos sur le serveur',
    usage: '§infos',      //syntaxe, affichée si la commande est saisie mais incorrecte et dans l'help
    inGuild: true,  //utilisable en guild
    execute(message, args) {    //execution de la commande, ici une template embed
        
        exec(`screen -ls |grep -q "${screenName}"`, (error, stdout, stderr) => {
            if (error) {    //si le serveur existe pas
                const embed = new Discord.MessageEmbed()
                .setColor('#F01E14')    //couleur du liseré
                .setAuthor('SNcraft', message.client.user.displayAvatarURL())    //auteur & image, au dessus du titre
                .setThumbnail("https://api.mcsrvstat.us/icon/sncraft.ddns.net")    //image de vignette, en haut à droite, recupéré avec l'api mcsrvstat
                .setTitle('🔴 Serveur Fermé') //Titre
                .addField('\u200B','\u200B')    //espace vide
                message.channel.send(embed)
            }
            else {  //serveur ouvert
                const q = new Query({host: serverIP, port: serverQueryPort, timeout: 2000});
                    q.fullStat()    //promesse obtention des infos
                    .then((success) => {    //si reussite
                        let stats = success 
                        const embed = new Discord.MessageEmbed()
                        .setColor('#0CF309')    //couleur du liseré
                        .setAuthor('SNcraft', message.client.user.displayAvatarURL())    //auteur & image, au dessus du titre
                        .setTitle('🔵 Serveur ouvert') //Titre
                        .setThumbnail("https://api.mcsrvstat.us/icon/sncraft.ddns.net")    //image de vignette, en haut à droite, recupéré avec l'api mcsrvstat
                        .addFields( //ajout de contenu
                            { name: 'Version', value: stats.version, inline: true },
                            { name: 'Map', value: stats.map, inline: true },
                            { name: 'Joueurs', value: `${stats.online_players}/${stats.max_players}`, inline: true },
                            )
                        if (stats.online_players > 0) embed.addField('en ligne:', stats.players.map(player => `${player}\n`, true))
                        // embed.addFields(
                        //     { name: '\u200B', value: '\u200B'},
                        //     { name: 'CPU', value: 't', inline: true}
                        // )
                        message.channel.send(embed)
                    }, (failed) => {    //si echec
                        return message.channel.send(`erreur lors de l'obtention des données du serveur \n||${failed}||`)
                    }
                    )
            }
        });
    }        
};
