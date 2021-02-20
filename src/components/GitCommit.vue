<template>
	<div>
		<GitEmoji @on-select="selectEmoji" />
		<Input v-model="message" maxlength="100" @on-change="unscrambleMsg" @on-blur="commitInfoUpdate()" @on-focus="refreshStatus()" :rows=3 show-word-limit type="textarea" placeholder="Commit message" style="width: 100%" />
		<div style="text-align: right">
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
					<Checkbox label="Pin" border style="margin: 0px 5px;padding: 0px 0px 0px 5px;" v-model="pageContent.pin"></Checkbox>
				</CheckboxGroup>
				<div slot="content" style="white-space: pre-wrap;">
					<Icon type="ios-outlet-outline" />选中后不再自动同步时间，未选中在写完commit message之后自动同步当前时间
				</div>
			</Tooltip>
			<Button @click="clearCommitInfo()">
				<Icon type="ios-trash" />Clear</Button>
		</div>
		<div style="margin-top: 10px; text-align: right">
			<Button type="info" :ghost="!GPGEnable" @click="openGPGViewer()">
				<Icon type="md-lock" />GPG</Button>
			<Modal v-model="pageContent.GPGViewerModal" title="GPG Setting">
				<Card>
					<p slot="title">GPG Info</p>
					<div class="preview-text">{{pageContent.GPGViewerContent}}</div>
				</Card>
				<CheckboxGroup style="text-align: right">
					<Checkbox label="启用" v-model="GPGEnable" border></Checkbox>
				</CheckboxGroup>
			</Modal>
			<CheckboxGroup style="display: inline-block; vertical-align: middle;" :value="[SignedOffEnable && 'Signed-off']">
				<Checkbox label="Signed-off" :value="true" border></Checkbox>
			</CheckboxGroup>
			<Button type="success" @click="commit()">
				<Icon type="md-checkmark" />Commit</Button>
		</div>
	</div>
</template>

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
		SignedOffEnable: true,
		pageContent: {
			pin: false,
			GPGViewerModal: false,
			GPGViewerContent: '',
			lastCommitDate: null
		}
	}),
	created() {
		this.$root.$on("LogRefresh", (e) => {
			this.pageContent.lastCommitDate = e[0].date
		})
	},
	methods: {
		commitInfoUpdate() {
			if (this.pageContent.pin || !this.message) {
				return
			}
			this.date = new Date()
			this.time = moment().format('HH:mm:ss')
			this.zone = "+0800"
			this.pageContent.pin = true
		},
		clearCommitInfo() {
			this.message = ""
			this.date = null
			this.time = null
			this.zone = ""
			this.pageContent.pin = false
		},
		refreshStatus() {
			this.$root.$emit("refreshStatus")
		},
		getCommitShortDate() {
			if (!this.date) {
				return 'Not filled'
			}
			return moment(this.date).format('YYYY-MM-DD') + "T" + this.time + this.zone
		},
		commit() {
			fetch("http://localhost:3516/commit", {
				method: 'POST',
				body: JSON.stringify({
					message: this.message,
					date: this.getCommitShortDate(),
					gpg: this.GPGEnable,
					signOff: this.SignedOffEnable
				})
			}).then((e) => {
				if (!e.ok) {
					return e.json().then((res) => {
						this.$Notice.error({
							title: 'Commit',
							desc: `<div style="white-space: pre;">${res.stdout}</div>`,
							duration: 0
						})
					})
				}
				e.text().then((res) => {
					this.refreshStatus()
					this.$Notice.success({
						title: 'Commit',
						desc: res
					})
					this.clearCommitInfo()
				})
			})
		},
		async openGPGViewer() {
			const content = await http.text("gpg/view")
			this.pageContent.GPGViewerContent = content
			this.pageContent.GPGViewerModal = true
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
