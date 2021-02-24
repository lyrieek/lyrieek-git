<template>
	<ul class="config-list">
		<li style="border-bottom: 1px solid black">
			<Icon type="md-build" />Git Config</li>
		<li>
			<span>user.name</span>
			<span v-text="userName"></span>
		</li>
		<li>
			<span>user.email</span>
			<span v-text="userEmail"></span>
		</li>
		<li>
			<span>core.autocrlf</span>
			<span v-text="autoCRLF"></span>
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
		userName: "",
		userEmail: "",
		autoCRLF: ""
	}),
	mounted() {
		this.$root.$on("refreshStatus", this.refresh)
	},
	methods: {
		async refresh() {
			const config = await http.getJSON("config")
			this.userName = config.userName
			this.userEmail = config.userEmail
			this.autoCRLF = config.autoCRLF
			this.$root.$emit("ConfigUpdate", config)
		}
	}
}

</script>
