<template>
	<div class="layout">
		<Layout>
			<Header :style="{position: 'fixed', width: '100%', 'z-index': 999, top: 0}">
				<Menu mode="horizontal" theme="dark" active-name="1" @on-select="about">
					<div class="layout-logo" style="padding: 0px 12px;">
						&nbsp;
						<Icon type="md-build" />
						Lyrieek Git
					</div>
					<div class="layout-nav" style="margin-right: 0px;">
						<MenuItem name="1" v-html="$t('message.about')">
						</MenuItem>
					</div>
				</Menu>
			</Header>
			<Content :style="{margin: '88px 20px 0', 'min-height': '500px'}">
				<GitList />
			</Content>
			<Footer class="layout-footer-center">2021 &copy; Lyrieek</Footer>
		</Layout>
		<Modal title="About" v-model="aboutWinVisible" footer-hide>
			<img src="/favicon.ico" alt="Logo" width="120px" style="float: right;padding-right: 20px;" />
			<h3>Lyrieek-Git</h3>
			<ul>
				<li>{{ $t("message.version") }}: <em>v0.1.2-Alpha</em></li>
				<li>{{ $t("message.author") }}: <em>lyrieek</em></li>
				<li>{{ $t("message.email") }}: <em>lyrieek@qq.com</em></li>
				<li>{{ $t("message.license") }}: <em><img src="/AGPLv3_Logo.svg" title="AGPL(GNU AFFERO GENERAL PUBLIC LICENSE)" alt="AGPL(GNU AFFERO GENERAL PUBLIC LICENSE)" width="120px" />AGPL(GNU AFFERO GENERAL PUBLIC LICENSE)</em></li>
				<!-- <li><img src="/AGPLv3_Logo.svg" title="AGPL(GNU AFFERO GENERAL PUBLIC LICENSE)" alt="AGPL(GNU AFFERO GENERAL PUBLIC LICENSE)" width="120px" /></li> -->
				<li style="text-align: right;">Copyleft Ɔ 2021 lyrieek</li>
			</ul>
		</Modal>
	</div>
</template>
<style scoped>
.layout {
	border: 1px solid #d7dde4;
	background: #fefefe;
	position: relative;
	border-radius: 4px;
	overflow: hidden;
}

.layout-logo {
	width: 120px;
	height: 30px;
	background: rgb(114, 139, 155);
	border-radius: 3px;
	float: left;
	position: relative;
	top: 15px;
	left: 20px;
	color: white;
	font-weight: bold;
	font-style: italic;
	line-height: 30px;
}

.layout-nav {
	width: 420px;
	margin: 0 auto;
}

.layout-footer-center {
	text-align: center;
}

</style>
<script>
import GitList from './components/GitList.vue'

export default {
	name: 'App',
	components: {
		GitList
	},
	data: () => ({
		maxHeight: window.innerHeight - 95,
		aboutWinVisible: false
	}),
	methods: {
		about() {
			this.aboutWinVisible = true
		}
	}
}

</script>
