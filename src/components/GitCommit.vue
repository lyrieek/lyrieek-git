<template>
	<div>
		<GitEmoji @on-select="selectEmoji" />
		<Input v-model="message" maxlength="100" @on-change="unscrambleMsg" @on-blur="commitInfoUpdate()" @on-focus="refreshStatus()" :rows=3 show-word-limit type="textarea" placeholder="Commit message" style="width: 100%" />
		<div id="dateSetControl">
			<span v-show="dateSetEnable">
				<Button @click="setCommitTime(pageContent.lastCommitDate)" style="margin-right: 5px">设为上一次提交时间</Button>
				<Button @click="appendTime()" style="margin-right: 5px">随机增加一些时间</Button>
				<DatePicker v-model="date" type="date" placeholder="Commit date" style="width: 120px"></DatePicker>
				<TimePicker v-model="time" format="HH:mm:ss" placeholder="Commit time" style="width: 120px"></TimePicker>
				<Input v-model="zone" placeholder="Time zone" style="width: 85px" />
				<Tooltip placement="bottom">
					<Icon type="ios-information-circle-outline" style="vertical-align: bottom; margin-bottom: -5px;" />
					<div slot="content">
						<span>{{ getCommitShortDate() }}</span>
					</div>
				</Tooltip>
				<Tooltip placement="bottom">
					<Button shape="circle" icon="md-refresh" @click="commitInfoUpdate()" style="margin-left: 2px"></Button>
					<div slot="content">同步现在的时间</div>
				</Tooltip>
				<Tooltip placement="bottom">
					<CheckboxGroup>
						<Checkbox label="Pin" border style="margin: 0px 5px;padding: 0px 0px 0px 5px;vertical-align: middle;" v-model="pageContent.pin"></Checkbox>
					</CheckboxGroup>
					<div slot="content" style="white-space: pre-wrap;">
						<Icon type="ios-outlet-outline" />选中后不再自动同步时间，未选中在写完commit message之后自动同步当前时间
					</div>
				</Tooltip>
				<Tooltip placement="bottom">
					<CheckboxGroup>
						<Checkbox label="Also revise commit time" border style="margin: 0px 5px;padding: 0px 0px 0px 5px;vertical-align: middle;" v-model="pageContent.alsoReviseCommitTime"></Checkbox>
					</CheckboxGroup>
					<div slot="content" style="white-space: pre-wrap;">
						默认只修改GIT_AUTHOR_DATE，勾选此选项时，连同修改GIT_COMMITTER_DATE
					</div>
				</Tooltip>
			</span>
			<i-switch v-model="dateSetEnable" size="large">
				<span slot="open">
					<Icon type="ios-clock-outline" />设定日期</span>
				<span slot="close">
					<Icon type="md-close" />设定日期</span>
			</i-switch>
		</div>
		<div style="margin-top: 10px; text-align: right">
			<Button @click="clearCommitInfo()" style="margin-right: 8px">
				<Icon type="ios-trash" />Clear</Button>
			<Tooltip placement="bottom" @on-popper-show="openGPGViewer" max-width="390">
				<CheckboxGroup style="display: inline-block; vertical-align: middle;" :value="[GPGEnable && 'GPG']">
					<Checkbox label="GPG" border v-model="GPGEnable"></Checkbox>
				</CheckboxGroup>
				<div slot="content" style="white-space: pre-wrap;">
					<div>Signing key: <span>{{$root.config.get("user.signingkey")}}</span></div>
					<Divider />
					<div class="preview-text">{{pageContent.GPGViewerContent}}</div>
				</div>
			</Tooltip>
			<Tooltip placement="bottom-end" @on-popper-show="openGPGViewer" max-width="480">
				<CheckboxGroup style="display: inline-block; vertical-align: middle;" :value="[SignedOffEnable && 'Signed-off']">
					<Checkbox label="Signed-off" :value="true" border v-model="SignedOffEnable"></Checkbox>
				</CheckboxGroup>
				<div slot="content">
					<div class="preview-text">{{pageContent.signOffLabel}}</div>
				</div>
			</Tooltip>
			<Button type="success" @click="commit()">
				<Icon type="md-checkmark" />Commit</Button>
		</div>
	</div>
