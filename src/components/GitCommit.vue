<template>
	<div>
		<Input v-model="commitInfo.message" maxlength="100" @on-blur="commitInfoUpdate()" @on-focus="refreshStatus()" :rows=3 show-word-limit type="textarea" placeholder="Commit message" style="width: 100%" />
		<div style="text-align: right">
			<DatePicker v-model="commitInfo.date" type="date" placeholder="Commit date" style="width: 120px"></DatePicker>
			<TimePicker v-model="commitInfo.time" format="HH:mm:ss" placeholder="Commit time" style="width: 120px"></TimePicker>
			<Input v-model="commitInfo.zone" placeholder="Time zone" style="width: 85px" />
			<Tooltip placement="bottom">
				<Icon type="ios-information-circle-outline" style="vertical-align: bottom; margin-bottom: -5px;" />
				<div slot="content">
					<span>{{ getCommitShortDate() }}</span>
				</div>
			</Tooltip>
			<Button shape="circle" icon="md-refresh" @click="commitInfoUpdate()" style="margin-left: 2px"></Button>
			<Tooltip placement="bottom">
				<CheckboxGroup>
					<Checkbox label="Pin" border style="margin-left: 2px;padding: 0px 0px 0px 5px;margin-right:0px" v-model="commitInfo.pin"></Checkbox>
				</CheckboxGroup>
				<div slot="content">
					<Icon type="ios-outlet-outline" />Automatically synchronize time after writing commit message
				</div>
			</Tooltip>
		</div>
		<div style="margin-top: 10px; text-align: right">
			<Button type="success" @click="commit()">
				<Icon type="md-checkmark" />Commit</Button>
		</div>
	</div>
</template>

<script>
import moment from 'moment'

export default {
	name: "GitCommit",
	data: () => ({
		commitInfo: {
			message: "",
			date: null,
			time: null,
			zone: null,
			pin: false
		},
		CommitConfig: {
			GPGEnable: false,
			SignedOffEnable: false
		}
	}),
	created() {
		this.$root.$on("updateCommitConfig", (e) => {
			this.CommitConfig.GPGEnable = e.GPGEnable
			this.CommitConfig.SignedOffEnable = e.SignedOffEnable
		})
	},
	methods: {
		commitInfoUpdate() {
			if (this.commitInfo.pin || !this.commitInfo.message) {
				return
			}
			this.commitInfo.date = new Date()
			this.commitInfo.time = moment().format('HH:mm:ss')
			this.commitInfo.zone = "+0800"
			this.commitInfo.pin = true
		},
		refreshStatus() {
			this.$root.$emit("refreshStatus")
		},
		getCommitShortDate() {
			if (!this.commitInfo.date) {
				return 'Not filled'
			}
			return moment(this.commitInfo.date).format('YYYY-MM-DD') + "T" + this.commitInfo.time + this.commitInfo.zone
		},
		commit() {
			fetch("http://localhost:3516/commit", {
				method: 'POST',
				body: JSON.stringify({
					message: this.commitInfo.message,
					date: this.getCommitShortDate(),
					gpg: this.CommitConfig.GPGEnable,
					signOff: this.CommitConfig.SignedOffEnable
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
					this.commitInfo = {}
				})
			})
		}
	}
}

</script>
