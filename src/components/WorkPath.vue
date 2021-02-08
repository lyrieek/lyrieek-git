<template>
	<div class="git-work-url">
		<h2>{{ projectName }}</h2>
		<span>工作目录:</span>
		<span @click="currentPwdModal = true" style="padding: 3px" v-text="currentPwd"></span>
		<Modal v-model="currentPwdModal" title="切换工作目录" :footer-hide=true width=570>
			<Input type="text" v-model="currentPwd"></Input>
			<Table class="cwd-switch-files" size="small" :height="tableHeight" :columns="fileColumns" :data="fileData" @on-row-click="selectItem"></Table>
		</Modal>
		<Modal v-model="previewFileModal">
			<div class="preview-text">{{previewFileText}}</div>
			<Icon type="ios-more" />
		</Modal>
	</div>
</template>

<style>
.git-work-url {
	margin: 10px;
	font-size: 16px;
}

.git-work-url>h2 {
	font-weight: bold;
}

.git-work-url>span:last-child {
	font-weight: bold;
	margin-left: 5px;
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
		projectName: String,
	},
	data: () => ({
		currentPwd: "",
		previewFileText: "",
		currentPwdModal: false,
		previewFileModal: false,
		tableHeight: window.innerHeight - 300,
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
		this.$root.$on("refreshStatus", this.refresh)
	},
	methods: {
		async refresh() {
			this.currentPwd = await http.text("pwd")
			this.fileData = await http.getJSON("ls")
		},
		async changePath() {},
		async selectItem(e) {
			if (Number(e.size)) {
				this.previewFileText = await http.text("viewFile?file=" + e.name)
				this.previewFileModal = true
				return
			}
			await http.text("cd?dir=" + e.name)
			this.refresh()
		}
	}
}

</script>
