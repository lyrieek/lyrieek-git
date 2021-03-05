export default {
	getDateLabel(date) {
		return date.replace('T', ' / ').replace(/\+\d+/, "")
	}
}
