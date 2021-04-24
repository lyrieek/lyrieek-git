<template>
	<div>
		<div class="toolbar-buttons">
			<Button type="primary" @click="refreshStatus()" ghost>
				<Icon type="md-refresh" />{{ $t("message.refresh") }}</Button>
			<Button type="primary" @click="openFolder()" ghost>
				<Icon type="ios-folder-open" />{{ $t("message.openIn") }}{{ $t("message.folder") }}</Button>
			<Button type="primary" @click="openHostingSite()" ghost>
				<Icon type="ios-cloud" />{{ $t("message.openIn") }}{{ getHostingSite(this.$root.config.get("remote.origin.url")) }}</Button>
		</div>
		<div class="toolbar-buttons" style="margin-top: 10px">
			<Button type="primary" @click="configModal = true">
				<Icon type="md-settings" />{{ $t("message.updateConfig") }}</Button>
		</div>
		<Modal v-model="configModal" title="修改" @on-ok="updateConfig">
			<Form :label-width="80">
				<FormItem label="项目名">
					<Input type="text" v-model="project.name"></Input>
				</FormItem>
			</Form>
		</Modal>
	</div>
</template>

<script>
import http from '../common/services/http'

export default {
	name: "BottomBar",
	props: {
		project: {
			index: Number,
			name: String
		}
	},
	data: () => ({
		configModal: false,
		hostingSiteURL: "",
		hostingSiteName: ""
	}),
	methods: {
		updateConfig() {
			console.log("update")
		},
		openFolder() {
			http.getJSON("explorer")
		},
		getHostingSite(url) {
			if (!url) {
				return ""
			}
			if (url.startsWith("http")) {
				let notHeader = url.replace(/^http(s)?:\/\//, '')
				notHeader = notHeader.replace(/\.\S+$/, '')
				if (~notHeader.indexOf("@")) {
					notHeader = notHeader.replace(/^\S+@/, '')
				}
				this.hostingSiteName = notHeader
				this.hostingSiteURL = url.replace(/\.git$/, '')
			} else if (url.startsWith("git@")) {
				const noHeader = url.replace(/^git@/, '')
				this.hostingSiteName = noHeader.replace(/\.\S+$/, '')
				this.hostingSiteURL = 'https://' + url.replace(/^git@/, '').replace(/(?<=[a-zA-Z.]):/, '/').replace(/\.git$/, '')
			}
			// this.hostingSiteURL = this.hostingSiteURL.replace(/.git/, '')
			return this.hostingSiteName
		},
		openHostingSite() {
			window.open(this.hostingSiteURL)
		},
		refreshStatus() {
			this.$root.$emit("refreshStatus")
			this.$root.$emit("statusUpdated")
		}
	}
}

</script>
