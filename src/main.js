import Vue from 'vue'
import App from './App.vue'
import ViewUI from 'view-design'
import IViewWindow from './common/vue-plugin/iview-window'
import 'view-design/dist/styles/iview.css'

Vue.config.productionTip = false

Vue.use(ViewUI)
Vue.use(IViewWindow)
Vue.component("highlight-value", {
	props: ["val"],
	render(h) {
		if (this.val === "true" || this.val === "false") {
			return h("div", { style: { color: 'blueviolet', 'font-style': 'italic', 'padding-left': '1px' } }, this.val)
		}
		return h("div", this.val)
	}
})
new Vue({
	data: () => ({
		config: new Map()
	}),
	render: h => h(App),
}).$mount('#app')
