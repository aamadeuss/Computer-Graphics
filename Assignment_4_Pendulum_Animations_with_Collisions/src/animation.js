/*
This module consists of helper classes which enable animation.
The idea here is that the *interface* should be the same, for all the various types
of synchronous animations.



////// AnimationController has been subsumed by Manager in scene.js
AnimationController: stores the animations currently in progress, and updates them in a 
requestAnimationFrame() recursion. There can be ONLY ONE AnimationController 
in a given execution since something very hacky has been done to make it work.
--constructor(render_handler):
            render_handler is an object which stores a three.Renderer(), among other things.
--addToAnimation(apm):
            apm is an object that implements the AnimationParameterModulator interface (described later)
            adds this to a dictionary (object) of APMs.
            Also, listens for an event, which, when triggered, removes this APM from the list of animations.
--removeFromAnimation(name):
            removes the apm with given name from the dict of APMs
--animate(time):
            the requestAnimationFrame() recursive loop.
            Call apm.update(time) for all apms
            Call the three js renderer.


AnimationParameterModulator_ABSTRACT interface:

This interface gives some uniformity which enables us to do a variety of animations 
without having to change the external code.

--constructor(name, obj, param_set)
    name is used for the endEvent -- the event which when triggered ends the animation.
    obj -- the object which is being manipulated in the animation 
    param_set -- the function which manipulates the object at each timestep
    
--update(time)
    Put the per-timestep update code here. Examples below.

*/
/*Base class */
export class AnimationParameterModulator_ABSTRACT {
	name
	endEvent
	param_set
	obj
	constructor(name, obj, param_set) {
		this.name = name
		this.endEvent = new CustomEvent(name + "End")
		this.param_set = param_set
		this.obj = obj
	}
	update(time) {
		document.dispatchEvent(this.endEvent)
	}
}

/*A start, and an end*/
export class TwoPointAPM_ABSTRACT extends AnimationParameterModulator_ABSTRACT {
	startVal
	targetVal
	deltaTime
	startTime
	constructor(name, obj, param_set, startVal, targetVal, deltaTime) {
		super(name, obj, param_set)
		this.startVal = startVal
		this.targetVal = targetVal
		this.deltaTime = deltaTime
		setTimeout(() => document.dispatchEvent(this.endEvent), this.deltaTime)
		this.startTime = null
	}
	update(time) {
		if (this.startTime == null)
			this.startTime = time
	}
}

/*From start to end, linearly*/
export class LinearTwoPointAPM extends TwoPointAPM_ABSTRACT {
	update(time) {
		if (this.startTime == null)
			this.startTime = time
		const tuner = (time - this.startTime) / this.deltaTime
		const result = this.startVal + tuner * (this.targetVal - this.startVal)
		this.param_set(this.obj, result)
	}
}

/*From start to end, exponentially*/
export class ExpTwoPointAPM extends TwoPointAPM_ABSTRACT {
	expVal
	expEvalFn
	constructor(name, obj, param_set, startVal, targetVal, deltaTime, expVal) {
		super(name, obj, param_set, startVal, targetVal, deltaTime)
		this.expVal = expVal
		this.expEvalFn = (t) => (Math.exp(this.expVal * t) - 1)
	}
	update(time) {
		if (this.startTime == null)
			this.startTime = time
		const tuner = (time - this.startTime) / this.deltaTime
		const result = this.startVal + (this.expEvalFn(tuner) / this.expEvalFn(1)) * (this.targetVal - this.startVal)
		console.log(result)
		this.param_set(this.obj, result)
	}
}

/*Based on velocity and acceleration rather than on initial and final positions*/
export class SpeedForceAPM_ABSTRACT extends AnimationParameterModulator_ABSTRACT {
	prevTime
	prevPos
	prevSpeed
	prevAccel
	endCondition
	constructor(name, obj, param_set, startPos, startSpeed, startAccel, endCondition) {
		super(name, obj, param_set)
		this.prevTime = null
		this.prevPos = startPos
		this.prevSpeed = startSpeed
		this.prevAccel = startAccel
		this.endCondition = endCondition
	}
	update(time) {
		if (this.endCondition != null) {
			if (this.endCondition(this,time))
				document.dispatchEvent(this.endEvent)
		}
	}
}

/*Hint: Gravity-1D */
export class ConstantAccAPM extends SpeedForceAPM_ABSTRACT {
	update(time) {
		if (this.endCondition != null && this.endCondition(this,time)) {
			document.dispatchEvent(this.endEvent)
		}
		else 
		{
			if (this.prevTime == null) {
				this.prevTime = time
				this.param_set(this.obj, this.prevPos)
			}
			else {
				this.prevPos = this.prevPos + (time - this.prevTime) * this.prevSpeed
				this.prevSpeed = this.prevSpeed + (time - this.prevTime) * this.prevAccel
				this.prevTime = time
				this.param_set(this.obj, this.prevPos)
			}
		}
		

	}
}

/* If you have a position-time table, say, a CSV, this is useful. */
export class PointListAPM extends AnimationParameterModulator_ABSTRACT {
	data_array
	desired_key
	startTime
	constructor(name, obj, param_set, data_array, desired_key) {
		super(name, obj, param_set)
		this.data_array = data_array
		this.desired_key = desired_key
		this.startTime = null
	}
	update(time) {
		if (this.startTime == null)
			this.startTime = time
		const data_obj = this.data_array.find(obj => obj.time > (time - this.startTime))
		if (data_obj != undefined) {
			this.param_set(this.obj, data_obj[this.desired_key])
			console.log(data_obj)
		}
		else {
			document.dispatchEvent(this.endEvent)
		}
	}
}

export class DampedOscillationAPM extends AnimationParameterModulator_ABSTRACT {
	constructor(name, obj, param_set, y_offset, time_period, start_position,amplitude,time_constant,end_amplitude, end_angle,delay)
	{
		super(name, obj, param_set)
		this.delay = delay
		this.y_offset = y_offset 
		this.time_period = time_period
		this.amplitude = amplitude
		this.phase_offset =  Math.asin((this.y_offset-start_position)/this.amplitude)
		this.time_constant = time_constant 
		this.startTime = null 
		this.end_amplitude = end_amplitude
		this.end_angle = end_angle
	}
	update(time)
	{
		if(this.startTime ==null) this.startTime = time 
		const deltaTime = time - this.startTime
		const angle = (2*Math.PI/this.time_period)*deltaTime + this.phase_offset
		let decayed_amplitude
		if(deltaTime>this.delay) decayed_amplitude = this.amplitude*Math.exp(-deltaTime/this.time_constant)
		else decayed_amplitude = this.amplitude
		
		const y = decayed_amplitude*Math.sin(angle) + this.y_offset
		this.param_set(this.obj,y)
		// if(decayed_amplitude < this.end_amplitude && Math.abs(angle) < this.end_angle ) document.dispatchEvent(this.endEvent)
	}
}

/* CSV to Object */
export async function load_csv(path) {
	const fetchResult = await fetch(path)
	if (fetchResult.status == 200) {
		const csvString = await fetchResult.text()
		const csvRows = csvString.split("\n")
		let properties = csvRows[0].split(",")
		properties = properties.map((prop) => { return prop.trim() })
		csvRows.splice(0, 1)
		const toReturn = csvRows.map((rowStr) => {
			const rowArray = rowStr.split(",")
			const newItem = {}
			rowArray.map((val, ind) => { newItem[properties[ind]] = Number(val) })
			return newItem
		})
		return toReturn
	}
	else {
		return null
	}
}