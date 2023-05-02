import axios from 'axios'
import fluentFfmpeg  from 'fluent-ffmpeg'
import installer from '@ffmpeg-installer/ffmpeg'
import { createWriteStream } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { removeFile } from './utils.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

class OggConverter {
    constructor () {
        fluentFfmpeg.setFfmpegPath(installer.path)
    }
    toMp3 (input, output) {
        try {
            const outputPath = resolve(dirname(input), `${output}.mp3`)
            return new Promise ((res, rej) => {
                fluentFfmpeg(input)
                    .inputOption('-t 30')
                    .output(outputPath)
                    .on('end', () => {
                        removeFile(input)
                        res(outputPath)
                    })
                    .on('error', (e) => rej(e.message))
                    .run()
            })
        } catch (e) {
            console.error('>>> GOVNA IS HERE ', e.message)
        }
    }

    async create (url, fileName) {
        try {
            const oggPath = resolve(__dirname, '../voices', `${fileName}.ogg`)
            const response = await axios({
                method: 'get',
                responseType: 'stream',
                url
            })
            return new Promise(res => {
                const stream = createWriteStream(oggPath)
                response.data.pipe(stream)
                stream.on('finish', () => res(oggPath))
            })
        } catch (e) {
            console.error('>>> in file fetching ', e.message)
        }
    }
}

export const ogg = new OggConverter()