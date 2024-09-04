const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')
const got = require('got')
const fs = require('fs')
var alarmState = false
var accessToken = ''
var camControllable, camMove, camIris, camZoom, camFocus
var PTZSpeed = 3
// Pick a low number to start with
// camRelMove determine if the camera has relative coord or continuous motion

var urimethod

class zoneminderInstance extends InstanceBase {
	async takeSnapshot() {
		// /cgi-bin/zms?mode=single&monitor=1&user=xxx&pass=yyy&
		console.log("in function");
		let date_ob = new Date()
		let date = ('0' + date_ob.getDate()).slice(-2)
		let month = ('0' + (date_ob.getMonth() + 1)).slice(-2)
		let year = date_ob.getFullYear()
		let hours = date_ob.getHours()
		if (hours < 10) {
			hours = '0' + hours
		}
		let minutes = date_ob.getMinutes()
		if (minutes < 10) {
			minutes = '0' + minutes
		}
		let seconds = date_ob.getSeconds()
		if (seconds < 10) {
			seconds = '0' + seconds
		}
		var savePath = this.config.snapshotPath + "/" + year + "/" + month + "/" + date
		if (!fs.existsSync(savePath)) {
			fs.mkdirSync(savePath, {
				recursive: true
			});
		}
		const filename = savePath + '/' + year + month + date + hours + minutes + seconds + '-' + this.config.monId + ".jpg"
		const url = urimethod + "://" + this.config.host + '/cgi-bin/zms?mode=single&monitor=' + this.config.monId + "&token=" + accessToken.access_token;
		//const url = urimethod + "://" + this.config.host + '/cgi-bin/zms?mode=single&monitor=' + this.config.monId + "&user=" + this.config.username + "&pass=" + this.config.password;
		await got(url, { responseType: 'buffer' })
			.then((response) => {
				fs.writeFileSync(filename, response.body);
				console.log("snapshot written");
			})
			.catch((error) => {
				console.log("Could not save image " + error)
			});

	}

	async alarmToggle() {
		console.log("alarmToggle entered " + alarmState)
		var url = "";
		if (alarmState) {
			// Turn off alarm
			console.log("Turn off alarm");
			//url = urimethod + "://" + this.config.host + this.config.api_path + "/monitors/alarm/id:" + this.config.monId + "/command:off.json?user=" + this.config.username + "&pass=" + this.config.password;
			url = urimethod + "://" + this.config.host + this.config.api_path + "/monitors/alarm/id:" + this.config.monId + "/command:off.json?token=" + accessToken.access_token;
			alarmState = false;

		} else {
			console.log("turn on alarm");
			// Turn on alarm
			//url = urimethod + "://" + this.config.host + this.config.api_path + "/monitors/alarm/id:" + this.config.monId + "/command:on.json?user=" + this.config.username + "&pass=" + this.config.password;
			url = urimethod + "://" + this.config.host + this.config.api_path + "/monitors/alarm/id:" + this.config.monId + "/command:on.json?token=" + accessToken.access_token;
			alarmState = true;
		}
		const response = await got(url)
	}

