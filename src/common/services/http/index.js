// const postPrefix = "/"
const postPrefix = "//localhost:3516/"

const _fetch = (url, data, method) => {
	return fetch(postPrefix + url, {
		method: method || 'POST',
		body: data && JSON.stringify(data),
		mode: 'cors',
		cache: 'no-cache'
	})
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
	get: async (url) => {
		return await _fetch(url, null, "GET")
	},
	post: async (url, data) => {
		return await _fetch(url, data, "POST")
	},
	getJSON: async (url) => {
		return await (await _fetch(url, null, "GET")).json()
	},
	text: async (url) => {
		return await (await _fetch(url, null, "GET")).text()
	}
}
