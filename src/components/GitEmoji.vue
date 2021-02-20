<template>
	<div>
		<Poptip title="Title" content="content" placement="bottom-start" v-model="visible">
			<Button size="small">😎Git Emoji选择</Button>
			<div slot="title">
				<Input placeholder="Search emoji" size="small" style="width: 300px">
				<Icon type="ios-search" slot="suffix" />
				</Input>
			</div>
			<div slot="content">
				<div class="git-emojis">
					<template v-for="item of emojis.gitmojis">
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
import gitmojis from 'gitmojis'

export default {
	name: "GitCommit",
	data: () => ({
		emojis: gitmojis,
		visible: false,
		selectedEmoji: {}
	}),
	created() {
		this.$root.$on("messageChange", (e) => {
			const arr = e.match(/^:[a-z_]+:/)
			if (arr) {
				this.selectedEmoji = ""
				const searchRes = this.emojis.gitmojis.filter(e => e.code === arr[0])
				if (searchRes && searchRes.length) {
					this.selectedEmoji = searchRes[0]
				}
			}
		})
	},
	methods: {
		selected(item) {
			this.$emit("on-select", item)
			this.selectedEmoji = item
			this.visible = false
		}
	}
}

</script>
