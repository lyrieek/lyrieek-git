import Vue from 'vue'

// const postPrefix = "/"
const postPrefix = "//localhost:3516/"

const _fetch = (url, data, method) => {
	return fetch(postPrefix + url, {
		method: method || 'POST',
		body: data && JSON.stringify(data),
		mode: 'cors',
		cache: 'no-cache'
	}).then(async (response) => {
		if (response.status >= 200 && response.status < 300) {
			return response
		}
		const errorData = await response.json()
		Vue.prototype.$Notice.error({
			title: "Error",
			render: (h) => h('div', [
				h('div', [errorData.stderr || errorData.stdout]),
				h('Button', {
					attrs: { size: 'small' },
					style: { float: 'right' },
					on: {
						click() {
							Vue.prototype.$GWinBox.error(JSON.stringify(errorData, null, 2))
						}
					}
				}, '展开')
			])
		})
	}).catch((err) => {
		console.error(err)
	})
}
const _get = async (url) => {
	return await _fetch(url, null, "GET")
}
const _post = async (url, data) => {
	return await _fetch(url, data, "POST")
}
export default {
	fetchFn: (url, data, successFn) => {
		if (typeof data === 'function') {
			successFn = data
			data = null
		}
		return _fetch(url, data).then(successFn && ((e) => {
			e.json().then(successFn)
		}))
	},
	postData: async (url, data) => {
		return await (await _post(url, data)).json()
	},
	postText: async (url, data) => {
		return await (await _post(url, data)).text()
	},
	post: _post,
	getJSON: async (url) => {
		return await (await _get(url)).json()
	},
	text: async (url) => {
		return await (await _get(url)).text()
	}
}
