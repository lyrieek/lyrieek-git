<template>
	<div style="height: 100%">
		<Row style="height: 100%">
			<Col span="3" :style="{ 'border-right': '1px solid #504c4c' }">
			<ProjectList :project="currentProject" @projectUpdated="projectUpdated" />
			</Col>
			<Col span="17" :style="{ padding: '10px' }">
			<WorkPath :project="currentProject" :maxHeight="maxHeight" />
			<GitConfig />
			<GitLog />
			<GitCommit />
			<Divider />
			<ToolButtons :maxHeight="maxHeight" />
			<Divider />
			<BottomBar :project="currentProject" />
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
import StatusPanel from './StatusPanel.vue'
import WorkPath from './WorkPath.vue'
import GitConfig from './GitConfig.vue'
import GitCommit from './GitCommit.vue'
import BottomBar from './BottomBar.vue'

export default {
	name: "GitList",
	components: {
		ProjectList,
		ToolButtons,
		GitConfig,
		GitLog,
		GitCommit,
		StatusPanel,
		WorkPath,
		BottomBar
	},
	data() {
		return {
			configModal: false,
			currentProject: {
				index: 0,
				name: "Loading..."
			},
			maxHeight: window.innerHeight - 300
		}
	},
	methods: {
		refreshStatus() {
			this.$root.$emit("refreshStatus")
		},
		projectUpdated(project) {
			this.currentProject = project
		}
	}
}

</script>
