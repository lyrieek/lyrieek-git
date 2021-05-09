<template>
	<div>
		<ul class="config-list">
			<li style="border-bottom: 1px solid black">
				Git Config <Button style="margin-bottom: 2px" size="small" shape="circle" icon="md-build" @click="configWin = true"></Button></li>
			<li>
				<span>user.name</span>
				<span v-text="config.get('user.name')"></span>
			</li>
			<li>
				<span>user.email</span>
				<span v-text="config.get('user.email')"></span>
			</li>
			<li>
				<span>core.autocrlf</span>
				<span v-text="config.get('core.autocrlf')"></span>
			</li>
		</ul>
		<Modal title="Config" v-model="configWin" width="720px" footer-hide>
			<Checkbox v-model="isGlobal" @on-change="refresh">Global</Checkbox>
			<div class="config-content" :style="{'max-height': maxHeight + 'px'}">
				<template v-for="item of config.entries()">
					<div>{{item[0]}}</div>
					<div>
						<highlight-value :val="item[1]" />
					</div>
				</template>
			</div>
		</Modal>
	</div>
</template>

<style>
.config-list {
	padding: 10px;
	border: 1px solid teal;
	border-radius: 5px;
	width: auto;
}

.config-list>li>span:first-child {
	width: 100px;
	display: inline-block;
	text-align: right;
}

.config-list>li>span:first-child::after {
	content: ":";
}

.config-list>li>span:last-child {
	padding-left: 3px;
}

.config-content {
	display: grid;
	grid-template-columns: 40% 60%;
	grid-gap: 5px 10px;
	overflow-x: hidden;
	overflow-y: auto;
	align-items: center;
}

.config-content>div:nth-child(odd) {
	text-align: right;
	font-size: 18px;
}

.config-content>div:nth-child(even) {
	font-weight: bold;
	font-size: 16px;
}

</style>

<script>
import http from '../common/services/http'

export default {
	name: "GitConfig",
	data: () => ({
		config: new Map(),
		configWin: false,
		maxHeight: window.innerHeight - 300,
		isGlobal: false
	}),
	mounted() {
		this.$root.$on("refreshStatus", this.refresh)
	},
	methods: {
		async refresh() {
			const config = new Map(Object.entries(await http.postData("config", { isGlobal: this.isGlobal })))
			this.config = config
			this.$root.config = config
			this.$root.$emit("ConfigUpdate", config)
		}
	}
}

</script>
