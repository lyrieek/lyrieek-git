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
	const changeList = (await execa('git', ['status', '-s'])).stdout.split('\n')
	result.changes = []
	if (changeList.length > 1) {
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

routes.get('/ls', async () => {
	const res = await execa('ls', ['-o'])
	return res.stdout.split('\n').splice(1)
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

routes.get('/config', async () => {
	const userName = (await execa('git', ['config', 'user.name'])).stdout
	const userEmail = (await execa('git', ['config', 'user.email'])).stdout
	return {
		userName, userEmail
	}
})
