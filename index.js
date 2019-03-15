const Discord = require("discord.js");

const bot = new Discord.Client();

const fs = require("fs");

const settings = JSON.parse(fs.readFileSync("./data/settings.json"))

const whitelist = JSON.parse(fs.readFileSync("./data/whitelist.json"))

const prefix = "!"

bot.login(settings.token);

bot.on("ready", function (ready) {
    bot.user.setPresence({
        game: {
            name: '🔒 Protected By: ' + bot.user.username
        },
        status: 'online'
    })
});

bot.on("guildMemberAdd", function(member) {

    console.log(member.id)

    if (!whitelist.includes(member.id)) {
        member.send(":x: Entry Declined").then(() => {
            member.ban()
        });
    } else {
        member.send(":white_check_mark: Entry Accepted")
    }
});

bot.on("message",

    function (message) {

        if (message.author == bot.user) return;

        if (!message.content.startsWith(prefix)) return;

        var args = message.content.substring(prefix.length).split(" ");

        switch (args[0].toLowerCase()) {

            case "setup":
                if (!settings.allowedUsers.includes(message.author.id)) break;

                var adminRole = message.content.split(prefix + "setup ")[1]

                if (typeof adminRole == "undefined" || isNaN(adminRole)) {
                    message.channel.send(":x: No role ID was specified")
                    break;
                }

                settings.adminRole = adminRole

                console.log(settings)

                fs.writeFileSync("./data/settings.json", JSON.stringify(settings), "utf8")

                message.channel.send(":white_check_mark: Setup success")

                break;

                // case "removerole":
                //     if (!settings.allowedUsers.includes(message.author.id)) break;

                //     var adminRole = message.content.split(prefix + "removerole ")[1]

                //     if (typeof adminRole == "undefined") {
                //         message.channel.send(":x: No role ID was specified")
                //         break;
                //     } else if (!settings.adminRole.find(adminRole)) {
                //         message.channel.send(":x: Role wasn't found")
                //         break;
                //     }

                //     settings.adminRole.splice(adminRole, 1).then(() => {
                //         fs.writeFileSync("./data/settings.json", JSON.parse(settings), "utf8")
                //     })

            case "whitelist":

                var user = message.content.split(prefix + "whitelist ")[1]

                if (typeof user == "undefined" || isNaN(user)) {
                    message.channel.send(":x: No role ID was specified")
                    break;
                } else if (!message.member.roles.get(settings.adminRole)) {
                    message.channel.send(":x: You do not have the required role to preform this action")
                    break;
                }

                if (whitelist.includes(user)) {
                    message.channel.send(":x: User is already in the whitelist")
                    break;
                }

                whitelist.push(user)

                fs.writeFileSync("./data/whitelist.json", JSON.stringify(whitelist), "utf8")

                message.channel.send(":white_check_mark: Whitelist addition success")

                break;

            case "remove":

                var user = message.content.split(prefix + "remove ")[1]

                if (typeof user == "undefined") {
                    message.channel.send(":x: No role ID was specified")
                    break;
                } else if (!message.member.roles.get(settings.adminRole)) {
                    message.channel.send(":x: You do not have the required role to preform this action")
                    break;
                }

                whitelist.splice(whitelist.indexOf(user), 1)

                fs.writeFileSync("./data/whitelist.json", JSON.stringify(whitelist), "utf8")

                message.guild.fetchMember(user).then(member => {
                    member.ban()
                })
                
                message.channel.send(":white_check_mark: User removal success")

                break;

            case "id":

                message.channel.send(message.mentions.roles.first().id)

                break;



        }

    });