	async ptzMove(direction, xspeed, yspeed) {
		console.log("In ptzMove " + camControllable)
		// Move camera in a direction
		if (camControllable == '0') {
			console.log("This camera has no controls.");
			return // Camera has no controls configured
		}
		var dir = "";
		switch (direction) {
			case 'Left':
				dir = 'moveRelLeft';
				break;
			case 'Right':
				dir = 'moveRelRight';
				break;
			case 'Up':
				dir = 'moveRelUp';
				break;
			case 'Down':
				dir = 'moveRelDown';
				break;
			case 'UpLeft':
				dir = 'moveRelUpLeft';
				break;
			case 'UpRight':
				dir = 'moveRelUpRight';
				break;
			case 'DownLeft':
				dir = 'moveRelDownLeft';
				break;
			case 'DownRight':
				dir = 'moveRelDownRight';
				break;
			case 'ZoomIn':
				dir = 'zoomRelTele';
				break;
			case 'ZoomOut':
				dir = 'zoomRelWide';
				break;
			case 'FocusNear':
				dir = 'focusRelNear';
				break;
			case 'FocusFar':
				dir = 'focusRelFar';
				break;
			case 'FocusAuto':
				dir = 'focusAuto';
				break;
			case 'IrisClose':
				dir = 'irisRelClose';
				break;
			case 'IrisOpen':
				dir = 'irisRelClose';
				break;
			case 'IrisAuto':
				dir = 'irisAuto';
				break;
			case 'Home':
				dir = 'presetHome';
				break;
		}
		console.log('CamMove: ' + camMove)
		if (xspeed == "0") {
			xspeed = "3"
		}
		if (yspeed == "0") {
			yspeed = "3"
		}
		if (camMove == 'Relative') {
			const options = {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				method: 'POST',
				body: `view=request&request=control&id=${this.config.monId}&control=${dir}&xge=${PTZSpeed}&yge=${PTZSpeed}&token=${accessToken.access_token}`,
				retry: {
					limit: 3, // Maximum number of retries
					statusCodes: [408, 500, 502, 503, 504], // Retry on these status codes
					delay: 1000 // Delay between retries in milliseconds
				}
			};
			const url = `${urimethod}://${this.config.host}/index.php`
			console.log(url)
			console.log(options.headers)
			console.log(options.body)
			//+ this.config.api_path + '/monitors/' + this.config.monId + ".json?user=" + this.config.username + "&pass=" + this.config.password;
			// This should be a POST 
			// example POST body
			// view=request&request=control&id=6&control=moveConLeft&xge=30&yge=30	
			await got.post(url, options)
				.then((response) => {
					console.log(response.body);
				})
				.catch((error) => {
					console.log(error);
				})
		}
		if (camMove == 'Continuous') {
			dir = dir.replace(/Rel/g, "Con")
			var options = {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				method: 'POST',
				body: `view=request&request=control&id=${this.config.monId}&control=${dir}&xge=${xspeed}&yge=${yspeed}&token=${accessToken.access_token}`,
				retry: {
					limit: 3, // Maximum number of retries
					// statusCodes: [408, 500, 502, 503, 504], // Retry on these status codes
					delay: 1000 // Delay between retries in milliseconds
				}
			};
			const url = `${urimethod}://${this.config.host}/index.php`
			await got.post(url, options)
				.then((response) => {
					console.log(response.body);
				})
				.catch((error) => {
					console.log(error);
				});
			dir = 'moveStop';
			options = {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				method: 'POST',
				body: `view=request&request=control&id=${this.config.monId}&control=${dir}&token=${accessToken.access_token}`
			};
			console.log(options.body);
			setTimeout(async () => {
				await got.post(url, options)
					.then((response) => {
						console.log(response.body);
					})
			}, PTZSpeed);
		}

	}
	async movePreset(position) {
		if (position == '0') {
			position = 'Home'
		}
		const url = `${urimethod}://${this.config.host}/index.php`
		const options = {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			method: 'POST',
			body: `view=request&request=control&id=${this.config.monId}&control=presetGoto${position}&token=${accessToken.access_token}`,
			retry: {
				limit: 3, // Maximum number of retries
				statusCodes: [408, 500, 502, 503, 504], // Retry on these status codes
				delay: 1000 // Delay between retries in milliseconds
			}
		};
		await got.post(url, options)
			.then((response) => {
				console.log(response.body);
			})
			.catch((error) => {
				console.log(error);
			})
	}
	async changeSpeed() {
		// Flip speed based on button press
		switch (PTZSpeed) {
			case 3:
				PTZSpeed = 10;
				this.setVariableValues({
					currentSpeed: 'Medium'
				});
				break;
			case 10:
				PTZSpeed = 30;
				this.setVariableValues({
					currentSpeed: 'Fast'
				});
				break;
			case 30:
				PTZSpeed = 3;
				this.setVariableValues({
					currentSpeed: 'Low'
				});
				break;
		}
	}
	async getCameraInformation() {
		console.log("getCameraInformation");
		// Obtain some info from zoneminder
		// const url = urimethod + "://" + this.config.host + this.config.api_path + '/monitors/' + this.config.monId + ".json?user=" + this.config.username + "&pass=" + this.config.password;
		const url = urimethod + "://" + this.config.host + this.config.api_path + 'monitors/' + this.config.monId + ".json?token=" + accessToken.access_token;
		console.log(url);
		const response = await got(url).json();
		// console.log(response);
		// console.log(response.toString());
		// const cameraJson = JSON.stringify(response);
		var cameraJson = JSON.parse(JSON.stringify(response));
		// console.log(cameraJson.monitor.Monitor.Width);
		// camWidth = cameraJson.monitor.Monitor.Width;
		// camHeight = cameraJson.monitor.Monitor.Height;
		camControllable = cameraJson.monitor.Monitor.Controllable;
		if (!accessToken.access_token) {
			this.login();
		}
		if (cameraJson.monitor.Monitor.ControlId) {
			// If the camera is configured to have PTZ, read what it can do
			const url2 = urimethod + "://" + this.config.host + this.config.api_path + 'controls/' + cameraJson.monitor.Monitor.ControlId + ".json?token=" + accessToken.access_token;
			const control = await got(url2).json();
			var controlCamera = JSON.parse(JSON.stringify(control))
			console.log('can move: ' + controlCamera.control.Control.CanMoveCon)
			// Motion check
			if (controlCamera.control.Control.CanMoveRel == '1') {
				camMove = 'Relative'
			}
			if (controlCamera.control.Control.CanMoveCon == '1') {
				camMove = 'Continuous'
			}
			if (controlCamera.control.Control.CanMoveRel == '1' && controlCamera.control.Control.CanMoveCon == '1') {
				// It does both, lets use Relative
				camMove = 'Relative'
			}
			// Zoom check
			if (controlCamera.control.Control.CanZoomRel == '1') {
				camZoom = 'Relative'
			}
			if (controlCamera.control.Control.CanZoomCon == '1') {
				camZoom = 'Continuous'
			}
			if (controlCamera.control.Control.CanZoomRel == '1' && controlCamera.control.Control.CanZoomCon == '1') {
				// It does both, lets use Relative
				camZoom = 'Relative'
			}
			// Focus check
			if (controlCamera.control.Control.CanFocusRel == '1') {
				camFocus = 'Relative'
			}
			if (controlCamera.control.Control.CanFocusCon == '1') {
				camFocus = 'Continuous'
			}
			if (controlCamera.control.Control.CanFocusRel == '1' && controlCamera.control.Control.CanFocusCon == '1') {
				// It does both, lets use Relative
				camFocus = 'Relative'
			}
			// Iris check
			if (controlCamera.control.Control.CanIrisRel == '1') {
				camIris = 'Relative'
			}
			if (controlCamera.control.Control.CanIrisCon == '1') {
				camIris = 'Continuous'
			}
			if (controlCamera.control.Control.CanIrisRel == '1' && controlCamera.control.Control.CanIrisCon == '1') {
				// It does both, lets use Relative
				camIris = 'Relative'
			}
			if (controlCamera.control.Control.CanIrisRel == '0' && controlCamera.control.Control.CanIrisCon == '0' && controlCamera.control.Control.CanZoom == '1') {
				camMove = 'Continuous';
			}
		}
		return response;
	}

