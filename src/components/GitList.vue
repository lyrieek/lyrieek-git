<template>
	<div class="hello">
		<Row>
			<Col span="3">
			<div style="padding: 20px">
				<List>
					<ListItem class="project-item-label">
						<ListItemMeta title="本项目"></ListItemMeta>
						<Badge :count="10" slot="extra" />
					</ListItem>
					<ListItem class="add-project-item">
						<div style="text-align: center;width: 100%">
							<Icon type="md-add" />
							添加新项目
						</div>
					</ListItem>
				</List>
			</div>
			</Col>
			<Col span="18" :style="{'padding' : '10px'}">
			<div class="git-work-url">
				<span>工作目录:</span>
				<span>Unselected</span>
			</div>
			<Divider></Divider>
			</Col>
			<Col span="3" :style="{'border-left' : '1px solid black'}">
			<Split mode="vertical">
				<div slot="top" class="git-area work-area">
					<Divider>工作区</Divider>
				</div>
				<div slot="bottom" class="git-area stage-area">
					<Divider>暂存区</Divider>
				</div>
			</Split>
			</Col>
		</Row>
	</div>
</template>

<style>
.project-item-label:hover {
	background: rgb(197, 211, 224);
}

.add-project-item:hover {
	font-weight: bold;
	cursor: pointer;
}

.git-area {
	margin: 10px;
}

.git-work-url {
	margin: 10px;
	font-size: 16px;
}

.git-work-url>span:last-child {
	font-weight: bold;
	margin-left: 5px;
	border: 1px dotted gray;
}

</style>

<script>
export default {
	name: 'GitList'
}

</script>
