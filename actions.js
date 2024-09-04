module.exports = function (self) {
	self.setActionDefinitions({
		snapshot: {
			name: 'Take a snapshot',
			callback: async (event) => {
				self.takeSnapshot()
				console.log("took snapshot")
			},
		},
		alarm_toggle: {
			name: 'Toggle alarm for monitor ID',
			callback: async (event) => {
				self.alarmToggle()
			},
		},
		change_speed: {
			name: 'Change Speed of PTZ',
			callback: async (event) => {
				self.changeSpeed()
			},
		},
		ptz_move: {
			name: 'Move camera',
			options: [
				{
					id: 'direction',
					label: 'Move direction',
					type: 'dropdown',
					choices: [
						{ id: 'Left', label: 'Left' },
						{ id: 'Right', label: 'Right' },
						{ id: 'Up', label: 'Up' },
						{ id: 'Down', label: 'Down' },
						{ id: 'UpLeft', label: 'Up/Left' },
						{ id: 'UpRight', label: 'Up/Right' },
						{ id: 'DownLeft', label: 'Down/Left' },
						{ id: 'DownRight', label: 'Down/Right' },
					]
				},
				{
					id: 'xspeed',
					label: 'Speed of X',
					type: 'textinput',
					default: '30',
				},
				{
					id: 'yspeed',
					label: 'Speed of Y',
					type: 'textinput',
					default: '30',
				}
			],
			callback: async (event) => {
				self.ptzMove(event.options.direction, event.options.xspeed, event.options.yspeed)
				console.log('Move camera ' + event.options.direction + " x: " + event.options.xspeed + " y: " + event.options.yspeed)
			},
		},
		iris: {
			name: 'iris',
			type: 'dropdown',
			options: [
				{
					id: 'irisAction',
					label: 'Iris Action',
					type: 'dropdown',
					choices: [
						{ id: 'IrisOpen', label: 'Open Iris' },
						{ id: 'IrisClose', label: 'Close Iris' },
						{ id: 'IrisAuto', label: 'Auto Iris' },
					]
				},
			],
			callback: async (event) => {
				self.ptzMove(event.options.irisAction, 0, 0)
				console.log('Adjust iris')
			},
		},
		focus: {
			name: 'focus',
			options: [
				{
					id: 'focusAction',
					label: 'Focus Action',
					type: 'dropdown',
					choices: [
						{ id: 'FocusNear', label: 'Focus Near' },
						{ id: 'FocusFar', label: 'Focus Far' },
						{ id: 'FocusAuto', label: 'Auto Focus' },
					]
				},
			],
			callback: async (event) => {
				self.ptzMove(event.options.focusAction, 0, 0)
				console.log('Adjust focus')
			},
		},
		zoom: {
			name: 'zoom',
			label: 'Zoom action',
			options: [
				{
					id: 'ZoomDir',
					label: 'Zoom Action',
					type: 'dropdown',
					choices: [
						{ id: 'ZoomIn', label: 'Zoom In' },
						{ id: 'ZoomOut', label: 'Zoom Out' },
					]
				},
			],
			callback: async (event) => {
				self.ptzMove(event.options.ZoomDir, 0, 0)
				console.log("Adjust Zoom")
			},
		},
		move_preset: {
			name: 'presetPosition',
			label: 'Move to a preset',
			options: [
				{
					id: 'position',
					type: 'number',
					label: 'Position Number'
				},
			],
			type: 'number',
			callback: async (event) => {
				self.movePreset(event.options.position)
				console.log("Moving to preset "+ event.options.position)
			}
		},
		create_preset: {
			name: "Create a new preset",
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