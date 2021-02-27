import Vue from 'vue'
import App from './App.vue'
import ViewUI from 'view-design'
import IViewWindow from './common/vue-plugin/iview-window'
import 'view-design/dist/styles/iview.css'

Vue.config.productionTip = false

Vue.use(ViewUI)
Vue.use(IViewWindow)
new Vue({
	data: () => ({
		config: new Map()
	}),
	render: h => h(App),
}).$mount('#app')
