import * as path from 'path'
import * as fs from 'fs'

let setting = [{
    projectPath: path.resolve(__dirname, '../')
}]

const customPath = path.resolve(__dirname, '../customSetting/index.json')
const existsCustomSetting = fs.existsSync(customPath)
if (!existsCustomSetting) {
    console.warn("No custom Settings were detected!");
} else {
    setting = require(customPath);
}

export default setting