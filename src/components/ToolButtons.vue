<template>
	<div id="main-control-button" class="toolbar-buttons">
		<ButtonGroup>
			<Button type="success" @click="push()">
				<Icon type="md-arrow-round-up" />Push</Button>
			<Button type="info" @click="pull()">
				<Icon type="md-arrow-round-down" />Pull</Button>
		</ButtonGroup>
		<span style="border-bottom: 1px solid;
			vertical-align: bottom;
			padding: 2px;
			border-radius: 3px;
			color: #57c5f7;">
			<Checkbox v-model="needSSHAgent" />SSH Agent</Checkbox>
		</span>
		<!-- <Poptip v-model="sshAgentVisible">
			<Button type="info" ghost @click="sshAgent()">
				<Icon type="md-lock" />SSH Agent</Button>
			<div slot="title"><i>SSH Agent info</i></div>
			<div slot="content" style="white-space: pre;">{{ sshAgentInfo }}</div>
		</Poptip> -->
		<Button type="info" ghost>
			<Icon type="md-arrow-round-down" />Fetch</Button>
		<Button type="info" ghost>
			<Icon type="md-return-left" />Reset(soft)</Button>
		<Button type="info" ghost @click="checkout()">
			<Icon type="md-redo" />Checkout</Button>

		<Button type="info" ghost @click="assumeUnchangedWin = true">
			<Icon type="md-eye-off" />Assume Unchanged List</Button>
		<BranchWindow v-bind:visible.sync="branchModal" :maxHeight="maxHeight" />
		<Modal title="Assume Unchange(假定不变)" v-model="assumeUnchangedWin" @on-visible-change="AURefresh">
			<List border size="small">
				<ListItem v-for="item of assumeUnchangedList" :key="item">
					<span class="ivu-list-item-meta-content">{{item}}</span>
					<template slot="action">
						<li>
							<Button icon="ios-trash" type="error" size="small" @click="AUControl(item, 'show')">移出列表</Button>
						</li>
					</template>
				</ListItem>
				<ListItem v-show="addAUVisible">
					<span class="ivu-list-item-meta-content">
						<Input type="text" v-model="newAUName" placeholder="输入新的假定项"></Input>
					</span>
					<template slot="action">
						<li>
							<Button icon="ios-trash" type="success" size="small" @click="AUControl(newAUName, 'hide')">添加</Button>
						</li>
						<li>
							<Button icon="ios-close-circle" size="small" @click="addAUVisible = false">取消</Button>
						</li>
					</template>
				</ListItem>
			</List>
			<div style="text-align: center;margin-top: 10px">
				<Button v-show="!addAUVisible" icon="md-add" type="success" @click="inputNewAU()">添加新的假定项</Button>
			</div>
		</Modal>
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
		branchModal: false,
		assumeUnchangedWin: false,
		assumeUnchangedList: [],
		addAUVisible: false,
		newAUName: "",
		sshAgentVisible: false,
		sshAgentInfo: "",
		needSSHAgent: false
	}),
	methods: {
		async sshAgent() {
			const data = await http.getJSON("ssh-agent")
			this.sshAgentInfo = data.stdout + "\n"
				+ (data.stderr)
			this.sshAgentVisible = true
		},
		async push() {
			const content = await http.postText("push", { needSSHAgent: this.needSSHAgent })
			this.$Notice.success({
				title: 'Push',
				desc: content,
				duration: 0
			})
			this.$root.$emit("statusUpdated")
		},
		async pull() {
			const content = await http.postText("pull", { needSSHAgent: this.needSSHAgent })
			this.$Notice.success({
				title: 'Pull',
				desc: content,
				duration: 0
			})
		},
		async checkout() {
			this.branchModal = true
		},
		async AURefresh() {
			this.newAUName = ""
			this.assumeUnchangedList = await http.postData("update-index")
		},
		async AUControl(item, control) {
			await http.post("update-index", { item, control })
			this.AURefresh()
			this.$root.$emit("refreshStatus")
		},
		inputNewAU() {
			this.AURefresh()
			this.addAUVisible = true
		}
	}
}

</script>
