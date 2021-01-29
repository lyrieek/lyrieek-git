import * as express from 'express'
import * as expressWs from 'express-ws'
import * as execa from 'execa';

const { app, getWss } = expressWs(express())
app.listen(3516) //charCodeAt

console.log("http://localhost:3516/");

app.use(express.static('../dist'))

app.all('*', function (req: any, res: any, next: any) {
	res.header("Access-Control-Allow-Origin", "*")
	res.header("Access-Control-Allow-Headers", "X-Requested-With")
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
	res.header("Content-Type", "application/json;charset=utf-8")
	next()
})

app.get('/', function (req: any, res: any) {
	res.redirect('/index.html')
})

let currentWorkDir = process.cwd()

const routes = {
	handler(controller: any) {
		return async (req: any, res: any) => {
			try {
				const result = await controller(req.query);
				if (result.exitCode) {
					res.status(500).send(result)
				}
				console.log(result);
				res.send(result)
			} catch (error) {
				res.status(500).send(error)
			}
		}
	},
	get(mapping: any, controller: any) {
		app.get(mapping, this.handler(controller))
	},
	post(mapping: any, controller: any) {
		app.post(mapping, this.handler(controller))
	}
}

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

const _wss = getWss('/')
app.ws('/', function (ws: any, req: any) {
	ws.on('message', function (msg: any) {
		const data = JSON.parse(msg);
		_wss.clients.forEach((client: any) => {
			client.send(JSON.stringify(data))
		});
	})
})
