import express from 'express'
import expressWs from 'express-ws'
import { ExecaReturnBase } from 'execa'
import { PathParams } from 'express-serve-static-core'
import WebSocket from 'ws'

const { app, getWss } = expressWs(express())
app.listen(3516) //charCodeAt
app.use(express.static('../dist'))

app.all('*', function (req: express.Request, res: express.Response, next: express.NextFunction) {
	res.header("Access-Control-Allow-Origin", "*")
	res.header("Access-Control-Allow-Headers", "X-Requested-With")
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
	res.header("Content-Type", "application/json;charset=utf-8")
	next()
})

app.get('/', function (req: express.Request, res: express.Response) {
	res.redirect('/index.html')
})

const _wss = getWss()
app.ws('/', function (w: WebSocket) {
	w.on('message', function (msg: string) {
		const data = JSON.parse(msg)
		_wss.clients.forEach((client: WebSocket) => {
			client.send(JSON.stringify(data))
		})
	})
})

interface Controller {
	/*eslint-disable @typescript-eslint/no-explicit-any */
	(query: any): ExecaReturnBase<string> | Array<string | any> | Promise<any> | void
}

export default {
	paserParameter(req: express.Request, next: (param: unknown) => void): void {
		if (req.method === 'GET') {
			return next(req.query)
		}
		let param = ""
		req.on("data", (chunk: string) => param += chunk)
		req.on("end", () => next(JSON.parse(param.replace(/^\[object Object]/, ''))))
	},
	handler(controller: Controller) {
		return (req: express.Request, res: express.Response): void => {
			this.paserParameter(req, async (param: any) => {
				try {
					const result = await controller(param)
					if (!result) {
						return res.status(204).send("")
					}
					if (result.exitCode) {
						console.log(result)
						return res.status(500).send(result)
					} else if (!result.stdout) {
						res.status(202)
					}
					res.send(result)
				} catch (error) {
					console.log("error")
					console.log(error)
					res.status(500).send(error)
				}
			})
		}
	},
	get(mapping: PathParams, controller: Controller): void {
		app.get(mapping, this.handler(controller))
	},
	post(mapping: PathParams, controller: Controller): void {
		app.post(mapping, this.handler(controller))
	}
}