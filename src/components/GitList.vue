<template>
	<div style="height: 100%">
		<Row style="height: 100%">
			<Col span="3" :style="{ 'border-right': '1px solid #504c4c' }">
			<div style="padding: 20px">
				<List>
					<ListItem class="project-item-label">
						<ListItemMeta :title="currentProject.name"></ListItemMeta>
						<Badge :count="10" slot="extra" />
					</ListItem>
					<ListItem class="add-project-item">
						<div style="text-align: center; width: 100%">
							<Icon type="md-add" />
							添加新项目
						</div>
					</ListItem>
				</List>
			</div>
			</Col>
			<Col span="17" :style="{ padding: '10px' }">
			<div class="git-work-url">
				<h2>{{ currentProject.name }}</h2>
				<span>工作目录:</span>
				<span style="padding: 3px" v-text="currentProject.pwd"></span>
			</div>
			<ul class="config-list">
				<li style="border-bottom: 1px solid black">
					<Icon type="md-build" />Git Config</li>
				<li>
					<span>user.name</span>
					<span v-text="currentProject.userName"></span>
				</li>
				<li>
					<span>user.email</span>
					<span v-text="currentProject.userEmail"></span>
				</li>
			</ul>
			<Input v-model="commitInfo.message" maxlength="100" @on-blur="commitInfoUpdate()" :rows=3 show-word-limit type="textarea" placeholder="Commit message" style="width: 100%" />
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
				<Button type="success">
					<Icon type="md-refresh" />刷新</Button>
			</div>
			<Modal v-model="configModal" title="修改" @on-ok="updateConfig">
				<Form :label-width="80">
					<FormItem label="项目名">
						<Input type="text" v-model="currentProject.name"></Input>
					</FormItem>
					<FormItem label="路径">
						<Input type="text" v-model="currentProject.pwd"></Input>
					</FormItem>
				</Form>
			</Modal>
			<Divider />
			</Col>
			<Col span="4" :style="{ 'border-left': '1px solid #504c4c' }">
			<Split mode="vertical">
				<div slot="top" class="git-area work-area">
					<Divider>工作区</Divider>
					<ul class="file-list">
						<li v-for="item of workChanges" :key="item.fileName">
							<span>{{ item.fileName }}</span>
						</li>
					</ul>
				</div>
				<div slot="bottom" class="git-area stage-area">
					<Divider>暂存区</Divider>
					<ul class="file-list">
						<li v-for="item of indexChanges" :key="item.fileName">
							<span>{{ item.fileName }}</span>
						</li>
					</ul>
				</div>
			</Split>
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

	.git-area {
		margin: 10px;
	}

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
	}

	.config-list {
		list-style-type: none;
		padding: 10px;
		border: 1px solid teal;
		border-radius: 5px;
		width: auto;
	}

	.config-list>li>span:first-child {
		width: 100px;
		display: inline-block;
		text-align: right;
	}

	.config-list>li>span:first-child::after {
		content: ":";
	}

	.config-list>li>span:last-child {
		padding-left: 3px;
	}

	.file-list {
		list-style-type: none;
	}

	.file-list>li {
		line-height: 27px;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.file-list>li:hover {
		line-height: 25px;
		border: 1px solid #504c4c;
		cursor: pointer;
		background: #fdecd3;
		font-weight: bold;
	}

	.toolbar-buttons>* {
		margin-right: 10px;
	}

</style>

<script>
	import moment from 'moment';
	import ToolButtons from './ToolButtons';

	export default {
		name: "GitList",
		components: {
			ToolButtons
		},
		data() {
			return {
				indexChanges: [],
				workChanges: [],
				configModal: false,
				commitInfo: {
					message: "",
					date: null,
					time: null,
					zone: null,
					pin: false
				},
				currentProject: {
					name: "Lyrieek-Git",
					pwd: "Unselected",
				},
			};
		},
		async mounted() {
			const status = await (await fetch("http://localhost:3516/status")).json();
			const pwd = await (await fetch("http://localhost:3516/pwd")).text();
			const config = await (await fetch("http://localhost:3516/config")).json();
			// await this.$nextTick()
			this.currentProject.pwd = pwd;
			this.currentProject.userName = config.userName
			this.currentProject.userEmail = config.userEmail
			this.indexChanges = status.changes.filter(
				(f) => !f.type.startsWith(" ")
			);
			this.workChanges = status.changes.filter((f) => f.type.startsWith(" "));
		},
		methods: {
			updateConfig() {
				console.log("update");
			},
			commitInfoUpdate() {
				if (this.commitInfo.pin) {
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
						this.$Notice.success({
							title: 'Commit',
							desc: res
						});
					});
				});
			}
		},
	};

</script>
