import * as express from 'express'
import * as expressWs from 'express-ws'

const { app, getWss } = expressWs(express())
app.listen(3516) //charCodeAt
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

const _wss = getWss()
app.ws('/', function (ws: any, req: any) {
	ws.on('message', function (msg: any) {
		const data = JSON.parse(msg);
		_wss.clients.forEach((client: any) => {
			client.send(JSON.stringify(data))
		});
	})
})

export default {
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