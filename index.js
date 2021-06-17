const { Client, Intents } = require('discord.js');
const { Api, Webhook } = require('@top-gg/sdk')
const express = require('express')
const config = require('./config')
const client = new Client({ intents: Intents.NON_PRIVILEGED });

const app = express()
const dblApi = new Api(config.token);
const dblWebhook = new Webhook(config.protection)
app.post('/dblwebhook', dblWebhook.listener(vote => {
	console.log(vote.user)
	client.guilds.cache.get(config.server_votes).channels.cache.get(config.channel_votes).send(`User <@${vote.user}> just voted for the bot. Thanks :heart:`)
}))

const postStats = function () {
	dblApi.postStats({
		serverCount: client.guilds.cache.size,
		shardCount: client.options.shardCount
	})
}
client.on('ready', () => {
	setInterval(() => postStats(), 1800000)
})

client.on('message', async msg => {
	if (!msg.content.startsWith(config.prefix)) return;
	const args = message.content.slice(config.prefix.length).split(/ +/)?.trim();
	const cmd = args.shift().toLowerCase();
	switch (cmd) {
		case 'info-bot':
			try {
				if (!args[0]) return message.reply('Please provided id of bot')
				const bot = await dblApi.getBot(args[0])
				if (bot) message.reply(`The bot is ${bot.username}#${bot.discriminator}. 
				The tags are : ${bot.tags.join(', ')}.
				The owner is : <@${bot.owners[0]}> 
				Points this month : ${bot.monthlyPoints}
				Prefix : ${bot.prefix}
				Description : ${bot.shortdesc}`)
			} catch {
				message.reply('An error occurred. Please verify id and try again')
			}
			break;
		case 'weekend':
			let isWeekend = await dblApi.isWeekend()
			if (isWeekend) isWeekend = 'We are in weekend. Votes double count.'
			else isWeekend = 'We are not in weekend. Votes count for one point.'
			message.reply(isWeekend)
	}
})

app.listen(config.port)
client.login(config.bot_token)