	constructor(internal) {
		super(internal)
	}

	async init(config) {
		console.log("The init function begins")
		console.log(config)
		this.config = config
		if (this.config.urimethod) {
			urimethod = "https"
		} else {
			urimethod = "http"
		}
		await this.login()
		// Refresh access token every 2 hours
		const refreshAccess = setInterval(() => {
			console.log('refreshed token');
			this.login();
		}, (2 * 60 * 60 * 1000) - 100)
		this.updateStatus(InstanceStatus.Ok)
		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		var cameraFeatures = this.getCameraInformation() // Get some info
		this.setVariableValues( {
			'currentSpeed': 'Low', 
		})
		console.log("init complete")
	}
	// When module gets deleted
	async destroy() {
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		console.log("Config was updated")
		this.config = config
		console.log(config)
		// this.getCameraInformation()
	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: "static-text",
				id: "info",
				width: 12,
				label: "Information",
				value: "Control a camera from Zoneminder, supports PTZ and creates snapshots on your computer. If you need more cameras, just setup additional modules."
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP/hostname',
				width: 15,
				regex: Regex.SOMETHING,
			},
			{
				type: 'checkbox',
				id: 'urimethod',
				label: 'HTTPS',
				// width: 5,
				default: false,
			},
			{
				type: 'checkbox',
				id: 'ignore_certificates',
				label: 'Ignore Certificate Signing',
				// width: 6,
				default: false,
			},
			{
				type: "static-text",
				id: "info",
				width: 12,
				label: " ",
				value: " ",
			},
			{
				type: "textinput",
				id: "api_path",
				label: "Path to API directory (your path may be /zm/api/)",
				default: "/api/",
				width: 15,
			},
			{
				type: 'textinput',
				id: 'username',
				label: 'Username',
				width: 15,
				regex: Regex.SOMETHING,
			},
			{
				type: 'textinput',
				id: 'password',
				label: 'Password',
				width: 15,
				isVisibleData: false,
			},
			{
				type: "static-text",
				id: "info",
				width: 12,
				label: " ",
				value: " "
			},
			{
				type: 'number',
				id: 'monId',
				label: 'Monitor ID',
				regex: Regex.NUMBER,
				min: 0,
			},
			{
				type: 'textinput',
				id: 'snapshotPath',
				label: 'Snapshot path for this monitor',
				width: 100,
			},
		]
	}

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}
	async login() {
		// Log into ZM, return the access_token
		const url = `${urimethod}://${this.config.host}${this.config.api_path}host/login.json`
		const data = {
			user: this.config.username,
			pass: this.config.password
		};
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams(data).toString(),
			retry: {
				limit: 3, // Maximum number of retries
				statusCodes: [408, 500, 502, 503, 504], // Retry on these status codes
				delay: 1000 // Delay between retries in milliseconds
			}
		}
		console.log(options.body)
		//const data = `user=${this.config.username}&pass=${this.config.password}`
		await got(url, options)
			.then((response) => {
				accessToken = JSON.parse(response.body);
				console.log('token' + accessToken.access_token);
			})
			.catch((error) => {
				console.log('Login Error: ' + error);
			})
	}
}

runEntrypoint(zoneminderInstance, UpgradeScripts)
