<template>
	<div id="main-control-button" class="toolbar-buttons">
		<Button type="success" @click="push()">
			<Icon type="md-arrow-round-up" />Push</Button>
		<span class="u-checkboxs">
			<span>
				<Checkbox v-model="needForce" />Force</Checkbox></span>
			<span>
				<Tooltip placement="bottom" @on-popper-show="showSSHKeyPath" max-width="390">
					<Checkbox v-model="needSSHAgent" />SSH Agent</Checkbox>
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
			</span>
		</span>
		<Button type="info" @click="pull()">
			<Icon type="md-arrow-round-down" />Pull</Button>
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
		<Button type="info" ghost @click="openCheckoutWin()">
			<Icon type="md-redo" />Checkout</Button>

		<Button type="info" ghost @click="assumeUnchangedWin = true">
			<Icon type="md-eye-off" />Assume Unchanged List</Button>
		<Button type="info" ghost @click="stashWin = true">
			<Icon type="ios-archive" />{{ $t("message.stash") }}</Button>

		<BranchWindow v-bind:visible.sync="branchModal" :maxHeight="maxHeight" />
		<Modal title="Assume Unchange(假定不变)" v-model="assumeUnchangedWin" @on-visible-change="AURefresh">
			<List border size="small">
				<ListItem v-for="item of assumeUnchangedList" :key="item">
					<span class="ivu-list-item-meta-content">{{item}}</span>
					<template slot="action">
						<li>
							<Button icon="ios-trash" type="error" size="small" @click="AUControl(item, 'show')">{{ $t("message.remove") }}</Button>
						</li>
					</template>
				</ListItem>
				<ListItem v-show="addNewItemVisible">
					<span class="ivu-list-item-meta-content">
						<Input type="text" v-model="newAUName" :placeholder="$t('message.inputFilterItem')"></Input>
					</span>
					<template slot="action">
						<li>
							<Button icon="md-checkmark" type="success" size="small" @click="AUControl(newAUName, 'hide')">{{ $t("message.add") }}</Button>
						</li>
						<li>
							<Button icon="ios-close-circle" size="small" @click="addNewItemVisible = false">{{ $t("message.cancel") }}</Button>
						</li>
					</template>
				</ListItem>
			</List>
			<div style="text-align: center;margin-top: 10px">
				<Button v-show="!addNewItemVisible" icon="md-add" type="success" @click="addNewItemVisible = true">{{ $t("message.addAUItem") }}</Button>
			</div>
		</Modal>
		<Modal :title="$t('message.stash')" v-model="stashWin"  @on-visible-change="stashRefresh">
			<List border size="small">
				<ListItem v-for="item of stashList" :key="item">
					<span class="ivu-list-item-meta-content">{{ item }}</span>
					<template slot="action">
						<li>
							<Button icon="md-checkmark-circle" type="primary" size="small" @click="stashControl('apply', item)">{{ $t("message.apply") }}</Button>
						</li>
					</template>
					<template slot="action">
						<li>
							<Button icon="ios-trash" type="error" size="small" @click="stashControl('drop', item)">{{ $t("message.remove") }}</Button>
						</li>
					</template>
				</ListItem>
				<ListItem v-show="addNewItemVisible">
					<span class="ivu-list-item-meta-content">
						<Input type="text" v-model="newStashRemark" :placeholder="$t('message.remark')"></Input>
					</span>
					<template slot="action">
						<li>
							<Button icon="md-checkmark" type="success" size="small" @click="stashControl('push', newStashRemark)">{{ $t("message.add") }}</Button>
						</li>
						<li>
							<Button icon="ios-close-circle" size="small" @click="addNewItemVisible = false">{{ $t("message.cancel") }}</Button>
						</li>
					</template>
				</ListItem>
			</List>
			<div style="text-align: center;margin-top: 10px">
				<Button v-show="!addNewItemVisible" icon="md-add" type="success" @click="addNewItemVisible = true">{{ $t("message.stash") }}</Button>
			</div>
		</Modal>
	</div>
</template>

<style>
.toolbar-buttons>* {
	margin-right: 10px;
}

.u-checkboxs>span {
	margin: 5px;
}

.u-checkbox,
.u-checkboxs>span {
	border-bottom: 1px solid;
	vertical-align: bottom;
	padding: 2px;
	border-radius: 3px;
	color: #57c5f7;
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
		stashList: [],
		addNewItemVisible: false,
		newAUName: "",
		sshAgentVisible: false,
		sshKeyPath: "",
		needSSHAgent: false,
		needForce: false,
		sshKeyPathEditing: false,
		editSSHKeyPath: "",
		stashWin: false,
		newStashRemark: ""
	}),
	methods: {
		refreshStatus() {
			this.$root.$emit("refreshStatus")
			this.$root.$emit("statusUpdated")
		},
		async showSSHKeyPath() {
			this.sshKeyPathEditing = false
			this.sshKeyPath = this.project.sshKeyPath || await http.text('sshKeyPath')
			this.editSSHKeyPath = this.sshKeyPath
		},
		async push() {
			const content = await http.postText("push", { needSSHAgent: this.needSSHAgent, force: this.needForce })
			this.$Notice.success({
				title: 'Push',
				desc: content,
				duration: 0
			})
			this.$root.$emit("statusUpdated")
		},
		async pull() {
			const content = await http.postText("pull", { needSSHAgent: this.needSSHAgent })
			this.refreshStatus()
			this.$Notice.success({
				title: 'Pull',
				desc: content,
				duration: 0
			})
		},
		async openCheckoutWin() {
			this.branchModal = true
		},
		async fetch() {
			await http.post("fetch")
			this.refreshStatus()
			this.$Message.success("Fetch done.")
		},
		async reset() {
			await http.post("reset")
			this.refreshStatus()
			this.$Message.success("Reset done.")
		},
		async AURefresh() {
			this.newAUName = ""
			this.assumeUnchangedList = await http.postData("update-index")
		},
		async stashRefresh() {
			this.newStashRemark = ""
			this.stashList = await http.postData("stash")
		},
		async AUControl(item, control) {
			await http.post("update-index", { item, control })
			this.AURefresh()
			this.$root.$emit("refreshStatus")
		},
		async stashControl(control, param) {
			const info = await http.postText("stash", { control, param: control === 'push' ? param : param.split(":")[0] })
			if (info) {
				this.$Notice.success({
					title: 'Stash',
					desc: info
				})
			}
			this.stashRefresh()
			this.$root.$emit("refreshStatus")
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
