<template>

	<div style="height: 100%" @mouseleave="refreshStatus">
		<div style="height: 100%">
			<Split v-model="externalSplit" mode="vertical">
				<div slot="top" style="height: 100%">
					<Split v-model="unindexedSplit" mode="vertical">
						<div slot="top" class="git-area">
							<div>
								<Button size="small" @click="refreshStatus()" icon="md-refresh">刷新</Button>
								<Button size="small" @click="addAll()" icon="md-add">Add .</Button>
								<Button size="small" @click="undo()" icon="md-return-left">Undo</Button>
							</div>
							<Divider>新文件</Divider>
							<StatusFileItem :list="changesList.untracked" />
						</div>
						<div slot="bottom" class="git-area">
							<Divider>工作区</Divider>
							<StatusFileItem :list="changesList.work" />
						</div>
					</Split>
				</div>
				<div slot="bottom" class="git-area">
					<Divider>暂存区</Divider>
					<StatusFileItem recall :list="changesList.index" icon="md-arrow-round-up" />
				</div>
			</Split>
		</div>
	</div>
</template>

<style>
.git-area {
	margin-left: 10px;
}

.ivu-split-pane {
    overflow: auto;
    margin-bottom: 10px;
}

</style>

<script>
import http from '../common/services/http'
import StatusFileItem from './StatusFileItem'

export default {
	name: "StatusPanel",
	components: {
		StatusFileItem
	},
	data: () => ({
		externalSplit: 0.65,
		unindexedSplit: 0.5,
		changesList: {
			index: [],
			work: [],
			untracked: []
		},
		statusChangeCount: 0
	}),
	mounted() {
		this.$root.$on("refreshStatus", this.refreshStatus)
	},
	methods: {
		async refreshStatus() {
			const status = await http.getJSON("status")
			if (this.statusChangeCount !== status.changes.length) {
				this.$root.$emit("statusUpdated")
				this.statusChangeCount = status.changes.length
			}
			this.changesList.untracked = status.changes.filter(
				(f) => f.type.startsWith("??"))
			this.changesList.work = status.changes.filter(
				(f) => f.type.substring(1, 2).trim())
			this.changesList.index = status.changes.filter(
				(f) => !f.type.startsWith(" "))
		},
		async addAll() {
			await http.text("addAll")
			this.refreshStatus()
		},
		async undo() {
			await http.text("undo")
			this.refreshStatus()
		}
	}
}

</script>
