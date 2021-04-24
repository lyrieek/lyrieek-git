<template>
	<div>
		<Poptip title="Title" content="content" placement="bottom-start" v-model="visible">
			<Button size="small">😎{{ $t("message.addGitEmoji") }}</Button>
			<div slot="title">
				<Input v-model="searchEmojiText" @on-change="search()" placeholder="Search emoji" size="small" style="width: 300px">
				<Icon type="ios-search" slot="suffix" />
				</Input>
			</div>
			<div slot="content">
				<div class="git-emojis">
					<template v-for="item of emojisDisplay">
						<div @click="selected(item)">
							<div>{{item.emoji}} <strong class="emojis-code">{{item.code}}</strong></div>
							<div class="description">{{item.description}}</div>
						</div>
					</template>
				</div>
			</div>
		</Poptip>
		<span style="margin-left: 10px">{{ selectedEmoji.emoji }} {{selectedEmoji.description}}</span>
	</div>
</template>

<style>
.git-emojis {
	display: grid;
	grid-template-columns: 210px 210px 210px;
	max-height: 300px;
}

.git-emojis>div {
	border: 1px solid darkgray;
	border-radius: 3px;
	margin: 2px;
	padding: 2px;
}

.git-emojis>div:hover {
	cursor: pointer;
	border-color: black;
	border-width: 2px;
	padding: 1px 2px;
}

.git-emojis .description {
	white-space: pre-wrap;
}

.emojis-code {
	text-align: center;
}

</style>

<script>
import mojisData from 'gitmojis'

export default {
	name: "GitCommit",
	data: () => ({
		emojis: mojisData.gitmojis,
		emojisDisplay: mojisData.gitmojis,
		visible: false,
		selectedEmoji: {},
		searchEmojiText: ""
	}),
	created() {
		this.$root.$on("messageChange", (e) => {
			const arr = e.match(/^:[a-z_]+:/)
			this.selectedEmoji = ""
			if (arr) {
				const searchRes = this.emojis.filter(e => e.code === arr[0])
				if (searchRes && searchRes.length) {
					this.selectedEmoji = searchRes[0]
				}
			}
		})
	},
	methods: {
		exists(str) {
			return ~str.toUpperCase().indexOf(this.searchEmojiText.toUpperCase())
		},
		search() {
			if (!this.searchEmojiText) {
				this.emojisDisplay = this.emojis
				return
			}
			this.emojisDisplay = this.emojis.filter((e) => this.exists(e.code) || this.exists(e.description))
		},
		selected(item) {
			this.$emit("on-select", item)
			this.selectedEmoji = item
			this.visible = false
		}
	}
}

</script>
