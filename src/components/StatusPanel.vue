<template>

	<div style="height: 100%">
		<div style="height: 100%">
			<Split mode="vertical">
				<div slot="top" style="height: 100%" class="git-area work-area">
					<Split mode="vertical">
						<div slot="top" class="git-area stage-area">
							<div>
								<Button size="small" @click="refreshStatus()" icon="md-refresh">刷新</Button>
								<Button size="small" @click="addAll()" icon="md-add">Add .</Button>
								<Button size="small" @click="undo()" icon="md-return-left">Undo</Button>
							</div>
							<Divider>新文件</Divider>
							<ul class="file-list">
								<li v-for="item of changesList.untracked" :key="item.fileName">
									<span>{{ item.fileName }}</span>
								</li>
							</ul>
						</div>
						<div slot="bottom" class="git-area work-area">
							<Divider>工作区</Divider>
							<ul class="file-list">
								<li v-for="item of changesList.work" :key="item.fileName">
									<span>{{ item.fileName }}</span>
								</li>
							</ul>
						</div>
					</Split>
				</div>
				<div slot="bottom" class="git-area stage-area">
					<Divider>暂存区</Divider>
					<ul class="file-list">
						<li v-for="item of changesList.index" :key="item.fileName">
							<span>{{ item.fileName }}</span>
						</li>
					</ul>
				</div>
			</Split>
		</div>
	</div>
</template>

<style>
.git-area {
	margin: 10px;
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

</style>

<script>
import http from '../common/services/http'

export default {
	name: "StatusPanel",
	data: () => ({
		changesList: {
			index: [],
			work: [],
			untracked: []
		}
	}),
	async mounted() {
		this.$root.$on("refreshStatus", this.refreshStatus)
		this.refreshStatus()
	},
	methods: {
		async refreshStatus() {
			const status = await http.getJSON("status");
			this.$root.$emit("statusUpdated", status)
			this.changesList.index = status.changes.filter(
				(f) => !f.type.startsWith(" ") && !f.type.startsWith("??"));
			this.changesList.untracked = status.changes.filter(
				(f) => f.type.startsWith("??"));
			this.changesList.work = status.changes.filter(
				(f) => f.type.startsWith(" "));
		},
		async addAll() {
			await http.text("addAll");
			this.refreshStatus()
		},
		async undo() {
			await http.text("undo");
			this.refreshStatus()
		}
	}
}

</script>
