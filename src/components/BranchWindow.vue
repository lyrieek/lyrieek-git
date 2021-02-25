<template>
	<Modal title="所有分支" v-model="modelVisible" @on-visible-change="refresh">
		<div :style="{'max-height': maxHeight + 'px',overflow: 'auto'}">
			<List border size="small">
				<ListItem v-for="item in branch.all" :key="item">
					<ListItemMeta v-if="branch.current !== item" :title="item"></ListItemMeta>
					<ListItemMeta v-if="branch.current === item" v-show="!editBranchVisible" style="font-weight: bold" :title="item"></ListItemMeta>
					<div class="ivu-list-item-meta-content" v-if="branch.current === item" v-show="editBranchVisible">
						<Input type="text" v-model="newBranchName" :placeholder="输入要修正的分支名"></Input>
					</div>
					<template slot="action">
						<li v-if="branch.current === item" v-show="!editBranchVisible">
							<Button icon="ios-trash" type="info" size="small" @click="renameBranch(item)">改名</Button>
						</li>
						<li v-if="branch.current === item" v-show="editBranchVisible">
							<Button icon="ios-trash" type="info" size="small" @click="renameBranch(item)">确认</Button>
						</li>
						<li v-if="branch.current === item" v-show="editBranchVisible">
							<Button icon="ios-close-circle" size="small" @click="editBranchVisible = false">取消</Button>
						</li>
						<li v-if="branch.current !== item">
							<Button icon="md-redo" type="info" size="small" @click="checkout(item)">切换</Button>
						</li>
						<li v-if="branch.current !== item">
							<Button icon="ios-trash" type="error" size="small" @click="removeBranch(item)">删除</Button>
						</li>
					</template>
				</ListItem>
				<ListItem v-show="addBranchVisible">
					<div class="ivu-list-item-meta-content">
						<Input type="text" v-model="newBranchName" placeholder="输入新建的分支名"></Input>
					</div>
					<template slot="action">
						<li>
							<Button icon="md-checkmark-circle" type="success" size="small" @click="createBranch()">建立分支</Button>
						</li>
						<li>
							<Button icon="ios-close-circle" size="small" @click="addBranchVisible = false">取消</Button>
						</li>
					</template>
				</ListItem>
			</List>
			<div style="text-align: center;margin-top: 10px">
				<strong v-show="addBranchVisible">将自动切换到新分支</strong>
				<Button v-show="!addBranchVisible" icon="md-add" type="success" @click="addBranchVisible = true">添加分支</Button>
			</div>
		</div>
	</Modal>
</template>

<script>
import http from '../common/services/http'

export default {
	name: "BranchWindow",
	props: {
		visible: Boolean,
		maxHeight: Number
	},
	data() {
		return {
			branch: {
				current: '',
				all: []
			},
			modelVisible: this.visible,
			addBranchVisible: false,
			editBranchVisible: false,
			newBranchName: ""
		}
	},
	watch: {
		visible(val) {
			this.modelVisible = val
			if (!this.modelVisible) {
				this.$emit('refreshStatus')
			}
		},
		addBranchVisible() {
			this.newBranchName = ""
		}
	},
	methods: {
		async refresh() {
			this.addBranchVisible = false
			this.editBranchVisible = false
			this.branch = await http.getJSON("branch")
			this.$emit('update:visible', this.modelVisible)
			if (!this.modelVisible) {
				this.$root.$emit("refreshStatus")
			}
		},
		async checkout(item) {
			await http.post("checkout", { item })
			this.refresh()
		},
		async removeBranch(item) {
			await http.post("checkout", { item, control: 'remove' })
			this.refresh()
		},
		async createBranch() {
			await http.post("checkout", { item: this.newBranchName, control: 'create' })
			this.refresh()
		},
		async renameBranch(oldBranchName) {
			if (!this.editBranchVisible) {
				this.newBranchName = oldBranchName
				this.editBranchVisible = true
				return
			}
			await http.post("checkout", { item: oldBranchName + ":=" + this.newBranchName, control: 'rename' })
			this.refresh()
		}
	}
}

</script>
