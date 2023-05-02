import { Telegraf, session  } from 'telegraf' 
import { message } from 'telegraf/filters' 
import { code } from 'telegraf/format' 
import config from 'config'
import { ogg } from './ogg.js'
import { openAI } from './openAI.js'

console.log(config.get('TEST_ENV'))

const bot = new Telegraf(config.get('TG_TOKEN'))

const INITIAL_SESSION = {
    messages: []
}

bot.use(session())

bot.command('start', async (ctx) => {
    ctx.session = INITIAL_SESSION 
    await context.reply(JSON.stringify(ctx.message, null, 2 ))
})

bot.command('new', async (ctx) => {
    ctx.session = INITIAL_SESSION 
    await ctx.reply('Ask me ')
})

bot.on(message('voice'), async (ctx) => {
    ctx.session ??= INITIAL_SESSION
    try {
        await ctx.reply(code('Loading...'))
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const userId = String(ctx.message.from.id)
        const oggPath = await ogg.create(link.href, userId)
        const mp3Path = await ogg.toMp3(oggPath, userId) 
        const text = await openAI.transcription(mp3Path)
        await ctx.reply(text)
        ctx.session.messages.push({
            role: openAI.roles.USER,
            content: text
        })
        const response = await openAI.chat(ctx.session.messages)
        ctx.session.messages.push({
            role: openAI.roles.ASSISTANT,
            content: response.content 
        })
        await ctx.reply(response.content)
    } catch (e) {
        console.error('>>> in voice message', e.message)
    }
})

bot.on(message('text'), async (ctx) => {
    ctx.session ??= INITIAL_SESSION
    try {
        await ctx.reply(code('Loading...'))
        ctx.session.messages.push({
            role: openAI.roles.USER,
            content: ctx.message.text
        })
        const response = await openAI.chat(ctx.session.messages)
        ctx.session.messages.push({
            role: openAI.roles.ASSISTANT,
            content: response.content 
        })
        await ctx.reply(response.content)
    } catch (e) {
        console.error('>>> in text message', e.message)
    }
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM '))