import config from "config"
import { createReadStream } from 'fs'
import { Configuration, OpenAIApi } from 'openai'


class OpenAI {
    constructor (apiKey) {
        const configuration = new Configuration({
            apiKey
        })
        this.openai = new OpenAIApi(configuration)
    }

    roles = {
        ASSISTANT: 'assistant',
        USER: 'user',
        SYSTEM: 'system'
    }
    async chat (messages) {
        try {
            const response = await this.openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages
            })
            return response.data.choices[0].message
        } catch (e) {
            console.log(e.message)
        }
    }
    async transcription (filePath) {
        try {
            const response = await this.openai.createTranscription(
                createReadStream(filePath),
                'whisper-1'
            )
            return response.data.text
        } catch (e) {
            console.log('>>> in transcription ', e.message)
        }
        
    }
}

export const openAI = new OpenAI(config.get('OPENAI_KEY')) 