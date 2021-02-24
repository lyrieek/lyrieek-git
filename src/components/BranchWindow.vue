<template>
	<Modal title="所有分支" v-model="modelVisible" @on-visible-change="refresh">
		<div :style="{'max-height': maxHeight + 'px',overflow: 'auto'}">
			<List border size="small" v-for="item in branch.all" :key="item">
				<ListItem :style="branch.current === item ? {'font-weight': 'bold'} : {}">{{ item }}</ListItem>
			</List>
		</div>
	</Modal>
</template>

<script>
import http from '../common/services/http'

export default {
	name: "BranchWindow",
	props: {
		visible: Boolean,
		maxHeight: Number
	},
	data() {
		return {
			branch: {
				current: '',
				all: []
			},
			modelVisible: this.visible
		}
	},
	watch: {
		visible(val) {
			this.modelVisible = val
		}
	},
	methods: {
		async refresh() {
			this.branch = await http.getJSON("branch")
			this.$emit('update:visible', this.modelVisible)
		},
		async select(item) {
			if (this.$props.recall) {
				await http.post("recallItem", { item: item.fileName })
			} else {
				await http.post("addItem", { item: item.fileName })
			}
			this.$root.$emit("refreshStatus")
		}
	}
}

</script>
