import execa from 'execa'
import routes from './routes'
import setting from './setting'
import gitStatus from './gitStatus'

console.log("http://localhost:3516/")

let currentWorkDir = process.cwd()

routes.get('/pwd', async () => {
	// await execa('chcp 65001')
	const pwd = await execa('pwd')
	return pwd.stdout
})

routes.get('/cd', async (query: { dir: string, project: string }) => {
	if (!query.project) {
		process.chdir(query.dir)
		return query.dir
	}
	for (const item of setting) {
		item.selected = false
		if (item.name === query.project) {
			item.selected = true
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
	const res = await execa('git', ['add', '.'])
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

routes.get('/ssh-agent', async () => {
	const agentPid = await execa('ssh-agent', ['-s'])
	const id_ed25519 = await execa('ssh-add', ['~/.ssh/id_ed25519'])
	const sshAdd = await execa('ssh-add', ['-l', '-E', 'sha256'])
	return {
		agentPid,
		id_ed25519,
		sshAdd
	}
})

routes.get('/pull', async () => {
	const res = await execa('git', ['pull'])
	return res.stdout
})

routes.get('/push', async () => {
	const res = await execa('git', ['push'])
	if (!res.stdout) {
		res.stdout = res.stderr
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

routes.post('/commit', async (query: { message: string, date: string, gpg: string, signOff: boolean }) => {
	const commitArg = ['commit', '-m', `${query.message}`, '--date="' + query.date + '"']
	if (query.gpg) {
		commitArg.push("-S")
		//gpgconf --kill gpg-agent
		//gpg-connect-agent /bye
	}
	if (query.signOff) {
		commitArg.push("-s")
	}
	const [res, err] = await execa('git', commitArg, { timeout: 8000 })
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
			commit: e,
			isMerge,
			author: logArr[i + (isMerge ? 2 : 1)],
			date: logArr[i + (isMerge ? 3 : 2)],
			msg: logArr[i + (isMerge ? 5 : 4)].replace(/^ +/, '')
		}
	}).filter((e) => e)
})

routes.get('/config', async () => {
	const userName = (await execa('git', ['config', 'user.name'])).stdout
	const userEmail = (await execa('git', ['config', 'user.email'])).stdout
	const autoCRLF = (await execa('git', ['config', 'core.autoCRLF'])).stdout
	return {
		userName, userEmail, autoCRLF
	}
})

routes.get('/viewFile', async (query: { file: string }) => {
	const res = await execa('head', [query.file])
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
		process.chdir(item.projectPath)
		result.push(Object.assign(item, await gitStatus()))
	}
	process.chdir(currentWorkDir)
	return result
})

routes.post('/checkout', async (query: { item: string, control: string }) => {
	let commandRes = Object.create(null)
	if (query.control === 'create') {
		commandRes = await execa('git checkout', ['-b', query.item])
	} else if (query.control === 'remove') {
		commandRes = await execa('git branch', ['-d', query.item])
	} else {
		commandRes = await execa('git checkout', [query.item])
	}
	return commandRes.stdout
})
