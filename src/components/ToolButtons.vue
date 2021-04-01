<template>
	<div id="main-control-button" class="toolbar-buttons">
		<ButtonGroup>
			<Button type="success" @click="push()">
				<Icon type="md-arrow-round-up" />Push</Button>
			<Button type="info" @click="pull()">
				<Icon type="md-arrow-round-down" />Pull</Button>
		</ButtonGroup>
		<Tooltip placement="bottom" @on-popper-show="showSSHKeyPath" max-width="390">
			<span style="border-bottom: 1px solid;
			vertical-align: bottom;
			padding: 2px;
			border-radius: 3px;
			color: #57c5f7;">
				<Checkbox v-model="needSSHAgent" />SSH Agent</Checkbox>
			</span>
			<div slot="content" style="width: 210px;">
				<i style="display: block;border-bottom: 1px solid gray;line-height: 26px">
					SSH Key Path
					<span style="float: right;">
						<Button style="margin-right: 5px;" size="small" v-show="!sshKeyPathEditing" @click="testSSH()">Test</Button>
						<Button size="small" v-show="!sshKeyPathEditing" @click="sshKeyPathEditing = true" icon="md-create" shape="circle"></Button>
						<Button size="small" v-show="sshKeyPathEditing" @click="saveSSHKeyPath()" icon="md-checkmark-circle" shape="circle"></Button>
					</span>
				</i>
				<div style="padding-top: 15px" v-show="!sshKeyPathEditing">{{ sshKeyPath }}</div>
				<Input v-show="sshKeyPathEditing" v-model="editSSHKeyPath" size="small" placeholder="SSH Key Path" />
			</div>
		</Tooltip>
		<!-- <Poptip v-model="sshAgentVisible">
			<Button type="info" ghost @click="sshAgent()">
				<Icon type="md-lock" />SSH Agent</Button>
			<div slot="title"><i>SSH Agent info</i></div>
			<div slot="content" style="white-space: pre;">{{ sshAgentInfo }}</div>
		</Poptip> -->
		<Button type="info" ghost @click="fetch()">
			<Icon type="md-arrow-round-down" />Fetch</Button>
		<Button type="info" ghost @click="reset()">
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
		maxHeight: Number,
		project: Object
	},
	data: () => ({
		branchModal: false,
		assumeUnchangedWin: false,
		assumeUnchangedList: [],
		addAUVisible: false,
		newAUName: "",
		sshAgentVisible: false,
		sshKeyPath: "",
		needSSHAgent: false,
		sshKeyPathEditing: false,
		editSSHKeyPath: ""
	}),
	methods: {
		async showSSHKeyPath() {
			this.sshKeyPathEditing = false
			this.sshKeyPath = this.project.sshKeyPath || await http.text('sshKeyPath')
			this.editSSHKeyPath = this.sshKeyPath
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
		async fetch() {
			await http.post("fetch")
		},
		async reset() {
			await http.post("reset")
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
		},
		async saveSSHKeyPath() {
			await http.post('sshKeyPath', { sshKeyPath: this.editSSHKeyPath })
			this.$root.$emit("statusUpdated", this.showSSHKeyPath)
		},
		async testSSH() {
			this.$Message.success(await http.postText('testSSHKey'))
		}
	}
}

</script>
