<template>
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
</template>

<style>
.project-item-label:hover {
	background: rgb(197, 211, 224);
}

.add-project-item:hover {
	font-weight: bold;
	cursor: pointer;
}

.project-list-view {
	margin-top: 10px;
}

.project-list-view>li {
	padding: 7px 12px;
	cursor: pointer;
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
		this.$root.$on("statusUpdated", async (callback) => {
			await this.getProjects()
			typeof callback === 'function' && callback()
		})
		await this.getProjects()
		this.refreshStatus()
	},
	methods: {
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
