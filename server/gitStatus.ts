import * as execa from 'execa'

export default async function () {
    const result = Object.create(null)
    const statusContent = (await execa('git', ['status'])).stdout.split('\n')
    result.branch = statusContent[0].replace('On branch ', '')
    result.branchHasUpdate = !~statusContent[1].indexOf('up to date')
    result.notPushCommits = 0
    const hasNotPushCommits = statusContent[1].match(/by \d+ commit./)
    if (hasNotPushCommits && hasNotPushCommits.length) {
        result.notPushCommits = Number(hasNotPushCommits[0].match(/\d+/)[0])
    }
    return result
}