</template>

<style>
#dateSetControl {
	text-align: right;
	padding-top: 5px;
}

#dateSetControl .ivu-switch {
	width: 90px;
	height: 30px;
	line-height: 30px;
	vertical-align: middle;
	margin-top: 3px;
}

#dateSetControl .ivu-switch-checked:after {
	left: 70px !important;
	top: 5px !important;
}

#dateSetControl .ivu-switch:after {
	top: 5px !important;
}

</style>

<script>
import moment from 'moment'
import http from '../common/services/http'
import GitEmoji from './GitEmoji'

export default {
	name: "GitCommit",
	components: {
		GitEmoji
	},
	data: () => ({
		message: "",
		date: null,
		time: null,
		zone: null,
		GPGEnable: true,
		dateSetEnable: true,
		SignedOffEnable: true,
		pageContent: {
			pin: false,
			GPGViewerContent: '',
			lastCommitDate: null,
			signOffLabel: null,
			alsoReviseCommitTime: false
		}
	}),
	created() {
		this.$root.$on("LogRefresh", (e) => {
			this.pageContent.lastCommitDate = e[0].date
		})
		this.$root.$on("ConfigUpdate", (e) => {
			this.pageContent.signOffLabel = `Signed-off-by: ${e.get('user.name')} <${e.get('user.email')}>`
		})
	},
	methods: {
		commitInfoUpdate() {
			if (this.pageContent.pin || !this.message) {
				return
			}
			this.date = new Date()
			this.time = moment().format('HH:mm:ss')
			this.pageContent.pin = true
			// get current zone
			let zone = (0 - new Date().getTimezoneOffset() / 60).toFixed(2).replace('.', ':')
			// complement 800 => 0800
			zone = Math.abs(zone.length) < 1000 ? zone.replace(/(?<=-?)\b/, '0') : zone
			// add '+' symbol
			this.zone = zone.replace(/^(?!-)\b/, '+')
		},
		clearCommitInfo() {
			this.message = ""
			this.date = null
			this.time = null
			this.zone = ""
			this.pageContent.pin = false
			this.$root.$emit("messageChange", "")
		},
		refreshStatus() {
			this.$root.$emit("refreshStatus")
		},
		getCommitShortDate() {
			if (!this.dateSetEnable) {
				return null
			}
			if (!this.date) {
				return 'Not filled'
			}
			return moment(this.date).format('YYYY-MM-DD') + "T" + this.time + this.zone
		},
		async commit() {
			const res = await http.postText('commit', {
				message: this.message,
				date: this.getCommitShortDate(),
				gpg: this.GPGEnable,
				signOff: this.SignedOffEnable,
				alsoReviseCommitTime: this.pageContent.alsoReviseCommitTime
			})
			this.refreshStatus()
			this.$Notice.success({
				title: 'Commit',
				desc: res
			})
			this.clearCommitInfo()
		},
		async openGPGViewer() {
			const content = await http.text("gpg/view")
			this.pageContent.GPGViewerContent = content
		},
		setCommitTime(time) {
			if (!time) {
				return this.$Notice.error({
					title: 'Commit',
					desc: "Not Last Commit"
				})
			}
			this.date = moment(time).toDate()
			this.time = moment(time).format("HH:mm:ss")
			if (!this.zone) {
				this.zone = "+0800"
			}
		},
		appendTime() {
			this.setCommitTime(moment(this.getCommitShortDate()).add(parseInt(Math.random() * 0xf), "m").add(parseInt(Math.random() * 0xff), "s").toDate())
		},
		selectEmoji(emoji) {
			const regex = /^:[a-z_]+:/
			if (this.message.match(regex)) {
				// when emoji exist, replace it
				this.message = this.message.replace(regex, '')
				if (!this.message.startsWith(" ")) {
					this.message = " " + this.message
				}
				this.message = emoji.code + this.message.replace(regex, '')
				return
			}
			this.message = emoji.code + " " + this.message
		},
		unscrambleMsg() {
			// this.message
			this.$root.$emit("messageChange", this.message)
		}
	}
}

</script>
