<template>
	<div style="height: 100%">
		<Row style="height: 100%">
			<Col span="3" :style="{ 'border-right': '1px solid #504c4c' }">
			<ProjectList :project="currentProject" />
			</Col>
			<Col span="17" :style="{ padding: '10px' }">
			<WorkPath :project="currentProject" :maxHeight="maxHeight" />
			<GitConfig />
			<GitLog />
			<GitCommit />
			<Divider />
			<ToolButtons :maxHeight="maxHeight" />
			<Divider />
			<div class="toolbar-buttons">
				<Button type="primary" @click="refreshStatus()" ghost>
					<Icon type="md-refresh" />刷新</Button>
				<Button type="primary" @click="openFolder()" ghost>
					<Icon type="ios-folder-open" />打开文件夹</Button>
			</div>
			<div class="toolbar-buttons" style="margin-top: 10px">
				<Button type="primary" @click="configModal = true">
					<Icon type="md-settings" />修改配置</Button>
			</div>
			<Modal v-model="configModal" title="修改" @on-ok="updateConfig">
				<Form :label-width="80">
					<FormItem label="项目名">
						<Input type="text" v-model="currentProject.name"></Input>
					</FormItem>
				</Form>
			</Modal>
			<Divider />
			</Col>
			<Col span="4" :style="{ 'border-left': '1px solid #504c4c' }">
			<StatusPanel />
			</Col>
		</Row>
	</div>
</template>

<style>
ul {
	list-style-type: none;
}

.preview-text {
	white-space: pre-wrap;
	text-overflow: ellipsis;
	overflow: hidden;
}

</style>

<script>
import ProjectList from './ProjectList.vue'
import ToolButtons from './ToolButtons'
import GitLog from './GitLog'
import http from '../common/services/http'
import StatusPanel from './StatusPanel.vue'
import WorkPath from './WorkPath.vue'
import GitConfig from './GitConfig.vue'
import GitCommit from './GitCommit.vue'

export default {
	name: "GitList",
	components: {
		ProjectList,
		ToolButtons,
		GitConfig,
		GitLog,
		GitCommit,
		StatusPanel,
		WorkPath
	},
	data() {
		return {
			configModal: false,
			currentProject: {
				index: 0,
				name: "Loading..."
			},
			maxHeight: window.innerHeight - 300,
			searchProjectText: ""
		}
	},
	methods: {
		async refreshStatus() {
			this.$root.$emit("refreshStatus")
		},
		updateConfig() {
			console.log("update")
		},
		openFolder() {
			http.getJSON("explorer")
		}
	}
}

</script>
