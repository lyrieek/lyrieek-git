<template>
	<div class="layout">
		<Layout>
			<Header :style="{position: 'fixed', width: '100%'}">
				<Menu mode="horizontal" theme="dark" active-name="1">
					<div class="layout-logo">
						&nbsp;
						<Icon type="md-build" />
						Lyrieek Git
					</div>
					<div class="layout-nav">
						<MenuItem name="1">
						<Icon type="ios-navigate"></Icon>
						刷新
						</MenuItem>
						<MenuItem name="2">
						<Icon type="ios-keypad"></Icon>
						更换项目
						</MenuItem>
						<MenuItem name="4">
						<Icon type="ios-paper"></Icon>
						提取报告
						</MenuItem>
					</div>
				</Menu>
			</Header>
			<Content :style="{margin: '88px 20px 0', background: '#fff', minHeight: '500px'}">
				<GitList />
			</Content>
			<Footer class="layout-footer-center">2021 &copy; Lyrieek</Footer>
		</Layout>
	</div>
</template>
<style scoped>
.layout {
	border: 1px solid #d7dde4;
	/* background: #f5f7f9; */
	position: relative;
	border-radius: 4px;
	overflow: hidden;
}

.layout-logo {
	width: 100px;
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
	}
}

</script>
