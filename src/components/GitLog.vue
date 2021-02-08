<template>
	<div style="margin: 10px 0px">
		<div>
			<strong>Log:</strong>
			<Button size="small" @click="gitLogModalDisplay=true">查看全部</Button>
			<Icon type="ios-information-circle-outline" />
			<span>双击复制 commit message</span>
		</div>
		<ul style="list-style: none;">
			<li v-for="item of logArr.slice(0, 5)" :key="item.commit">
				<span class="git-commit-label" @dblclick="dbclickCommitInfo(item.msg)">{{item.msg}}</span>
				<span style="padding-left: 30px">{{displayDate(item.date)}}</span>
			</li>
			<li v-if="!logArr.length">
				<span>No records were found!</span>
			</li>
		</ul>
		<Modal v-model="gitLogModalDisplay" title="Log" width="570">
			<List class="git-log-list" :header="item.commit" :footer="displayDate(item.date)" border size="small" v-for="item of logArr" :key="item.commit">
				<ListItem class="git-commit-label">{{item.msg}}</ListItem>
			</List>
			<List class="git-log-list" border v-show="!logArr.length">
				<ListItem>No records were found!</ListItem>
			</List>
			<div style="text-align: center; margin-top:2px;">
				<Button @click="gitLogPrefix()" shape="circle" icon="ios-arrow-back" :disabled="page === 0">上一页</Button>
				<Button @click="gitLogForward()" shape="circle" icon="ios-arrow-forward" :disabled="logArr.length !== pageSize">下一页</Button>
			</div>
		</Modal>
	</div>
</template>

<style>
.git-log-list>div {
	padding: 3px 16px !important;
}

.git-log-list .ivu-list-footer {
	font-weight: bold;
	text-align: right;
}

.git-log-list .ivu-list-item {
	padding-top: 3px !important;
	padding-bottom: 3px !important;
}

.git-commit-label {
    text-decoration: underline;
	cursor: pointer;
	padding: 0px 12px;
    /* user-select: none; */
}

.git-commit-label:hover {
	font-weight: bold;
	padding: 0px 5px;
}

</style>

<script>
import moment from 'moment'
import http from '../common/services/http'

export default {
	name: "GitLog",
	data: () => ({
		logArr: [],
		gitLogModalDisplay: false,
		pageSize: 7,
		page: 1
	}),
	async mounted() {
		this.refreshLog()
		this.$root.$on("commit", this.refreshLog)
		this.$root.$on("refreshStatus", this.refreshLog)
	},
	methods: {
		dbclickCommitInfo(e) {
			let transfer = document.createElement('input');
			document.body.appendChild(transfer);
			transfer.value = e;
			// transfer.style.display = 'none';
			// transfer.disabled = 'disabled';
			transfer.focus();
			transfer.select();
			document.execCommand('copy');
			transfer.blur();
			console.log('复制成功');
			document.body.removeChild(transfer);
		},
		async refreshLog(skip) {
			if (skip < 0) {
				this.$Message.info('没有上一页')
				return
			}
			this.page = skip || 0
			skip = skip * this.pageSize
			this.logArr = await http.getJSON(`log?skip=${skip}&size=${this.pageSize}`)
		},
		displayDate(date) {
			const unixDate = date.replace(/^Date: +/, '').split(' ')[0]
			return moment(unixDate, 'X').format('YYYY-MM-DDTHH:mm:ssZZ')
		},
		async gitLogPrefix() {
			this.refreshLog(this.page - 1)
		},
		async gitLogForward() {
			this.refreshLog(this.page + 1)
		}
	}
}

</script>
