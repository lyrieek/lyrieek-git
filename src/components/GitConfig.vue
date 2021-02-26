<template>
	<ul class="config-list">
		<li style="border-bottom: 1px solid black">
			<Icon type="md-build" />Git Config</li>
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

</style>

<script>
import http from '../common/services/http'

export default {
	name: "GitConfig",
	data: () => ({
		config: new Map()
	}),
	mounted() {
		this.$root.$on("refreshStatus", this.refresh)
	},
	methods: {
		async refresh() {
			const config = new Map(Object.entries(await http.getJSON("config")))
			this.config = config
			this.$root.config = config
			this.$root.$emit("ConfigUpdate", config)
		}
	}
}

</script>
