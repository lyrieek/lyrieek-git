<template>
	<div style="margin: 10px 0px">
		<div>
			<strong>Log:</strong>
			<Button size="small" @click="gitLogModalDisplay=true">查看全部</Button>
			<Tooltip placement="right">
				<Icon type="ios-information-circle-outline" style="margin-left: 5px" />
				<div slot="content">
					<span>双击commit message将自动复制</span>
				</div>
			</Tooltip>
		</div>
		<ul style="list-style: none;">
			<li v-for="item of logArr.slice(0, 5)" :key="item.commit">
				<span class="git-commit-label" @dblclick="dbclickCommitInfo(item.msg)">
					<Icon v-if="item.isMerge" type="md-git-merge" style="margin-right: 2px" />
					{{item.msg}}
				</span>
				<span style="padding-left: 30px">{{getDateLabel(item.date)}}</span>
			</li>
			<li v-if="!logArr.length">
				<span>No commit were found!</span>
			</li>
		</ul>
		<Modal footer-hide v-model="gitLogModalDisplay" title="Log" width="650" @on-cancel="refreshLog(1)">
			<List class="git-log-list" border size="small">
				<ListItem v-for="item of logArr" :key="item.commit">
					<div style="width: 100%">
						<!-- #0366D6 href text color -->
						<Icon v-if="item.isMerge" type="md-git-merge" size="18" color="#0366D6" style="margin-top: 3px;position: absolute; left: 2px" />
						<Tooltip placement="bottom-end" max-width="480">
							<span class="git-commit-label">{{item.msg}}</span>
							<div slot="content">
								<div>短ID: <strong>{{item.commit.substring(0, 7)}}</strong></div>
								<div>长ID: <span>{{item.commit}}</span></div>
							</div>
						</Tooltip>
						<div class="git-commit-occurrence">
							<Tooltip placement="bottom">
								<strong>{{getAuthorLabel(item.author, 'name')}}</strong>
								<div slot="content">
									<span>{{getAuthorLabel(item.author)}}</span>
								</div>
							</Tooltip>
							<Tooltip placement="right">
								<span>{{getDateLabel(item.date)}}</span>
								<div slot="content">
									<span>{{item.date}}</span>
								</div>
							</Tooltip>
						</div>
					</div>
				</ListItem>
			</List>
			<List class="git-log-list" border v-show="!logArr.length">
				<ListItem>No commit were found!</ListItem>
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
	padding: 2px 3px !important;
}

.git-commit-label {
	text-decoration: underline;
	cursor: pointer;
	/* padding: 0px 12px; */
	/* user-select: none; */
}

.git-commit-label:hover {
	font-weight: bold;
	padding: 0px 5px;
}

.git-commit-occurrence {
	text-align: right;
}

.git-commit-occurrence strong {
	margin-right: 10px;
}

</style>

<script>
import moment from 'moment'
import http from '../common/services/http'
import dateUtil from '../common/services/dateUtil'

export default {
	name: "GitLog",
	data: () => ({
		logArr: [],
		gitLogModalDisplay: false,
		pageSize: 12,
		page: 1
	}),
	async mounted() {
		this.$root.$on("refreshStatus", this.refreshLog)
	},
	methods: {
		dbclickCommitInfo(e) {
			let transfer = document.createElement('input')
			document.body.appendChild(transfer)
			transfer.value = e
			transfer.focus()
			transfer.select()
			document.execCommand('copy')
			transfer.blur()
			console.log('复制成功')
			this.$Message.success('复制成功')
			document.body.removeChild(transfer)
		},
		async refreshLog(skip) {
			if (skip < 0) {
				this.$Message.info('没有上一页')
				return
			}
			this.page = (skip || 0)
			this.logArr = await http.getJSON(`log?skip=${this.page * this.pageSize}&size=${this.pageSize}`)
			this.logArr = this.logArr.map((e) => {
				const unixDate = e.date.replace(/^Date: +/, '').split(' ')[0]
				e.date = moment(unixDate, 'X').format('YYYY-MM-DDTHH:mm:ssZZ')
				return e
			})
			this.$root.$emit("LogRefresh", this.logArr)
		},
		async gitLogPrefix() {
			this.refreshLog(this.page - 1)
		},
		async gitLogForward() {
			this.refreshLog(this.page + 1)
		},
		getDateLabel: dateUtil.getDateLabel,
		getAuthorLabel(author, type) {
			if (type === "name") {
				return author.split(" <")[0]
			}
			return author.replace(/^\S+ </, '').replace(/>$/, '')
		}
	}
}

</script>
