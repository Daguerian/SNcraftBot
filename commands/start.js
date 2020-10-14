const Discord = require('discord.js');  //importation necessaire à l'embed seulement
const { exec } = require("child_process")
const {screenName, serverIP, serverPort} = require('../config.json')
const Query = require("minecraft-query")


module.exports = {
    name: 'start',    //nom de la commande, en accord avec son nom de fichier
    description: 'Lance le serveur',
    usage: '$start',      //syntaxe, affichée si la commande est saisie mais incorrecte et dans l'help
    inGuild: true,  //utilisable en guild
    execute(message, args) {
        function startServer(dateHeure) {
            exec(`screen -dmS ${screenName} && screen -S ${screenName} -X stuff "cd /home/sncraft/sncraft/ && ./start.sh\r"`, (error, stdout, stderr) => {
                if (error) {
                    console.log(`[${dateHeure}] erreur: ${error}`);
                    message.channel.send('erreur: '+error)
                    return;
                }
                if (stderr) {
                    console.log(`[${dateHeure}] stderr: ${stderr}`);
                    message.channel.send('std error: '+stderr)
                    return;
                }
                exec(`screen -ls |grep -q "${screenName}"`, (error, stdout, stderr) => {
                if (error) {    //si le screen n'existe deja plus, il n'as pas pu lancer le serveur
                        console.log(`[${dateHeure}] erreur lancement du serveur \n${error}`)
                        message.channel.send(`Impossible de lancer le serveur. \nerreur lors de la verification de lancement \n||${error}||`)
                        return
                    }
                    if (stderr) {
                        console.log(`[${dateHeure}] stderr: ${stderr}`);
                        return;
                    }
                    console.log(`[${dateHeure}] Lancement du serveur`)  //pas d'erreur, "lancement du serveur..."
                    message.channel.send('lancement du serveur \nil prend généralement 40sec')

                    const q = new Query({host: serverIP, port: serverPort, timeout: 2000});
                    setTimeout(checkLoopLatence, 40000)
                    function checkLoopLatence() {
                        var checkLoop = setInterval(function() {
                            q.basicStat()
                            .then((success) => {
                                message.channel.send('serveur ouvert  👍')
                                clearInterval(checkLoop)
                            })
                            .then((failed) => {
                                console.log('failed')
                            })
                        },2000)
                    }
                    
                })
            })
        }
        
        var date = new Date()
        var dateHeure = `${date.getDay()}/${date.getMonth()} - ${date.getHours()}:${date.getMinutes()}`
        
        exec(`screen -ls |grep -q "${screenName}"`, (error, stdout, stderr) => {    //verifie si le screen existe
            if (error) {    //erreur, donc screen innexistant, donc lance le screen du serveur
                return startServer(dateHeure);
            }
            if (stderr) {
                return console.log('std error: '+stderr);
            }
            exec(`exec screen -dmDR ${screenName} -X stuff 'exit\r'`, (error, stdout, stderr) => {
                if (error) console.log(error);
                if (stderr) console.log(stderr);
                exec(`screen -ls |grep -q "${screenName}"`, (error, stdout, stderr) => {
                    if (error) return startServer(dateHeure);
                    if (stderr) return console.log(stderr)
                    message.channel.send('le serveur est deja lancé !')
                })
            })
        });
    }
};


