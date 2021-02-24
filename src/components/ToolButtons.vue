<template>
	<div id="main-control-button" class="toolbar-buttons">
		<ButtonGroup>
			<Button type="success" @click="push()">
				<Icon type="md-arrow-round-up" />Push</Button>
			<Button type="info" @click="pull()">
				<Icon type="md-arrow-round-down" />Pull</Button>
		</ButtonGroup>
		<Button type="info" ghost>
			<Icon type="md-arrow-round-down" />Fetch</Button>
		<Button type="info" ghost>
			<Icon type="md-return-left" />Reset(soft)</Button>
		<Button type="info" ghost @click="checkout()">
			<Icon type="md-redo" />Checkout</Button>
		<Button type="info" ghost @click="sshAgent()">
			<Icon type="md-lock" />SSH Agent</Button>
		<BranchWindow v-bind:visible.sync="branchModal" :maxHeight="maxHeight" />
	</div>
</template>

<style>
.toolbar-buttons>* {
	margin-right: 10px;
}

</style>

<script>
import http from '../common/services/http'
import BranchWindow from './BranchWindow'

export default {
	name: "ToolButtons",
	components: {
		BranchWindow
	},
	props: {
		maxHeight: Number
	},
	data: () => ({
		branchModal: false
	}),
	methods: {
		async sshAgent() {
			const data = await http.getJSON("ssh-agent")
			this.$Notice.success({
				title: 'SSH Agent',
				desc: `<ul>
                        <li>${data.agentPid.stdout}</li>
                        <li>${data.id_ed25519.stdout || data.id_ed25519.stderr}</li>
                        <li>${data.sshAdd.stdout}</li>
                    </ul>`,
				duration: 0
			})
		},
		async push() {
			const content = await http.text("push")
			this.$Notice.success({
				title: 'Push',
				desc: content,
				duration: 0
			})
		},
		async pull() {
			const content = await http.text("pull")
			this.$Notice.success({
				title: 'Pull',
				desc: content,
				duration: 0
			})
		},
		async checkout(){
			this.branchModal = true
		}
	}
}

</script>
