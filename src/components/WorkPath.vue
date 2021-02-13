<template>
	<div class="git-work-url">
		<h2>{{ project.name }}
			<div @click="openBranchWin()" class="git-branch-label ivu-tag ivu-tag-gold ivu-tag-checked">
				<span class="ivu-tag-text">{{ project.branch }}</span>
			</div>
		</h2>
		<span @click="refresh()">工作目录:</span>
		<span @click="currentPwdModal = true" class="pwd" v-text="currentPwd"></span>
		<div style="display: flex;flex-wrap: wrap">
			<div>
				<Tag color="gold" v-show="project.lang">{{ project.lang }}</Tag>
			</div>
			<div v-for="item in project.tag">
				<Tag color="default">{{ item }}</Tag>
			</div>
			<div v-for="item in project.languages">
				<Tag color="purple">{{ item }}</Tag>
			</div>
			<div>
				<Button icon="ios-add" type="dashed" size="small" @click="addTag()">添加标签</Button>
			</div>
		</div>
		<Modal v-model="currentPwdModal" title="切换工作目录" :footer-hide=true width=570>
			<Input type="text" v-model="currentPwd"></Input>
			<Table class="cwd-switch-files" size="small" :height="maxHeight" :columns="fileColumns" :data="fileData" @on-row-click="selectItem"></Table>
		</Modal>
		<Modal v-model="previewFileModal">
			<div class="preview-text">{{previewFileText}}</div>
			<Icon type="ios-more" />
		</Modal>
		<Modal title="所有分支" v-model="branchModal">
			<div :style="{'max-height': maxHeight + 'px',overflow: 'auto'}">
				<List border size="small" v-for="item in branch.all" :key="item">
					<ListItem :style="branch.current === item ? {'font-weight': 'bold'} : {}">{{ item }}</ListItem>
				</List>
			</div>
		</Modal>
	</div>
</template>

<style>
.git-branch-label {
	display: inline;
	margin-left: 15px;
	cursor: pointer;
}

.git-work-url {
	margin: 10px;
	font-size: 16px;
}

.git-work-url>h2 {
	font-weight: bold;
}

.git-work-url>.pwd {
	font-weight: bold;
	margin-left: 5px;
	padding: 3px;
	border: 1px solid gray;
	cursor: pointer;
}

.cwd-switch-files .ivu-table-tbody>tr {
	cursor: pointer;
}

.preview-file-name {
	font-weight: bold;
	font-size: 14px;
}

</style>

<script>
import http from '../common/services/http'

export default {
	name: "WorkPath",
	props: {
		project: {
			name: String,
			tag: Array
		},
		maxHeight: Number
	},
	data: () => ({
		currentPwd: "",
		previewFileText: "",
		currentPwdModal: false,
		previewFileModal: false,
		branchModal: false,
		branch: {
			current: '',
			all: []
		},
		fileColumns: [{
			title: 'Name',
			key: 'name',
			className: 'preview-file-name',
			resizable: true,
			render(createElement) {
				return createElement('span', [createElement('Icon', {
					attrs: { type: Number(this.row.size) ? 'ios-document-outline' : 'md-folder' }
				}), createElement('span', this.row.name)])
			}
		}, {
			title: 'Role',
			key: 'role',
			width: 100
		}, {
			title: 'Size',
			key: 'size',
			width: 85
		}, {
			title: 'Date',
			key: 'date',
			width: 140
		}],
		fileData: []
	}),
	async mounted() {
		this.refresh()
		this.fileData = await http.getJSON("ls")
		this.$root.$on("refreshStatus", this.refresh)
	},
	methods: {
		async refresh() {
			this.currentPwd = "Loading..."
			this.currentPwd = await http.text("pwd")
		},
		async changePath() {},
		async selectItem(e) {
			if (Number(e.size)) {
				this.previewFileText = await http.text("viewFile?file=" + e.name)
				this.previewFileModal = true
				return
			}
			this.fileData = await http.getJSON("ls")
			await http.text("cd?dir=" + e.name)
			this.refresh()
		},
		async openBranchWin() {
			this.branch = await http.getJSON("branch")
			this.branchModal = true
		},
		addTag() {

		}
	}
}

</script>
