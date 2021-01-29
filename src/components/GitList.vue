<template>
	<div style="height:100%">
		<Row style="height:100%">
			<Col span="3" :style="{'border-right' : '1px solid #504c4c'}">
			<div style="padding: 20px">
				<List>
					<ListItem class="project-item-label">
						<ListItemMeta :title="currentProject.name"></ListItemMeta>
						<Badge :count="10" slot="extra" />
					</ListItem>
					<ListItem class="add-project-item">
						<div style="text-align: center;width: 100%">
							<Icon type="md-add" />
							添加新项目
						</div>
					</ListItem>
				</List>
			</div>
			</Col>
			<Col span="18" :style="{'padding' : '10px'}">
			<div class="git-work-url">
				<h2>{{currentProject.name}}</h2>
				<span>工作目录:</span>
				<span style="padding: 3px;" v-text="currentProject.pwd"></span>
			</div>
			<Input v-model="commitMessage" maxlength="100" show-word-limit type="textarea" placeholder="Commit message" style="width: 100%" />
			<div style="margin-top:10px;text-align: right">
				<Button type="success">
					<Icon type="md-checkmark" />Commit</Button>
			</div>
			<Divider />
			<div id="main-control-button">
				<ButtonGroup>
					<Button type="success">
						<Icon type="md-arrow-round-up" />Push</Button>
					<Button type="info">
						<Icon type="md-arrow-round-down" />Pull</Button>
				</ButtonGroup>
				<Button type="info">
					<Icon type="md-arrow-round-down" />Fetch</Button>
			</div>
			<Divider />
			<Button type="primary" @click="configModal = true">修改配置</Button>
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
			<Col span="3" :style="{'border-left' : '1px solid #504c4c'}">
			<Split mode="vertical">
				<div slot="top" class="git-area work-area">
					<Divider>工作区</Divider>
					<ul class="file-list">
						<li v-for="item of workChanges" :key="item.fileName">{{item.fileName}}</li>
					</ul>
				</div>
				<div slot="bottom" class="git-area stage-area">
					<Divider>暂存区</Divider>
					<ul class="file-list">
						<li v-for="item of indexChanges" :key="item.fileName">{{item.fileName}}</li>
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

.file-list {
	list-style-type: none;
}

.file-list>li {
	line-height: 27px;
}

.file-list>li:hover {
	line-height: 25px;
	border: 1px solid #504c4c;
	cursor: pointer;
	background: #fdecd3;
	font-weight: bold;
}

#main-control-button>* {
	margin-right: 10px;
}

</style>

<script>
export default {
	name: 'GitList',
	data() {
		return {
			indexChanges: [],
			workChanges: [],
			configModal: false,
			commitMessage: '',
			currentProject: {
				name: 'Lyrieek-Git',
				pwd: 'Unselected'
			}
		}
	},
	mounted() {
		fetch('http://localhost:3516/status').then((e) => {
			e.json().then((data) => {
				this.$nextTick().then(() => {
					this.indexChanges = data.changes.filter((f) => !f.type.startsWith(' '))
					this.workChanges = data.changes.filter((f) => f.type.startsWith(' '))
				})
			})
		})
		fetch('http://localhost:3516/pwd').then((e) => {
			e.text().then((pwd) => {
				this.$nextTick().then(() => {
					this.currentProject.pwd = pwd
				})
			})
		})
	},
	methods: {
		updateConfig() {
			console.log('update');
		}
	}
}

</script>
