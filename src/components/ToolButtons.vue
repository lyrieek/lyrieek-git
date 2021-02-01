<template>
	<div id="main-control-button" class="toolbar-buttons">
		<ButtonGroup>
			<Button type="success" @click="push()">
				<Icon type="md-arrow-round-up" />Push</Button>
			<Button type="info" @click="pull()">
				<Icon type="md-arrow-round-down" />Pull</Button>
		</ButtonGroup>
		<Button type="info" ghost>
			<Icon type="md-arrow-round-down" />Fetch</Button>
		<Button type="info" ghost>
			<Icon type="md-return-left" />Reset(soft)</Button>
		<Button type="info" ghost>
			<Icon type="md-redo" />Checkout</Button>
		<Button type="info" ghost @click="sshAgent()">
			<Icon type="md-lock" />SSH Agent</Button>
	</div>
</template>

<script>
export default {
	name: "ToolButtons",
	methods: {
		async sshAgent() {
            const data = await (await fetch("http://localhost:3516/ssh-agent")).json();
            this.$Notice.success({
                title: 'SSH Agent',
                desc: `<ul>
                        <li>${data.agentPid.stdout}</li>
                        <li>${data.id_ed25519.stdout || data.id_ed25519.stderr}</li>
                        <li>${data.sshAdd.stdout}</li>
                    </ul>`,
                duration: 0
            });
		},
		async push() {
            const content = await (await fetch("http://localhost:3516/push")).text();
            this.$Notice.success({
                title: 'Push',
                desc: content,
                duration: 0
            });
		},
		async pull() {
            const content = await (await fetch("http://localhost:3516/pull")).text();
            this.$Notice.success({
                title: 'Pull',
                desc: content,
                duration: 0
            });
		}
	}
}

</script>
