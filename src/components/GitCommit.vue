<template>
	<div>
		<Input v-model="message" maxlength="100" @on-blur="commitInfoUpdate()" @on-focus="refreshStatus()" :rows=3 show-word-limit type="textarea" placeholder="Commit message" style="width: 100%" />
		<div style="text-align: right">
			<DatePicker v-model="date" type="date" placeholder="Commit date" style="width: 120px"></DatePicker>
			<TimePicker v-model="time" format="HH:mm:ss" placeholder="Commit time" style="width: 120px"></TimePicker>
			<Input v-model="zone" placeholder="Time zone" style="width: 85px" />
			<Tooltip placement="bottom">
				<Icon type="ios-information-circle-outline" style="vertical-align: bottom; margin-bottom: -5px;" />
				<div slot="content">
					<span>{{ getCommitShortDate() }}</span>
				</div>
			</Tooltip>
			<Button shape="circle" icon="md-refresh" @click="commitInfoUpdate()" style="margin-left: 2px"></Button>
			<Tooltip placement="bottom">
				<CheckboxGroup>
					<Checkbox label="Pin" border style="margin: 0px 5px;padding: 0px 0px 0px 5px;" v-model="pin"></Checkbox>
				</CheckboxGroup>
				<div slot="content">
					<Icon type="ios-outlet-outline" />Automatically synchronize time after writing commit message
				</div>
			</Tooltip>
			<Button @click="clearCommitInfo()">
				<Icon type="ios-trash" />Clear</Button>
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
		message: "",
		date: null,
		time: null,
		zone: null,
		pin: false,
		GPGEnable: true,
		SignedOffEnable: true
	}),
	created() {
		this.$root.$on("updateCommitConfig", (e) => {
			this.GPGEnable = e.GPGEnable
			this.SignedOffEnable = e.SignedOffEnable
		})
	},
	methods: {
		commitInfoUpdate() {
			if (this.pin || !this.message) {
				return
			}
			this.date = new Date()
			this.time = moment().format('HH:mm:ss')
			this.zone = "+0800"
			this.pin = true
		},
		clearCommitInfo() {
			this.message = ""
			this.date = null
			this.time = null
			this.zone = ""
			this.pin = false
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
		}
	}
}

</script>
