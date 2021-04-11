<template>
	<ul class="file-list">
		<li v-for="item of list" :key="item.fileName" @mouseenter="setItem(item, true)" @mouseleave="setItem(item, false)">
			<Tooltip placement="bottom" style="width: 100%;">
				<span class="git-file-name">{{ getPathTree(item.fileName).pop() }}</span>
				<span class="status-control-btn">
					<span v-show="item.selected" @click="diff(item.fileName)">
						<Icon type="ios-eye" /></span>
					<span v-show="item.selected" @click="select(item)">
						<Icon :type="icon" /></span>
				</span>
				<div slot="content" style="white-space: pre;line-clamp: 10;text-overflow: ellipsis;" v-html="displayPath(item.fileName)">
				</div>
			</Tooltip>
		</li>
	</ul>
</template>

<style>
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

.git-file-name {
	width: 75%;
	overflow: hidden;
	display: inline-block;
	text-overflow: ellipsis;
	white-space: nowrap;
	word-break: break-all;
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
		},
		displayPath(path) {
			return path.replace(/\//g, '<br>/')
		},
		getPathTree(path) {
			return path.split(/\//g)
		},
		setItem(item, val) {
			this.$set(item, 'selected', val)
		}
	}
}

</script>
