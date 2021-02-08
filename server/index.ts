import * as execa from 'execa';
import routes from './routes';

console.log("http://localhost:3516/");

let currentWorkDir = process.cwd()

routes.get('/pwd', async () => {
	// await execa('chcp 65001')
	const pwd = await execa('pwd')
	return pwd.stdout
})

routes.get('/cd', async (query: any) => {
	process.chdir(query.dir)
	currentWorkDir = query.dir
	return query.dir
})

routes.get('/exclude', async () => {
})

routes.get('/status', async () => {
	const statusContent = (await execa('git', ['status'])).stdout.split('\n')
	const result = Object.create(null)
	result.branch = statusContent[0].replace('On branch ', '')
	result.branchHasUpdate = !~statusContent[1].indexOf('up to date')
	result.notPushCommits = 0
	const hasNotPushCommits = statusContent[1].match(/by \d+ commit./)
	if (hasNotPushCommits && hasNotPushCommits.length) {
		result.notPushCommits = Number(hasNotPushCommits[0].match(/\d+/)[0])
	}
	const changeList = (await execa('git', ['status', '-s'])).stdout.split('\n')
	result.changes = []
	if (changeList.length > 0) {
		for (let index = 0; index < changeList.length; index++) {
			const element = changeList[index].split(/(?<=\S)\ +/)
			result.changes.push({
				type: element[0],
				fileName: element[1]
			})
		}
	}
	return result
})

routes.get('/addAll', async () => {
	const res = await execa('git', ['add', '.'])
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
	return res.stdout.split('\n')
})

routes.get('/npmFund', async () => {
	const res = await execa('npm', ['fund'])
	return res.stdout.split('\n')
})

routes.get('/graph', async () => {
	const res = await execa('git', ['log', '--graph', '--oneline', '--decorate', '--all'])
	return res.stdout.split('\n')
})

routes.post('/commit', async (query: any) => {
	const commitArg = ['commit', '-m', query.message, '--date="' + query.date + '"']
	console.log(commitArg);
	// return commitArg
	const res = await execa('git', commitArg)
	return res.stdout
})

routes.get('/log', async (query: any) => {
	const command = ['log', '--date=raw', '--max-count=' + query.size]
	if (query.skip) {
		command.push('--skip=' + query.skip)
	}
	const res = await execa('git', command)
	const logArr = res.stdout.split('\n');
	return logArr.map((e, i) =>
		e.startsWith('commit ') && {
			commit: e,
			author: logArr[i + 1],
			date: logArr[i + 2],
			msg: logArr[i + 4].replace(/^ +/, '')
		}).filter((e) => e)
})

routes.get('/config', async () => {
	const userName = (await execa('git', ['config', 'user.name'])).stdout
	const userEmail = (await execa('git', ['config', 'user.email'])).stdout
	return {
		userName, userEmail
	}
})

routes.get('/viewFile', async (query: any) => {
	const res = await execa('head', [query.file])
	return res.stdout
})

routes.get('/gpg/view', async () => {
	const res = await execa('gpg', ['--list-keys'])
	return res.stdout
})
