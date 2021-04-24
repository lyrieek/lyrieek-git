import Vue from 'vue'
import App from './App.vue'
import VueI18n from 'vue-i18n'
import ViewUI from 'view-design'
import IViewWindow from './common/vue-plugin/iview-window'
import 'view-design/dist/styles/iview.css'

Vue.config.productionTip = false

Vue.use(ViewUI)
Vue.use(IViewWindow)
Vue.use(VueI18n)
const DEFAULT_LANG = 'enUS'

const i18n = new VueI18n({
	locale: DEFAULT_LANG,
	messages: {
		zhCN: require('./i18n/zh-CN.json'),
		enUS: require('./i18n/en-US.json'),
	}
})

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
	i18n,
	render: h => h(App),
}).$mount('#app')
