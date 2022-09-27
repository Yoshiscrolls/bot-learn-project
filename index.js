const TelegramApi = require('node-telegram-bot-api');
const {gameOptions, againOptions} = require('./options')

const token = '5675726524:AAGkSoGGQZqNnS-lWd0rgSoPxOHuKL7JQQw';

const bot = new TelegramApi(token, {polling: true});

const chats = {}

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Now I guess random number from 0 to 9')
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber
    await bot.sendMessage(chatId, 'Try to guess', gameOptions)
}



const start = () => {
    bot.setMyCommands([
        {command: '/start', description: 'hello'} ,
        {command: '/info', description: 'information about user'},
        {command: '/game', description: 'start game'}
    ])

    bot.on('message', async msg => {
        const text = msg.text
        const chatId = msg.chat.id

        console.log(msg)

        if( text === '/start') {
            await bot.sendMessage(chatId, `Hello, ${msg.from.username}`)
            await bot.sendSticker(chatId, './stickers/AnimatedSticker.tgs')
        }

        if( text === '/info') {
            await bot.sendMessage(chatId, `This chat id is ${msg.chat.id} and this chat is ${msg.chat.type}`)
        }

        if( text === '/game') {
           await startGame(chatId)
        }
    });
    bot.on('callback_query', async msg => {
        const data = msg.data
        const chatId = msg.message.chat.id
        console.log(msg)
        if (data === '/again') {
            return startGame(chatId)
        }
        if (+data === chats[chatId]) {
            return bot.sendMessage(chatId, `You are right. Well done!`, againOptions)
        } else {
            return bot.sendMessage(chatId, `Try again:( Bot, guess ${chats[chatId]}`, againOptions)
        }
    })
}

start()