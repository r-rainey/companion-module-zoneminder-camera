module.exports = function (self) {
	self.setActionDefinitions({
		snapshoot: {
			name: 'Take a snapshooooot',
			callback: async (event) => {
				self.takeSnapshot()
				console.log("took snapshot")
			},
		},
		alarm_on: {
			name: 'Trigger alarm for monitor ID',
			callback: async (event) => {
				console.log('Turn on alarm')
			},
		},
		alarm_off: {
			name: 'Turn off alarm for monitor ID',
			callback: async (event) => {
				console.log('Turn off alarm')
			},
		},
		ptz_move: {
			name: 'Move camera (if supported)',
			callback: async (event) => {
				console.log('Move camera')
			},
		},
		iris: {
			name: 'Adjust iris',
			callback: async (event) => {
				console.log('Adjust iris')
			},
		},
		focus: {
			name: 'Adjust focus',
			callback: async (event) => {
				console.log('Adjust focus')
			},
		},
		zoom_in: {
			name: 'Zoom in a camera',
		},
		zoom_out: {
			name: 'Zoom out',
		},
		preset: {
			name: 'Move to a preset',
		},		
		snapshot: {
			name: 'Take a snapshot',
			callback: async (event) => {
				self.takeSnapshot()
				console.log("took snapshot")
			},
		},
		sample_action: {
			name: 'My First Action',
			options: [
				{
					id: 'num',
					type: 'number',
					label: 'Test',
					default: 5,
					min: 0,
					max: 100,
				},
			],
			callback: async (event) => {
				console.log('Hello world!', event.options.num)
			},
		},
	})
}
// module.exports = {
// 	async takeSnapshot() {
// 		console.log("do something")
// 	}
// }