const TelegramApi = require('node-telegram-bot-api');
const {gameOptions, againOptions} = require('./options');
const sequelize = require('./db');
const UserModel = require('./models');

const token = '5675726524:AAGkSoGGQZqNnS-lWd0rgSoPxOHuKL7JQQw';

const bot = new TelegramApi(token, {polling: true});

const chats = {}

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Now I guess random number from 0 to 9')
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber
    await bot.sendMessage(chatId, 'Try to guess', gameOptions)
}



const start = async () => {
    
    try {
        await sequelize.authenticate();
        await sequelize.sync()
    } catch (e) {
        console.log('ops, error', e)
    }
    
     await bot.setMyCommands([
        {command: '/start', description: 'hello'} ,
        {command: '/info', description: 'information about user`s stats'},
        {command: '/game', description: 'start game'}
    ])

    bot.on('message', async msg => {
        const text = msg.text
        const chatId = msg.chat.id

        console.log(msg)

        try {
            if( text === '/start') {
                    await UserModel.create(chatId)
                    await bot.sendMessage(chatId, `Hello, ${msg.from.username}`)
                    await bot.sendSticker(chatId, './stickers/AnimatedSticker.tgs')
            }

            if( text === '/info') {
                const user = await UserModel.findOne({chatId})
                await bot.sendMessage(chatId, `You have ${user.right} right answers and ${user.wrong} wrong answers`)
            }

            if( text === '/game') {
                await startGame(chatId)
            }
        } catch (e) {
            console.log(e)
            return bot.sendMessage(chatId, 'ops, something went wrong:(')
        }
    });

    bot.on('callback_query', async msg => {
        const data = msg.data
        const chatId = msg.message.chat.id

        console.log(msg)

        const user = await UserModel.findOne({chatId})

        if (data === '/again') {
            return startGame(chatId)
        }
        if (+data === chats[chatId]) {
            user.right += 1
            await bot.sendMessage(chatId, `You are right. Well done!`, againOptions)
        } else {
            user.wrong += 1
            await bot.sendMessage(chatId, `Try again:( Bot, guess ${chats[chatId]}`, againOptions)
        }
        await user.save()
    })
}

start()