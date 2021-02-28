<template>
	<div style="height: 100%">
		<Row style="height: 100%">
			<Col span="3" :style="{ 'border-right': '1px solid #504c4c' }">
			<div style="padding: 20px">
				<Input suffix="ios-search" v-model="searchProjectText" placeholder="Filter..." style="width: auto" />
				<ul class="project-list-view">
					<li class="project-item-label" v-show="!searchProjectText || ~item.name.indexOf(searchProjectText)" v-for="item of projects" :key="item.projectPath" @click="changeProject(item)" :style="{background: item.selected ? '#efebeb' : 'transparent'}">
						<strong style="font-size: 15px">{{item.name}}</strong>
						<Badge :count="item.notPushCommits" style="float: right" slot="extra" />
					</li>
					<li class="add-project-item">
						<div style="text-align: center; width: 100%">
							<Icon type="md-add" />
							添加新项目
						</div>
					</li>
				</ul>
			</div>
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
.project-item-label:hover {
	background: rgb(197, 211, 224);
}

.add-project-item:hover {
	font-weight: bold;
	cursor: pointer;
}

ul {
	list-style-type: none;
}

.project-list-view {
	margin-top: 10px;
}

.project-list-view>li {
	padding: 7px 12px;
	cursor: pointer;
}

.preview-text {
	white-space: pre-wrap;
	text-overflow: ellipsis;
	overflow: hidden;
}

</style>

<script>
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
				name: "Lyrieek-Git",
				notPushCommits: 0
			},
			projects: [],
			projectsCache: null,
			maxHeight: window.innerHeight - 300,
			searchProjectText: ""
		}
	},
	created() {
		this.$root.$on("statusUpdated", (e) => {
			this.getProjects()
			this.currentProject.notPushCommits = e.notPushCommits
		})
	},
	async mounted() {
		await this.getProjects()
		this.refreshStatus()
	},
	methods: {
		async refreshStatus() {
			this.$root.$emit("refreshStatus")
		},
		async changeProject(e) {
			this.currentProject.index = Number(e.index)
			this.projectsCache = await http.postData("cd", { project: e.name })
			this.refreshStatus()
		},
		async getProjects() {
			let _projects = this.projectsCache
			if (!_projects) {
				_projects = await http.getJSON("projects")
			}
			if (!_projects.length) {
				return this.$message.error("Please check the configuration")
			}
			for (const index in _projects) {
				_projects[index].index = index
				if (_projects[index].selected) {
					this.currentProject = _projects[index]
				}
			}
			this.projects = _projects
			this.projectsCache = null
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
