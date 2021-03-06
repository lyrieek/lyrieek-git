import execa from 'execa'
import routes from './routes'
import setting from './setting'
import gitStatus from './gitStatus'

console.log("http://localhost:3516/")

const defaultSSHKeyPath = '~/.ssh/id_ed25519'
let currentProject = Object.create(null)
let currentWorkDir = process.cwd()

routes.get('/pwd', async () => {
	// await execa('chcp 65001')
	const pwd = await execa('pwd')
	return pwd.stdout
})

routes.post('/cd', async (query: { dir: string, project: string }) => {
	if (!query.project) {
		process.chdir(query.dir)
		return query.dir
	}
	for (const item of setting) {
		item.selected = false
		if (item.name === query.project) {
			item.selected = true
			currentProject = item
			currentWorkDir = item.projectPath
			process.chdir(currentWorkDir)
		}
	}
	return setting
})

routes.get('/exclude', async () => {
	// add exclude file
})

routes.get('/status', async () => {
	const result = await gitStatus()
	const changeList = (await execa('git', ['status', '-s'])).stdout.split('\n')
	result.changes = []
	if (changeList.length > 0) {
		for (let index = 0; index < changeList.length; index++) {
			const data = changeList[index]
			result.changes.push({
				type: data.substring(0, 3),
				fileName: data.substring(3),
				selected: false
			})
		}
	}
	return result
})

routes.get('/addAll', async () => {
	/*eslint-disable */
	const res = await execa('git', ['add', '.']);
	return res.stdout.split('\n').splice(1)
})

routes.post('/addItem', async (query: { item: string }) => {
	const res = await execa('git', ['add', query.item])
	return res.stdout.split('\n').splice(1)
})

routes.post('/recallItem', async (query: { item: string }) => {
	const res = await execa('git', ['reset', '-q', 'HEAD', '--', query.item])
	return res.stdout.split('\n').splice(1)
})

routes.get('/undo', async () => {
	const res = await execa('git', ['reset', 'HEAD'])
	return res.stdout.split('\n').splice(1)
})

routes.get('/ls', async () => {
	const res = await execa('ls', ['-o', '-a', '-S', '--reverse', '--time-style=long-iso'])
	const arr = res.stdout.split('\n').splice(1)
	return arr.map((e) => {
		const fileItem = e.split(/ +/)
		return {
			role: fileItem[0],
			// user: fileItem[2],
			size: fileItem[3],
			date: fileItem[4] + ' ' + fileItem[5],
			name: fileItem[6],
		}
	})
})

// loss session
routes.get('/ssh-agent', async () => {
	// const agentPid = await execa('bash', ['-c', 'eval $(ssh-agent -s)'])
	// const id_ed25519 = await execa('ssh-add', ['~/.ssh/id_ed25519'])
	// const sshAdd = await execa('ssh-add', ['-l', '-E', 'sha256'])
	const val = await execa('eval $(ssh-agent -s) && ssh-add ~/.ssh/id_ed25519', { shell: 'bash' })

	return val
})

const sshAgent = function (param: string) {
	const addKeyPath = currentProject.sshKeyPath || defaultSSHKeyPath
	return execa(`eval $(ssh-agent -s) && ssh-add ${addKeyPath} && ${param}`, { shell: 'bash' })
}

routes.post('/testSSHKey', async () => {
	return (await sshAgent('echo !')).stdout
})

routes.post('/sshKeyPath', async (query: { sshKeyPath: string }) => {
	currentProject.sshKeyPath = query.sshKeyPath
	return "success"
})

routes.get('/sshKeyPath', async () => {
	return defaultSSHKeyPath
})

routes.post('/fetch', async (query: { needSSHAgent: boolean }) => {
	if (query.needSSHAgent) {
		return await sshAgent("git fetch")
	}
	const res = await execa('git', ['fetch'])
	return res.stdout
})

routes.post('/reset', async () => {
	const res = await execa('git', ['reset', 'HEAD^'])
	return res.stdout
})

routes.post('/pull', async (query: { needSSHAgent: boolean }) => {
	if (query.needSSHAgent) {
		return await sshAgent("git pull")
	}
	const res = await execa('git', ['pull'])
	return res.stdout
})

routes.post('/push', async (query: { needSSHAgent: boolean, force: boolean }) => {
	const command = ['push']
	if (query.force) {
		command.push("--force")
	}
	if (query.needSSHAgent) {
		return await sshAgent("git " + command.join(" "))
	}
	const res = await execa('git', command)
	if (!res.stdout) {
		res.stdout = res.stderr
	}
	return res.stdout
})

routes.post('/update-index', async (query: { item: string, control: string }) => {
	const command = ['update-index']
	switch (query.control) {
		case "hide":
			command.push("--assume-unchanged")
			break
		case "show":
			command.push("--no-assume-unchanged")
			break

		default: {
			try {
				const res = await execa('git ls-files -v | grep "^h"', { shell: true })
				return res.stdout.split("\n").map(e => e.substring(2))
			} catch (error) {
				//no match error code == 1
				return ""
			}
		}
	}
	command.push(query.item)
	const res = await execa('git', command)
	return res.stdout
})

