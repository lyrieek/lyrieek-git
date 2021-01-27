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

app.get('/pwd', async (req: any, res: any) => {
	const pwd = await execa('pwd')
	console.log(pwd)
	res.send(pwd.stdout)
})

app.get('/cd', async (req: any, res: any) => {
	try {
		process.chdir(req.query.dir)
		res.redirect('/pwd')
	} catch (error) {
		res.send(error)
	}
})

app.get('/status', async (req: any, res: any) => {
	const status = await execa('git status ' + req.params.dir)
	console.log(status)
	res.send(status.stdout)
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
