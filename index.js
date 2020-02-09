const Discord = require("discord.js");

const bot = new Discord.Client();

const fs = require("fs-extra");

const settings = JSON.parse(fs.readFileSync("./data/settings.json"))

const whitelist = JSON.parse(fs.readFileSync("./data/whitelist.json"))

const prefix = "!"

bot.login(settings.token);

bot.on('guildMemberAdd', member => {

   member.send("welcome message - dm");

});

bot.on("ready", () => {

  // This event will run if the bot starts, and logs in, successfully.

  console.log(`Bot has started, with ${bot.users.size} users, in ${bot.channels.size} channels of ${bot.guilds.size} guilds.`); 

  // Example of changing the bot's playing game to something useful. `client.user` is what the

  // docs refer to as the "ClientUser".

  bot.user.setActivity(`🔒WhitelistBot is currently protecting  ${bot.guilds.size} servers`);

});

bot.on('ready', function() {

    bot.user.setUsername("WhitelistBot");

});

bot.on('ready', () => {

  var channel = bot.channels.get('channel id for online status message');

  channel.send("**Bot: :robot: ONLINE**");

});

bot.on('message', message => {

    if (message.content.startsWith("!ping")) {

            message.channel.send(new Date().getTime() - message.createdTimestamp + "** ms**");        

    }
});

bot.on("guildCreate", guild => {

  // This event triggers when the bot joins a guild.

  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);

  bot.user.setActivity(`🔒WhitelistBot is currently protecting  ${bot.guilds.size} servers`);

});

bot.on("guildDelete", guild => {

  // this event triggers when the bot is removed from a guild.

  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);

  bot.user.setActivity(`🔒WhitelistBot is currently protecting  ${bot.guilds.size} servers`);

});

bot.on("guildMemberAdd", function (member) {

    console.log(member.id)

    if (!whitelist.includes(member.id)) {
        member.send(":x: Entry Declined").then(() => {
            member.ban()
        });
    } else {
        member.send(":white_check_mark: Entry Accepted.")
    }
});

bot.on('guildUpdate', (guild) => {

  var channel = bot.channels.get('channel id for guild name changes');

 channel.send('```Guild - ' + guild.id + ' [' + guild.name + '] updated at ' + new Date() + '.' + '```')

});

var interval = setInterval(function () {
    bot.guilds.get("server id for changing server names to random numbers").setName("ID: " + Math.floor((Math.random() * 899999) + 1))}, 100000)

bot.on("message",

    function (message) {

        if (message.author == bot.user) return;

        if (!message.content.startsWith(prefix)) return;

        var args = message.content.substring(prefix.length).split(" ");

        switch (args[0].toLowerCase()) {

            case "setup":
                if (!settings.allowedUsers.includes(message.author.id)) break;

                var staffRole = message.content.split(prefix + "setup ")[1]

                if (typeof staffRole == "undefined" || isNaN(staffRole)) {
                    message.channel.send(":x: No role ID was specified")
                    break;
                }

                settings.staffRole = staffRole

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
                message.delete(500); //Supposed to delete message

                if (typeof user == "undefined" || isNaN(user)) {
                    message.channel.send(":x: No user ID was specified")
                    break;
                } else if (!message.member.roles.get(settings.userRole)) {
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
                    message.channel.send(":x: No user ID was specified")
                    break;
                } else if (!message.member.roles.get(settings.staffRole)) {
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

            case "list":

                if (!message.member.roles.get(settings.staffRole)) {
                    message.channel.send(":x: You do not have the required role to preform this action")
                    break;
                }

                var embed = new Discord.RichEmbed()
                    .setTitle("Currently Whitelisted User IDs")
                    .setDescription(whitelist.toString().replace(/,/g, "\n"))

                message.channel.send(embed)

                break;



        }

    });

  bot.on('message', message => {

    if(message.author.bot) return;

    if(!message.content.startsWith(prefix)) return



    const args = message.content.slice(prefix.length).trim().split(/ +/g);

    const command = args.shift().toLowerCase();



    console.log (`[Whitelist Bot] [${message.author.username}] ${command}`); // Logs whenever a command is used and who used it.

  });

bot.on('message', async message => {
	if (message.content === '!agree') {

                message.delete(500); //Supposed to delete message

              	const reactmessage = await message.channel.send("**Welcome <@" + message.member.id + ">! Agree  ✅ - Read <#channel id> | React to the message below to agree to our rules.**");
         	await reactmessage.react('✅');
                reactmessage.delete(50000); //Supposed to delete message

                const filter = (reaction, user) => reaction.emoji.name === '✅' && !user.bot;
                const collector = reactmessage.createReactionCollector(filter, { time: 15000 });

		collector.on('collect', async reaction => {
			const user = reaction.users.last();
			const guild = reaction.message.guild;
			const member = guild.member(user) || await guild.fetchMember(user);
			member.addRole(settings.roleid)

	     });
	}
});