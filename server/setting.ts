import * as path from 'path'
import * as fs from 'fs'

interface ProjectSetting {
    name: string
    projectPath: string
    selected: boolean
    tags: Array<string>
    languages: Array<string>
    lang: string
}

let setting: Array<ProjectSetting> = [{
    name: "Lyrieek-git",
    projectPath: path.resolve(__dirname, '../'),
    selected: true,
    tags: [],
    languages: ["vue"],
    lang: "zh_CN"
}]

const customPath = path.resolve(__dirname, '../customSetting/index.json')
const existsCustomSetting = fs.existsSync(customPath)
if (!existsCustomSetting) {
    console.warn("No custom Settings were detected!")
} else {
    setting = require(customPath)
}

export default setting