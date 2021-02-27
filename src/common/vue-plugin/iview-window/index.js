export default {
	parameter: (title, content, options) => Object.assign({
		title: title,
		width: "700px",
		render: (h) =>
			h('div', {
				style: {
					'white-space': 'pre-wrap',
					'word-break': 'break-word',
					'font-size': '16px',
					'max-height': window.innerHeight - 300 + 'px',
					overflow: "auto"
				}
			}, content)
	}, options),
	install: function(Vue) {
		// console.log(this.$Modal)
		Vue.prototype.$GWinBox = {
			modal: Vue.prototype.$Modal,
			parameter: this.parameter,
			info: function(...args) { this.modal.info(this.parameter(...args)) },
			success: function(...args) { this.modal.success(this.parameter(...args)) },
			error: function(...args) {
				if (args.length === 1) {
					args[1] = args[0]
					args[0] = "Error"
				}
				this.modal.error(this.parameter(...args))
			}
		}
	}
}
