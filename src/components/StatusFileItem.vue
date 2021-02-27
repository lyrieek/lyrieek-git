<template>
	<ul class="file-list">
		<li v-for="item of list" :key="item.fileName" @mouseenter="item.selected = true" @mouseleave="item.selected = false">
			<span style="width: 75%;
				overflow: hidden;
				display: inline-block;
				text-overflow: ellipsis;">{{ item.fileName }}</span>
			<span class="status-control-btn">
				<span v-show="item.selected" @click="diff(item.fileName)">
					<Icon type="ios-eye" /></span>
				<span v-show="item.selected" @click="select(item)">
					<Icon :type="icon" /></span>
			</span>
		</li>
	</ul>
</template>

<style>
.file-list {
	list-style-type: none;
}

.file-list>li {
	height: 27px;
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
}

.status-control-btn>span {
	padding: 4px 5px;
	font-size: 16px;
}

.status-control-btn>span:hover {
	font-size: 18px;
	padding: 3px 2px;
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
			default: "md-add"
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
		},
		async diff(file) {
			const diffContent = await http.postText("diff", { file })
			this.$GWinBox.info("Diff", diffContent, {
				width: "1200px"
			})
		}
	}
}

</script>