routes.post('/stash', async (query: { control: string, param: string }) => {
	const command = ['stash']
	if (!query.control) {
		query.control = "list"
	}
	if (query.control ===  "push") {
		query.param = `"${query.param}"`
	}
	command.push(query.control)
	if (query.param) {
		if (query.control ===  "push") {
			command.push("-m")
		}
		command.push(query.param)
	}
	const res = await execa('git', command)
	if (query.control === "list") {
		return res.stdout.split('\n')
	}
	return res.stdout
})

routes.get('/branch', async () => {
	const res = await execa('git', ['branch'])
	const branchs: {
		current: string
		all: Array<string>
	} = { current: '', all: [] }
	for (const item of res.stdout.split('\n')) {
		if (item.startsWith("*")) {
			branchs.current = item.substring(2)
		}
		branchs.all.push(item.substring(2))
	}
	return branchs
})

routes.get('/npmFund', async () => {
	const res = await execa('npm', ['fund'])
	return res.stdout.split('\n')
})

routes.get('/graph', async () => {
	const res = await execa('git', ['log', '--graph', '--oneline', '--decorate', '--all'])
	return res.stdout.split('\n')
})

routes.post('/commit', async (query: { message: string, date: string, gpg: string, signOff: boolean, alsoReviseCommitTime: true }) => {
	const commitArg = ['commit', '-m', `"${query.message}"`]
	let preCmd = ""
	if (query.date) {
		commitArg.push('--date="' + query.date + '"')
		if (query.alsoReviseCommitTime) {
			preCmd = `export GIT_COMMITTER_DATE="${query.date}";\\`
		}
	}
	if (query.gpg) {
		commitArg.push("-S")
		//gpgconf --kill gpg-agent
	}
	if (query.signOff) {
		commitArg.push("-s")
	}
	const [res, err] = await execa(preCmd + 'git', commitArg, { shell: 'bash', timeout: 8000 })
		.then(res => [res, null]).catch(err => [null, err])
	if (err) {
		throw err
	}
	if (res) {
		return res.stdout
	}
})

routes.get('/log', async (query: { size: number, skip: number }) => {
	const command = ['log', '--date=raw', '--max-count=' + query.size]
	if (query.skip) {
		command.push('--skip=' + query.skip)
	}
	const res = await execa('git', command)
	const logArr = res.stdout.split('\n')
	return logArr.map((e, i) => {
		if (!e.startsWith('commit ')) {
			return
		}
		const isMerge = logArr[i + 1].startsWith('Merge:')
		return {
			commit: e.replace(/^commit /, ""),
			isMerge,
			author: logArr[i + (isMerge ? 2 : 1)].replace(/^Author: /, ""),
			date: logArr[i + (isMerge ? 3 : 2)],
			msg: logArr[i + (isMerge ? 5 : 4)].replace(/^ +/, '')
		}
	}).filter((e) => e)
})

routes.post('/config', async (query: { isGlobal: string }) => {
	const param = ['config', '-l']
	if (query.isGlobal) {
		param.push('--global')
	}
	const config = await execa('git', param)
	const configArr = config.stdout.split('\n').map((e) =>
		({ [e.split('=')[0]]: e.replace(/[a-z.]+=/, '') }))
	return Object.assign(Object.create(null), ...configArr)
})

routes.get('/viewFile', async (query: { file: string }) => {
	const res = await execa('head', [query.file])
	return res.stdout
})

routes.post('/diff', async (query: { file: string }) => {
	const res = await execa('git', ['diff', query.file])
	return res.stdout
})

routes.get('/explorer', async () => {//query: { folder: string }
	const res = execa(`explorer.exe "${currentWorkDir}"`)//"/select," + 
	return res.stdout
})

routes.get('/gpg/view', async () => {
	const res = await execa('gpg', ['--list-keys'])
	return res.stdout
})

routes.get('/projects', async () => {
	const result = []
	for (const item of setting) {
		if (item.selected) {
			currentWorkDir = item.projectPath
		}
		item.name = item.projectPath.split(/\\|\//).pop() || "Unnamed"
		// process.chdir(item.projectPath)
		result.push(Object.assign(item, await gitStatus(item.projectPath)))
	}
	// process.chdir(currentWorkDir)
	return result
})

routes.post('/checkout', async (query: { item: string, control: string }) => {
	let commandRes = Object.create(null)
	switch (query.control) {
		case 'create':
			commandRes = await execa('git checkout', ['-b', query.item])
			break
		case 'remove':
			commandRes = await execa('git branch', ['-d', query.item])
			break
		case 'rename': {
			const branchNames = query.item.split(":=")
			if (branchNames.length !== 2) {
				throw new Error("Checkout rename failure! branch name error")
			}
			commandRes = await execa('git branch', ['-m', branchNames[0], branchNames[1]])
			break
		}
		default:
			commandRes = await execa('git checkout', [query.item])
			break
	}
	return commandRes.stdout
})
