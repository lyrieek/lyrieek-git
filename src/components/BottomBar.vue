<template>
	<div>
		<div class="toolbar-buttons">
			<Button type="primary" @click="refreshStatus()" ghost>
				<Icon type="md-refresh" />刷新</Button>
			<Button type="primary" @click="openFolder()" ghost>
				<Icon type="ios-folder-open" />打开文件夹</Button>
			<Button type="primary" @click="openHostingSite()" ghost>
				<Icon type="ios-cloud" />打开{{ getHostingSite(this.$root.config.get("remote.origin.url")) }}</Button>
		</div>
		<div class="toolbar-buttons" style="margin-top: 10px">
			<Button type="primary" @click="configModal = true">
				<Icon type="md-settings" />修改配置</Button>
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
		}
	}
}

</script>
