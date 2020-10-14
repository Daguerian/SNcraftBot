const Discord = require('discord.js');  //importation necessaire à l'embed seulement
const { exec } = require("child_process")
const {screenName, serverIP, serverPort} = require('../config.json');
const { setTimeout } = require('timers');

module.exports = {
    name: 'stop',    //nom de la commande, en accord avec son nom de fichier
    description: 'stoppe le serveur',
    usage: '§stop',      //syntaxe, affichée si la commande est saisie mais incorrecte et dans l'help
    inGuild: true,  //utilisable en guild
    execute(message, args) {    //execution de la commande, ici une template embed

        function dateHeure() {  //fonction qui recupere la date et l'heure, pour les console.log()
            var date = new Date()
            return `${date.getDay()}/${date.getMonth()} - ${date.getHours()}:${date.getMinutes()}`
        }
        
        exec(`screen -ls |grep -q "${screenName}"`, (error, stdout, stderr) => {    //verifie si le screen existe
            if (error) {    //si le serveur n'existe pas
                message.channel.send('le serveur n\'est pas lancé');
                return;
            }
            if (stderr) {
                console.log(`[${dateHeure()}] stderr: ${stderr}`);
                return;
            }
            exec(`screen -S ${screenName} -X stuff 'stop\r'`, (error, stdout, stderr) => {
                if (error) {
                    console.log(`[${dateHeure()}] erreur arret du serveur \n${error}`);
                    message.channel.send(`erreur lors de l\'arret du serveur. \nerreur: ||${error}||`)
                    return;
                }
                if (stderr) {
                    console.log(`[${dateHeure()}] stderr: ${stderr}`);
                    return;
                }
                console.log(`[${dateHeure()}] Commande arret serveur`)
                message.channel.send('commande d\'arret envoyée')

                setTimeout(checkStopLoop, 2000)   //lance "checkStopLoop" au bout de 3min10
                function checkStopLoop() {
                    var checkStop = setInterval(function() {    //variable, boucle à intervalle qui execute une fonction
                        exec(`screen -ls |grep -q "${screenName}"`, (error, stdout, stderr) => {    //verifie si le screen existe
                            if (error) {    //le screen existe plus, donc le serveur est fermé
                                message.channel.send('serveur arreté 👍')
                                console.log(`[${dateHeure()}] Serveur fermé`)
                                return clearInterval(checkStop) //on stoppe la boucle (via sa variable)
                            };
                            if (stderr) console.log(stderr);
                            // console.log(`[${dateHeure()}re-tentative de fermeture...`)
                            exec(`screen -dmDR ${screenName} -X stuff 'exit\r'`, (error, stdout, stderr) => {   //envoi un 'exit\r' au sreen, pour le fermer
                                if (error) console.log(error);                                                  //il se fermera si le serveur n'est plus lancé
                                if (stderr) console.log(stderr);
                            })
                        })
                    }, 5000)//intervalle de 5sec
                }
                
            })
        });
    }
};
