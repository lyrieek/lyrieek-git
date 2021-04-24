<template>
	<div style="padding: 10px;">
		<Input suffix="ios-search" v-model="searchProjectText" placeholder="Filter..." style="width: auto" />
		<ul class="project-list-view">
			<li class="project-item-label" v-show="!searchProjectText || ~item.name.indexOf(searchProjectText)" v-for="item of projects" :key="item.projectPath" @click="changeProject(item)" :class="item.selected ? 'project-item-select' : ''">
				<strong style="font-size: 15px">{{item.name}}</strong>
				<Badge :count="item.notPushCommits" style="float: right" slot="extra" />
			</li>
			<li class="add-project-item">
				<div style="text-align: center; width: 100%">
					<Icon type="md-add" />
					{{ $t("message.addNewProject") }}
				</div>
			</li>
		</ul>
	</div>
</template>

<style>
.project-item-label:hover {
	background-color: #efebeb;
}

.project-item-select {
	background-color: rgb(197, 211, 224);
	cursor: pointer;
}

.add-project-item:hover {
	font-weight: bold;
	cursor: pointer;
}

.project-list-view {
	margin-top: 10px;
}

.project-list-view>li {
	padding: 6px 1px 6px 2px;
	cursor: default;
}

</style>

<script>
import http from '../common/services/http'

export default {
	name: "ProjectList",
	props: {
		project: {
			index: Number,
			name: String
		}
	},
	data: () => ({
		projects: [],
		projectsCache: null,
		searchProjectText: "",
		currentProject: {
			index: 0,
			name: "Loading",
			selected: false
		}
	}),
	async created() {
		this.currentProject = this.project
		await this.getProjects()
		this.refreshStatus()
		this.$root.$on("statusUpdated", async (callback) => {
			await this.getProjects()
			typeof callback === 'function' && callback()
		})
	},
	methods: {
		async changeProject(e) {
			this.currentProject.index = Number(e.index)
			this.projectsCache = await http.postData("cd", { project: e.name })
			await this.getProjects()
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
			if (!this.currentProject.selected) {
				this.changeProject(_projects[0])
				this.$Message.info('没有默认选中项，自动选中第一个项目' + this.currentProject.name)
			}
			this.projects = _projects
			this.projectsCache = null
			this.$emit("projectUpdated", this.currentProject)
		},
		refreshStatus() {
			this.$root.$emit("refreshStatus")
		}
	}
}

</script>
