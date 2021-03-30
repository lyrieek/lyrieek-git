import execa from 'execa'

interface GitStatusInfo {
    branch: string
    branchHasUpdate: string
    notPushCommits: string
    changes: Array<{ type: string, fileName: string, selected: boolean }>
}

export default async function (cwd?: string): Promise<GitStatusInfo> {
    const result = Object.create(null)
    const statusContent = (await execa('git', ['status'], {cwd: cwd || process.cwd()})).stdout.split('\n')
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
