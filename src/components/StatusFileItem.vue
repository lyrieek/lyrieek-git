<template>
	<ul class="file-list">
		<li v-for="item of list" :key="item.fileName" @mouseenter="item.selected = true" @mouseleave="item.selected = false">
			<span>{{ item.fileName }}</span>
			<span class="status-control-btn" v-show="item.selected" @click="select(item)">
				<Icon :type="icon" /></span>
		</li>
	</ul>
</template>

<style>
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

.status-control-btn {
	float: right;
	padding-right: 10px;
}

.status-control-btn:hover {
	font-size: 16px;
}

</style>

<script>
import http from '../common/services/http'

export default {
	name: "StatusFileItem",
	props: {
		list: Array,
		icon: {
			type: String,
			default: "md-add-circle"
		},
		recall: Boolean
	},
	methods: {
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
