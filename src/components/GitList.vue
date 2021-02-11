<template>
	<div style="height: 100%">
		<Row style="height: 100%">
			<Col span="3" :style="{ 'border-right': '1px solid #504c4c' }">
			<div style="padding: 20px">
				<ul class="project-list-view">
					<li class="project-item-label" v-for="item of projects" :key="item.projectPath" @click="changeProject(item)" :style="{background: item.selected ? '#efebeb' : 'transparent'}">
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
			<WorkPath :projectName="currentProject.name" />
			<GitConfig />
			<GitLog />
			<Input v-model="commitInfo.message" maxlength="100" @on-blur="commitInfoUpdate()" @on-focus="refreshStatus()" :rows=3 show-word-limit type="textarea" placeholder="Commit message" style="width: 100%" />
			<div style="text-align: right">
				<DatePicker v-model="commitInfo.date" type="date" placeholder="Commit date" style="width: 120px"></DatePicker>
				<TimePicker v-model="commitInfo.time" format="HH:mm:ss" placeholder="Commit time" style="width: 120px"></TimePicker>
				<Input v-model="commitInfo.zone" placeholder="Time zone" style="width: 85px" />
				<Button shape="circle" icon="md-refresh" @click="commitInfoUpdate()" :disabled="commitInfo.pin" style="margin-left: 2px"></Button>
				<Tooltip placement="bottom">
					<CheckboxGroup>
						<Checkbox label="Pin" border style="margin-left: 2px;padding: 0px 0px 0px 5px;margin-right:0px" v-model="commitInfo.pin"></Checkbox>
					</CheckboxGroup>
					<div slot="content">
						<Icon type="ios-outlet-outline" />Synchronize real time
					</div>
				</Tooltip>
			</div>
			<div style="margin-top: 10px; text-align: right">
				<Button type="success" @click="commit()">
					<Icon type="md-checkmark" />Commit</Button>
			</div>
			<Divider />
			<ToolButtons />
			<Divider />
			<div class="toolbar-buttons">
				<Button type="primary" @click="configModal = true">修改配置</Button>
				<Button type="success" @click="refreshStatus()">
					<Icon type="md-refresh" />刷新</Button>
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
import moment from 'moment'
import ToolButtons from './ToolButtons'
import GitLog from './GitLog'
import http from '../common/services/http'
import StatusPanel from './StatusPanel.vue'
import WorkPath from './WorkPath.vue'
import GitConfig from './GitConfig.vue'

export default {
	name: "GitList",
	components: {
		ToolButtons,
		GitConfig,
		GitLog,
		StatusPanel,
		WorkPath
	},
	data() {
		return {
			configModal: false,
			commitInfo: {
				message: "",
				date: null,
				time: null,
				zone: null,
				pin: false
			},
			currentProject: {
				index: 0,
				name: "Lyrieek-Git",
				notPushCommits: 0
			},
			projects: []
		};
	},
	async mounted() {
		await this.getProjects()
		this.refreshStatus()
		this.$root.$on("statusUpdated", async (e) => {
			await this.getProjects()
			this.currentProject.notPushCommits = e.notPushCommits
			// this.$nextTick().then(() => {
			// 	if (!this.projects[this.currentProject.index]) {
			// 		return
			// 	}
			// 	this.projects[this.currentProject.index].notPushCommits = e.notPushCommits
			// })
		})
	},
	methods: {
		async refreshStatus() {
			this.$root.$emit("refreshStatus")
		},
		async changeProject(e) {
			this.currentProject.index = Number(e.index)
			await http.text("cd?dir=" + e.projectPath)
			this.refreshStatus()
		},
		async getProjects() {
			const _projects = await http.getJSON("projects")
			if (!_projects.length) {
				return this.$message.error("Please check the configuration")
			}
			for (const index in _projects) {
				_projects[index].index = index
				_projects[index].name = _projects[index].projectPath.split(/\\|\//).pop()
				if (Number(index) === this.currentProject.index) {
					_projects[index].selected = true
					this.currentProject.name = _projects[index].name
				}
			}
			this.projects = _projects;
		},
		updateConfig() {
			console.log("update");
		},
		commitInfoUpdate() {
			if (this.commitInfo.pin || !this.commitInfo.message) {
				return
			}
			this.commitInfo.date = new Date()
			this.commitInfo.time = moment().format('HH:mm:ss')
			this.commitInfo.zone = "+0800"
			this.commitInfo.pin = true
		},
		commit() {
			fetch("http://localhost:3516/commit", {
				method: 'POST',
				body: JSON.stringify({
					message: this.commitInfo.message,
					date: moment(this.commitInfo.date).format('YYYY-MM-DD') + "T" + this.commitInfo.time + this.commitInfo.zone
				})
			}).then((e) => {
				if (!e.ok) {
					return e.json().then((res) => {
						this.$Notice.error({
							title: 'Commit',
							desc: `<div style="white-space: pre;">${res.stdout}</div>`,
							duration: 0
						});
					});
				}
				e.text().then((res) => {
					this.$root.$emit("commit")
					this.refreshStatus()
					this.$Notice.success({
						title: 'Commit',
						desc: res
					});
					this.commitInfo = {}
				});
			});
		}
	}
}

</script>
