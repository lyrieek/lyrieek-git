import * as express from 'express'
import * as expressWs from 'express-ws'
import * as execa from 'execa';

const { app, getWss } = expressWs(express())
app.listen(3516) //charCodeAt

console.log("http://localhost:3516/");

app.use(express.static('../dist'))

app.all('*', function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*")
	res.header("Access-Control-Allow-Headers", "X-Requested-With")
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
	res.header("Content-Type", "application/json;charset=utf-8")
	next()
})

app.get('/', function (req: any, res: any) {
	res.redirect('/index.html')
})

let localDir = '/e/project'

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
	const pwd = await execa('pwd')
	return pwd.stdout
})

routes.get('/cd', async (query: any) => {
	process.chdir(query.dir)
	return query.dir
})

routes.get('/status', async () => {
	return (await execa('git status'))
})

routes.get('/ls', async () => {
	const res = await execa('ls', ['-o'])
	return res.stdout.split('\n').splice(1)
})

routes.get('/ls', async () => {
	const res = await execa('git', ['log', '--graph', '--oneline', '--decorate', '--all'])
	return res.stdout.split('\n')
})

const _wss = getWss('/')
app.ws('/', function (ws: any, req: any) {
	ws.on('message', function (msg: any) {
		const data = JSON.parse(msg);
		_wss.clients.forEach((client) => {
			client.send(JSON.stringify(data))
		});
	})
})
