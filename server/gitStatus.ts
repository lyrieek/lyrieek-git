import execa from 'execa'

export default async function (): Promise<{
    branch: string
    branchHasUpdate: string
    notPushCommits: string
    changes: Array<{ type: string, fileName: string }>
}> {
    const result = Object.create(null)
    const statusContent = (await execa('git', ['status'])).stdout.split('\n')
    result.branch = statusContent[0].replace('On branch ', '')
    result.branchHasUpdate = !~statusContent[1].indexOf('up to date')
    result.notPushCommits = 0
    const hasNotPushCommits = statusContent[1].match(/by \d+ commit./)
    if (hasNotPushCommits && hasNotPushCommits.length) {
        const matchRes = hasNotPushCommits[0].match(/\d+/)
        if (matchRes) {
            result.notPushCommits = Number(matchRes[0])
        }
    }
    return result
}
