/**
* Gumby Framework
* ---------------
*
* Follow @gumbycss on twitter and spread the love.
* We worked super hard on making this awesome and released it to the web.
* All we ask is you leave this intact. #gumbyisawesome
*
* Gumby Framework
* http://gumbyframework.com
*
* Built with love by your friends @digitalsurgeons
* http://www.digitalsurgeons.com
*
* Free to use under the MIT license.
* http://www.opensource.org/licenses/mit-license.php
*/
!function($) {

	'use strict';

	function Gumby() {
		this.$dom = $(document);
		this.$html = this.$dom.find('html');
		this.isOldie = !!this.$html.hasClass('oldie');
		this.click = 'click';
		this.onReady = this.onOldie = this.onTouch = false;
		this.autoInit = $('script[gumby-init]').attr('gumby-init') === 'false' ? false : true;
		this.debugMode = Boolean($('script[gumby-debug]').length);
		// Fix for missing Modernizr.load() -> disable touchDevice
		this.touchDevice = false; // !!(Modernizr.touch || window.navigator.userAgent.indexOf("Windows Phone") > 0);
		this.gumbyTouch = false;
		this.touchEvents = 'js/libs';
		this.breakpoint = Number($('script[gumby-breakpoint]').attr('gumby-breakpoint')) || 768;
		this.touchEventsLoaded = false;
		this.uiModulesReady = false;
		this.uiModules = {};
		this.inits = {};

		// jQuery mobile touch events
		var touch = $('script[gumby-touch]').attr('gumby-touch'),
			path = $('script[gumby-path]').attr('gumby-path');

		// do not use touch events
		if(touch === 'false') {
			this.touchEvents = false;

		// set path to jQuery mobile
		// support touch/path attrs for backwards compatibility
		} else {
			if(touch) {
				this.touchEvents = touch;
			} else if(path) {
				this.touchEvents = path;
			}
		}

		// update click property to bind to click/tap
		if(this.touchDevice) {
			this.click += ' tap';
		}

		// add gumby-touch/gumby-no-touch classes
		// gumby touch == touch enabled && smaller than defined breakpoint
		if(this.touchDevice && $(window).width() < this.breakpoint) {
			this.$html.addClass('gumby-touch');
			this.gumbyTouch = true;
		} else {
			this.$html.addClass('gumby-no-touch');
		}

		if(this.debugMode) {
			this.debug('Gumby is in debug mode');
		}
	}

	// initialize Gumby
	Gumby.prototype.init = function(options) {
		var scope = this,
			opts = options ? options : {};

		// call ready() code when dom is ready
		this.$dom.ready(function() {
			if(opts.debug) {
				scope.debugMode = true;
			}

			scope.debug("Initializing Gumby");

			// init UI modules
			var mods = opts.uiModules ? opts.uiModules : false;
			scope.initUIModules(mods);

			if(scope.onReady) {
				scope.onReady();
			}

			// call oldie() callback if applicable
			if(scope.isOldie && scope.onOldie) {
				scope.onOldie();
			}

			// call touch() callback if applicable
			if(Modernizr.touch && scope.onTouch) {
				scope.onTouch();
			}
		});

		return this;
	};

	Gumby.prototype.helpers = function() {
		if(this.onReady) {
			this.onReady();
		}

		// call oldie() callback if applicable
		if(this.isOldie && this.onOldie) {
			this.onOldie();
		}

		// call touch() callback if applicable
		if(Modernizr.touch && this.onTouch) {
			this.onTouch();
		}
	};

	// public helper - set Gumby ready callback
	Gumby.prototype.ready = function(code) {
		if(code && typeof code === 'function') {
			this.onReady = code;
		}

		return this;
	};

	// public helper - set oldie callback
	Gumby.prototype.oldie = function(code) {
		if(code && typeof code === 'function') {
			this.onOldie = code;
		}

		return this;
	};

	// public helper - set touch callback
	Gumby.prototype.touch = function(code) {
		if(code && typeof code === 'function') {
			this.onTouch = code;
		}

		return this;
	};

	// print to console if available and we're in debug mode
	Gumby.prototype.console = function(type, data) {
		if(!this.debugMode || !window.console) { return; }
		console[console[type] ? type : 'log'](data.length > 1 ? Array.prototype.slice.call(data) : data[0]);
	};

	// pass args onto console method for output
	Gumby.prototype.log = function() { this.console('log', arguments); };
	Gumby.prototype.debug = function() { this.console('debug', arguments); };
	Gumby.prototype.warn = function() { this.console('warn', arguments); };
	Gumby.prototype.error = function() { this.console('error', arguments); };

	// public helper - return debuggin object including uiModules object
	Gumby.prototype.dump = function() {
		return {
			$dom: this.$dom,
			isOldie: this.isOldie,
			touchEvents: this.touchEvents,
			debugMode: this.debugMode,
			autoInit: this.autoInit,
			uiModules: this.uiModules,
			click: this.click
		};
	};

	// grab attribute value, testing data- gumby- and no prefix
	Gumby.prototype.selectAttr = function() {
		var i = 0;

		// any number of attributes can be passed
		for(; i < arguments.length; i++) {
			// various formats
			var attr = arguments[i],
				dataAttr = 'data-'+arguments[i],
				gumbyAttr = 'gumby-'+arguments[i];

			// first test for data-attr
			if(this.is('['+dataAttr+']')) {
				return this.attr(dataAttr) ? this.attr(dataAttr) : true;

			// next test for gumby-attr
			} else if(this.is('['+gumbyAttr+']')) {
				return this.attr(gumbyAttr) ? this.attr(gumbyAttr) : true;

			// finally no prefix
			} else if(this.is('['+attr+']')) {
				return this.attr(attr) ? this.attr(attr) : true;
			}
		}

		// none found
		return false;
	};

	// add an initialisation method
	Gumby.prototype.addInitalisation = function(ref, code) {
		this.inits[ref] = code;
	};

	// initialize a uiModule, single / array of module refs
	Gumby.prototype.initialize = function(ref, all) {
		if(typeof ref === 'object') {
			var i = 0;
			for(i; i < ref.length; i++) {
				if(!this.inits[ref[i]] || typeof this.inits[ref[i]] !== 'function') {
					this.error('Error initializing module: '+ref[i]);
					continue;
				}

				this.inits[ref[i]](all);
			}
		} else if(this.inits[ref] && typeof this.inits[ref] === 'function') {
			this.inits[ref](all);
		} else {
			this.error('Error initializing module: '+ref);
		}

		return this;
	};

	// store a UI module
	Gumby.prototype.UIModule = function(data) {
		var module = data.module;
		this.uiModules[module] = data;
	};

	// loop round and init all UI modules
	Gumby.prototype.initUIModules = function(mods) {
		var x, m, arr = this.uiModules;

		// only initialise specified modules
		if(mods) {
			arr = mods;
		}

		// initialise everything
		for(x in arr) {
			m = mods ? arr[x] : x;
			this.uiModules[m].init();
		}
	};

	window.Gumby = new Gumby();

}(jQuery);

/**
* Gumby Retina
*/
!function($) {

	'use strict';

	function Retina($el) {
		
		Gumby.debug('Initializing Retina', $el);

		this.$el = $el;
		this.imageSrc = this.$el.attr('src');
		this.retinaSrc = this.fetchRetinaImage();
		this.$retinaImg = $(new Image());

		var scope = this;

		// image src not valid
		if(!this.retinaSrc) {
			return false;
		}

		// load retina image
		this.$retinaImg.attr('src', this.retinaSrc).load(function() {
			scope.retinaImageLoaded();
		}).error(function() {
			Gumby.error('Couln\'t load retina image: '+scope.retinaSrc);
		});
	}

	// fetch retina src by appending '@2x' to image string before extension
	Retina.prototype.fetchRetinaImage = function() {
		var imgSrc = this.imageSrc,
			index = this.imageSrc.search(/(\.|\/)(gif|jpe?g|png)$/i);

		// image src is not valid
		if(index < 0) {
			return false;
		}

		// return retina src
		return imgSrc.substr(0, index) + '@2x' + imgSrc.substr(index, imgSrc.length);
	};

	// once retina image loaded swap original src
	Retina.prototype.retinaImageLoaded = function() {
		Gumby.debug('Swapping image for retina version', this.$el);
		Gumby.debug('Triggering onRetina event', this.$el);
		this.$el.attr('src', this.$retinaImg.attr('src')).trigger('gumby.onRetina');
	};

	// add initialisation
	Gumby.addInitalisation('retina', function() {

		// this module is for retina devices only
		if(!window.devicePixelRatio || window.devicePixelRatio <= 1) {
			return;
		}

		$('img[data-retina],img[gumby-retina],img[retina]').each(function() {
			var $this = $(this);
			// this element has already been initialized
			if($this.data('isRetina')) {
				return true;
			}
			// mark element as initialized
			$this.data('isRetina', true);
			new Retina($this);
		});
	});

	// register UI module
	Gumby.UIModule({
		module: 'retina',
		events: ['onRetina'],
		init: function() {
			Gumby.initialize('retina');
		}
	});
}(jQuery);

/**
* Gumby Fixed
*/
!function($) {

	'use strict';

	function Fixed($el) {

		Gumby.debug('Initializing Fixed Position', $el);

		this.$el = $el;

		this.$window = $(window);
		this.fixedPoint = '';
		this.pinPoint = false;
		this.fixedPointjQ = false;
		this.pinPointjQ = false;
		this.offset = 0;
		this.pinOffset = 0;
		this.top = 0;
		this.constrainEl = true;
		this.state = false;
		this.measurements = {
			left: 0,
			width: 0
		};

		// set up module based on attributes
		this.setup();

		var scope = this;

		// monitor scroll and update fixed elements accordingly
		this.$window.on('scroll load', function() {
			scope.monitorScroll();
		});

		// reinitialize event listener
		this.$el.on('gumby.initialize', function() {
			Gumby.debug('Re-initializing Fixed Position', $el);
			scope.setup();
			scope.monitorScroll();
		});
	}

	// set up module based on attributes
	Fixed.prototype.setup = function() {
		var scope = this;

		this.fixedPoint = this.parseAttrValue(Gumby.selectAttr.apply(this.$el, ['fixed']));

		// pin point is optional
		this.pinPoint = Gumby.selectAttr.apply(this.$el, ['pin']) || false;

		// offset from fixed point
		this.offset = Number(Gumby.selectAttr.apply(this.$el, ['offset'])) || 0;

		// offset from pin point
		this.pinOffset = Number(Gumby.selectAttr.apply(this.$el, ['pinoffset'])) || 0;

		// top position when fixed
		this.top = Number(Gumby.selectAttr.apply(this.$el, ['top'])) || 0;

		// constrain can be turned off
		this.constrainEl = Gumby.selectAttr.apply(this.$el, ['constrain']) || true;
		if(this.constrainEl === 'false') {
			this.constrainEl = false;
		}

		// reference to the parent, row/column
		this.$parent = this.$el.parents('.columns, .column, .row');
		this.$parent = this.$parent.length ? this.$parent.first() : false;
		this.parentRow = this.$parent ? !!this.$parent.hasClass('row') : false;

		// if optional pin point set then parse now
		if(this.pinPoint) {
			this.pinPoint = this.parseAttrValue(this.pinPoint);
		}

		this.fixedPointjQ = this.fixedPoint instanceof jQuery;
		this.pinPointjQ = this.pinPoint instanceof jQuery;

		// if we have a parent constrain dimenions
		if(this.$parent && this.constrainEl) {
			// measure up
			this.measure();
			// and on resize reset measurement
			this.$window.resize(function() {
				if(scope.state) {
					scope.measure();
					scope.constrain();
				}
			});
		}
	};

	// monitor scroll and trigger changes based on position
	Fixed.prototype.monitorScroll = function() {
		var scrollAmount = this.$window.scrollTop(),
			// recalculate selector attributes as position may have changed
			fixedPoint = this.fixedPointjQ ? this.fixedPoint.offset().top : this.fixedPoint,
			pinPoint = false,
			timer;

		// if a pin point is set recalculate
		if(this.pinPoint) {
			pinPoint = this.pinPointjQ ? this.pinPoint.offset().top : this.pinPoint;
		}

		// apply offsets
		if(this.offset) { fixedPoint -= this.offset; }
		if(this.pinOffset) { pinPoint -= this.pinOffset; }

		// fix it
		if((scrollAmount >= fixedPoint) && this.state !== 'fixed') {
			if(!pinPoint || scrollAmount < pinPoint) {
				this.fix();
			}
		// unfix it
		} else if(scrollAmount < fixedPoint && this.state === 'fixed') {
			this.unfix();

		// pin it
		} else if(pinPoint && scrollAmount >= pinPoint && this.state !== 'pinned') {
			this.pin();
		}
	};

	// fix the element and update state
	Fixed.prototype.fix = function() {
		Gumby.debug('Element has been fixed', this.$el);
		Gumby.debug('Triggering onFixed event', this.$el);

		this.state = 'fixed';
		this.$el.css({
			'top' : this.top
		}).addClass('fixed').removeClass('unfixed pinned').trigger('gumby.onFixed');

		// if we have a parent constrain dimenions
		if(this.$parent) {
			this.constrain();
		}
	};

	// unfix the element and update state
	Fixed.prototype.unfix = function() {
		Gumby.debug('Element has been unfixed', this.$el);
		Gumby.debug('Triggering onUnfixed event', this.$el);

		this.state = 'unfixed';
		this.$el.addClass('unfixed').removeClass('fixed pinned').trigger('gumby.onUnfixed');
	};

	// pin the element in position
	Fixed.prototype.pin = function() {
		Gumby.debug('Element has been pinned', this.$el);
		Gumby.debug('Triggering onPinned event', this.$el);
		this.state = 'pinned';
		this.$el.css({
			'top' : this.$el.offset().top
		}).addClass('pinned fixed').removeClass('unfixed').trigger('gumby.onPinned');
	};

	// constrain elements dimensions to match width/height
	Fixed.prototype.constrain = function() {
		Gumby.debug("Constraining element", this.$el);
		this.$el.css({
			left: this.measurements.left,
			width: this.measurements.width
		});
	};

	// measure up the parent for constraining
	Fixed.prototype.measure = function() {
		var parentPadding;

		this.measurements.left = this.$parent.offset().left;
		this.measurements.width = this.$parent.width();

		// if element has a parent row then need to consider padding
		if(this.parentRow) {
			parentPadding = Number(this.$parent.css('paddingLeft').replace(/px/, ''));
			if(parentPadding) {
				this.measurements.left += parentPadding;
			}
		}
	};

	// parse attribute values, could be px, top, selector
	Fixed.prototype.parseAttrValue = function(attr) {
		// px value fixed point
		if($.isNumeric(attr)) {
			return Number(attr);
		// 'top' string fixed point
		} else if(attr === 'top') {
			return this.$el.offset().top;
		// selector specified
		} else {
			var $el = $(attr);
			if(!$el.length) {
				Gumby.error('Cannot find Fixed target: '+attr);
				return false;
			}
			return $el;
		}
	};

	// add initialisation
	Gumby.addInitalisation('fixed', function(all) {
		$('[data-fixed],[gumby-fixed],[fixed]').each(function() {
			var $this = $(this);

			// this element has already been initialized
			// and we're only initializing new modules
			if($this.data('isFixed') && !all) {
				return true;

			// this element has already been initialized
			// and we need to reinitialize it
			} else if($this.data('isFixed') && all) {
				$this.trigger('gumby.initialize');
				return true;
			}

			// mark element as initialized
			$this.data('isFixed', true);
			new Fixed($this);
		});
	});

	// register UI module
	Gumby.UIModule({
		module: 'fixed',
		events: ['initialize', 'onFixed', 'onUnfixed'],
		init: function() {
			Gumby.initialize('fixed');
		}
	});
}(jQuery);

/**
* Gumby SkipLink
*/
!function($) {

	'use strict';

	function SkipLink($el) {

		Gumby.debug('Initializing Skiplink', $el);

		this.$el = $el;
		this.targetPos = 0;
		this.duration = 0;
		this.offset = false;
		this.easing = '';
		this.update = false;

		// set up module based on attributes
		this.setup();

		var scope = this;

		// skip to target element on click or trigger of gumby.skipTo event
		this.$el.on(Gumby.click+' gumby.skip', function(e) {
			e.preventDefault();

			if(e.namespace === 'skip') {
				Gumby.debug('Skip event triggered', scope.$el);
			}

			// calculate target on each click if update var set to true
			if(scope.update) {
				scope.calculateTarget(scope.skipTo);

			// skip straight to target
			} else {
				scope.skipTo();
			}
		}).on('gumby.initialize', function() {
			Gumby.debug('Re-initializing Skiplink', scope.$el);
			scope.setup();
		});
	}

	// set up module based on attributes
	SkipLink.prototype.setup = function() {
		this.duration = Number(Gumby.selectAttr.apply(this.$el, ['duration'])) || 200;
		this.offset = Gumby.selectAttr.apply(this.$el, ['offset']) || false;
		this.easing = Gumby.selectAttr.apply(this.$el, ['easing']) || 'swing';
		this.update = Gumby.selectAttr.apply(this.$el, ['update']) ? true : false;

		this.calculateTarget();
	};

	// calculate target px point to skip to
	SkipLink.prototype.calculateTarget = function(cb) {

		var scope = this,
			target = Gumby.selectAttr.apply(this.$el, ['goto']),
			$target;

		// 'top' specified so target is 0px
		if(target == 'top') {
			this.targetPos = 0;

		// px point specified
		} else if($.isNumeric(target)) {
			this.targetPos = Number(target);
		} else {

			// check for element with target as selector
			$target = $(target);

			// target does not exist, we need a target
			if(!$target.length) {
				Gumby.error('Cannot find skiplink target: '+target);
				return false;
			}

			this.targetPos = $target.offset().top;
		}

		if(cb) {
			cb.apply(this);
		}
	};

	// animate body, html scrollTop value to target px point
	SkipLink.prototype.skipTo = function() {
		
		Gumby.debug('Skipping to target', this.$el);

		var scope = this;

		// slide to position of target
		$('html,body').animate({
			'scrollTop' : this.calculateOffset()
		}, this.duration, this.easing).promise().done(function() {

			Gumby.debug('Triggering onComplete event', scope.$el);
			scope.$el.trigger('gumby.onComplete');
		});
	};

	// calculate offset with current target point
	SkipLink.prototype.calculateOffset = function() {
		// no offset so return target here
		if(!this.offset) {
			return this.targetPos;
		}

		// negative / positive
		var op = this.offset.substr(0, 1),
			off = Number(this.offset.substr(1, this.offset.length));

		// subtract offset from target position
		if(op === '-') {
			return this.targetPos - off;
		// add offset to target position
		} else if(op === '+') {
			return this.targetPos + off;
		}
	};

	// add initialisation
	Gumby.addInitalisation('skiplink', function(all) {
		$('.skiplink > a, .skip').each(function() {
			var $this = $(this);

			// this element has already been initialized
			// and we're only initializing new modules
			if($this.data('isSkipLink') && !all) {
				return true;

			// this element has already been initialized
			// and we need to reinitialize it
			} else if($this.data('isSkipLink') && all) {
				$this.trigger('gumby.initialize');
				return true;
			}

			// mark element as initialized
			$this.data('isSkipLink', true);
			new SkipLink($this);
		});
	});

	// register UI module
	Gumby.UIModule({
		module: 'skiplink',
		events: ['initialize', 'onComplete', 'skip'],
		init: function() {
			Gumby.initialize('skiplink');
		}
	});
}(jQuery);

/**
* Gumby Toggles/Switches
*/
!function($) {

	'use strict';

	// Toggle constructor
	function Toggle($el) {
		this.$el = $($el);
		this.targets = [];
		this.on = '';
		this.className = '';
		this.self = false;

		if(this.$el.length) {
			Gumby.debug('Initializing Toggle', $el);
			this.init();
		}
	}

	// Switch constructor
	function Switch($el) {
		this.$el = $($el);
		this.targets = [];
		this.on = '';
		this.className = '';
		this.self = false;

		if(this.$el.length) {
			Gumby.debug('Initializing Switch', $el);
			this.init();
		}
	}

	// intialise toggles, switches will inherit method
	Toggle.prototype.init = function() {
		var scope = this;

		// set up module based on attributes
		this.setup();

		// bind to specified event and trigger
		this.$el.on(this.on, function(e) {
			e.preventDefault();
			scope.trigger(scope.triggered);

		// listen for gumby.trigger to dynamically trigger toggle/switch
		}).on('gumby.trigger', function() {
			Gumby.debug('Trigger event triggered', scope.$el);
			scope.trigger(scope.triggered);
		// re-initialize module
		}).on('gumby.initialize', function() {
			Gumby.debug('Re-initializing '+scope.constructor, $el);
			scope.setup();
		});
	};

	// set up module based on attributes
	Toggle.prototype.setup = function() {
		this.targets = this.parseTargets();
		this.on = Gumby.selectAttr.apply(this.$el, ['on']) || Gumby.click;
		this.className = Gumby.selectAttr.apply(this.$el, ['classname']) || 'active';
		this.self = Gumby.selectAttr.apply(this.$el, ['self']) === 'false';
	};

	// parse data-for attribute, switches will inherit method
	Toggle.prototype.parseTargets = function() {
		var targetStr = Gumby.selectAttr.apply(this.$el, ['trigger']),
			secondaryTargets = 0,
			targets = [];

		// no targets so return false
		if(!targetStr) {
			return false;
		}

		secondaryTargets = targetStr.indexOf('|');

		// no secondary targets specified so return single target
		if(secondaryTargets === -1) {
			if(!this.checkTargets([targetStr])) {
				return false;
			}
			return [$(targetStr)];
		}

		// return array of both targets, split and return 0, 1
		targets = targetStr.split('|');
		if(!this.checkTargets(targets)) {
			return false;
		}
		return targets.length > 1 ? [$(targets[0]), $(targets[1])] : [$(targets[0])];
	};

	Toggle.prototype.checkTargets = function(targets) {
		var i = 0;

		for(i; i < targets.length; i++) {
			if(targets[i] && !$(targets[i]).length) {
				Gumby.error('Cannot find '+this.constructor.name+' target: '+targets[i]);
				return false;
			}
		}

		return true;
	};

	// call triggered event and pass target data
	Toggle.prototype.triggered = function() {
		// trigger gumby.onTrigger event and pass array of target status data
		Gumby.debug('Triggering onTrigger event', this.$el);
		this.$el.trigger('gumby.onTrigger', [this.$el.hasClass(this.className)]);
	};

	// Switch object inherits from Toggle
	Switch.prototype = new Toggle();
	Switch.prototype.constructor = Switch;

	// Toggle specific trigger method
	Toggle.prototype.trigger = function(cb) {

		Gumby.debug('Triggering Toggle', this.$el);

		var $target;

		// no targets just toggle active class on toggle
		if(!this.targets) {
			this.$el.toggleClass(this.className);

		// combine single target with toggle and toggle active class
		} else if(this.targets.length == 1) {
			this.$el.add(this.targets[0]).toggleClass(this.className);

		// if two targets check active state of first
		// always combine toggle and first target
		} else if(this.targets.length > 1) {
			if(this.targets[0].hasClass(this.className)) {
				$target = this.targets[0];
				
				// add this element to it unless gumby-self set
				if(!this.self) {
					$target = $target.add(this.$el);
				}

				$target.removeClass(this.className);
				this.targets[1].addClass(this.className);
			} else {
				$target = this.targets[0];
				
				// add this element to it unless gumby-self set
				if(!this.self) {
					$target = $target.add(this.$el);
				}

				$target.addClass(this.className);
				this.targets[1].removeClass(this.className);
			}
		}

		// call event handler here, applying scope of object Switch/Toggle
		if(cb && typeof cb === 'function') {
			cb.apply(this);
		}
	};

	// Switch specific trigger method
	Switch.prototype.trigger = function(cb) {

		Gumby.debug('Triggering Switch', this.$el);

		var $target;

		// no targets just add active class to switch
		if(!this.targets) {
			this.$el.addClass(this.className);

		// combine single target with switch and add active class
		} else if(this.targets.length == 1) {
			$target = this.targets[0];
				
			// add this element to it unless gumby-self set
			if(!this.self) {
				$target = $target.add(this.$el);
			}

			$target.addClass(this.className);

		// if two targets check active state of first
		// always combine switch and first target
		} else if(this.targets.length > 1) {
			$target = this.targets[0];
				
			// add this element to it unless gumby-self set
			if(!this.self) {
				$target = $target.add(this.$el);
			}

			$target.addClass(this.className);
			this.targets[1].removeClass(this.className);
		}

		// call event handler here, applying scope of object Switch/Toggle
		if(cb && typeof cb === 'function') {
			cb.apply(this);
		}
	};

	// add toggle initialisation
	Gumby.addInitalisation('toggles', function(all) {
		$('.toggle').each(function() {
			var $this = $(this);

			// this element has already been initialized
			// and we're only initializing new modules
			if($this.data('isToggle') && !all) {
				return true;

			// this element has already been initialized
			// and we need to reinitialize it
			} else if($this.data('isToggle') && all) {
				$this.trigger('gumby.initialize');
			}

			// mark element as initialized
			$this.data('isToggle', true);
			new Toggle($this);
		});
	});

	// add switches initialisation
	Gumby.addInitalisation('switches', function(all) {
		$('.switch').each(function() {
			var $this = $(this);

			// this element has already been initialized
			// and we're only initializing new modules
			if($this.data('isSwitch') && !all) {
				return true;

			// this element has already been initialized
			// and we need to reinitialize it
			} else if($this.data('isSwitch') && all) {
				$this.trigger('gumby.initialize');
				return true;
			}

			// mark element as initialized
			$this.data('isSwitch', true);
			new Switch($this);
		});
	});

	// register UI module
	Gumby.UIModule({
		module: 'toggleswitch',
		events: ['initialize', 'trigger', 'onTrigger'],
		init: function() {
			// Run initialize methods
			Gumby.initialize('switches');
			Gumby.initialize('toggles');
		}
	});
}(jQuery);

/**
* Gumby Checkbox
*/
!function($) {

	'use strict';

	function Checkbox($el) {

		Gumby.debug('Initializing Checkbox', $el);

		this.$el = $el;
		this.$input = this.$el.find('input[type=checkbox]');

		var scope = this;

		// listen for click event and custom gumby check/uncheck events
		this.$el.on(Gumby.click, function(e) {
			// prevent checkbox checking, we'll do that manually
			e.preventDefault();

			// do nothing if checkbox is disabled
            if(scope.$input.is('[disabled]')) {
                return;
            }

			// check/uncheck
			if(scope.$el.hasClass('checked')) {
				scope.update(false);
			} else {
				scope.update(true);
			}
		}).on('gumby.check', function() {
			Gumby.debug('Check event triggered', scope.$el);
			scope.update(true);
		}).on('gumby.uncheck', function() {
			Gumby.debug('Uncheck event triggered', scope.$el);
			scope.update(false);
		});

		// update any prechecked on load
		if(this.$input.prop('checked') || this.$el.hasClass('checked')) {
			scope.update(true);
		}
	}

	// update checkbox, check equals true/false to sepcify check/uncheck
	Checkbox.prototype.update = function(check) {
		var $span = this.$el.find('span');

		// check checkbox - check input, add checked class, append <i>
		if(check) {

			Gumby.debug('Checking Checkbox', this.$el);

			$span.append('<i class="icon-check" />');
			this.$input.prop('checked', true);

			Gumby.debug('Triggering onCheck event', this.$el);
			Gumby.debug('Triggering onChange event', this.$el);

			this.$el.addClass('checked').trigger('gumby.onCheck').trigger('gumby.onChange');

		// uncheck checkbox - uncheck input, remove checked class, remove <i>
		} else {
			
			Gumby.debug('Unchecking Checkbox', this.$el);

			this.$input.prop('checked', false);
			$span.find('i').remove();

			Gumby.debug('Triggering onUncheck event', this.$el);
			Gumby.debug('Triggering onChange event', this.$el);

			this.$el.removeClass('checked').trigger('gumby.onUncheck').trigger('gumby.onChange');
		}
	};

	// add initialisation
	Gumby.addInitalisation('checkbox', function() {
		$('.checkbox').each(function() {
			var $this = $(this);
			// this element has already been initialized
			if($this.data('isCheckbox')) {
				return true;
			}
			// mark element as initialized
			$this.data('isCheckbox', true);
			new Checkbox($this);
		});
	});

	// register UI module
	Gumby.UIModule({
		module: 'checkbox',
		events: ['onCheck', 'onUncheck', 'onChange', 'check', 'uncheck'],
		init: function() {
			Gumby.initialize('checkbox');
		}
	});
}(jQuery);

/**
* Gumby Checkbox
*/
!function($) {

	'use strict';

	function Checkbox($el) {

		Gumby.debug('Initializing Checkbox', $el);

		this.$el = $el;
		this.$input = this.$el.find('input[type=checkbox]');

		var scope = this;

		// listen for click event and custom gumby check/uncheck events
		this.$el.on(Gumby.click, function(e) {
			// prevent checkbox checking, we'll do that manually
			e.preventDefault();

			// do nothing if checkbox is disabled
            if(scope.$input.is('[disabled]')) {
                return;
            }

			// check/uncheck
			if(scope.$el.hasClass('checked')) {
				scope.update(false);
			} else {
				scope.update(true);
			}
		}).on('gumby.check', function() {
			Gumby.debug('Check event triggered', scope.$el);
			scope.update(true);
		}).on('gumby.uncheck', function() {
			Gumby.debug('Uncheck event triggered', scope.$el);
			scope.update(false);
		});

		// update any prechecked on load
		if(this.$input.prop('checked') || this.$el.hasClass('checked')) {
			scope.update(true);
		}
	}

	// update checkbox, check equals true/false to sepcify check/uncheck
	Checkbox.prototype.update = function(check) {
		var $span = this.$el.find('span');

		// check checkbox - check input, add checked class, append <i>
		if(check) {

			Gumby.debug('Checking Checkbox', this.$el);

			$span.append('<i class="icon-check" />');
			this.$input.prop('checked', true);

			Gumby.debug('Triggering onCheck event', this.$el);
			Gumby.debug('Triggering onChange event', this.$el);

			this.$el.addClass('checked').trigger('gumby.onCheck').trigger('gumby.onChange');

		// uncheck checkbox - uncheck input, remove checked class, remove <i>
		} else {
			
			Gumby.debug('Unchecking Checkbox', this.$el);

			this.$input.prop('checked', false);
			$span.find('i').remove();

			Gumby.debug('Triggering onUncheck event', this.$el);
			Gumby.debug('Triggering onChange event', this.$el);

			this.$el.removeClass('checked').trigger('gumby.onUncheck').trigger('gumby.onChange');
		}
	};

	// add initialisation
	Gumby.addInitalisation('checkbox', function() {
		$('.checkbox').each(function() {
			var $this = $(this);
			// this element has already been initialized
			if($this.data('isCheckbox')) {
				return true;
			}
			// mark element as initialized
			$this.data('isCheckbox', true);
			new Checkbox($this);
		});
	});

	// register UI module
	Gumby.UIModule({
		module: 'checkbox',
		events: ['onCheck', 'onUncheck', 'onChange', 'check', 'uncheck'],
		init: function() {
			Gumby.initialize('checkbox');
		}
	});
}(jQuery);

/**
* Gumby RadioBtn
*/
!function($) {

	'use strict';

	function RadioBtn($el) {

		Gumby.debug('Initializing Radio Button', $el);

		this.$el = $el;
		this.$input = this.$el.find('input[type=radio]');

		var scope = this;

		// listen for click event and custom gumby check event
		this.$el.on(Gumby.click, function(e) {
			// prevent radio button checking, we'll do that manually
			e.preventDefault();

			// do nothing if radio is disabled
            if (scope.$input.is('[disabled]')) {
                return;
            }

			// check radio button
			scope.update();
		}).on('gumby.check', function() {
			Gumby.debug('Check event triggered', scope.$el);
			scope.update();
		});

		// update any prechecked on load
		if(this.$input.prop('checked') || this.$el.hasClass('checked')) {
			scope.update(true);
		}
	}

	// check radio button, uncheck all others in name group
	RadioBtn.prototype.update = function() {

		// already checked so no need to update
		if(this.$el.hasClass('checked') && this.$input.prop('checked') && this.$el.find('i.icon-dot').length) {
			return;
		}

		Gumby.debug('Updating Radio Button group', this.$el);

		var $span = this.$el.find('span'),
			// the group of radio buttons
			group = 'input[name="'+this.$input.attr('name')+'"]';

		// uncheck radio buttons in same group - uncheck input, remove checked class, remove <i>
		$('.radio').has(group).removeClass('checked')
				.find('input').prop('checked', false).end()
				.find('i').remove();

		// check this radio button - check input, add checked class, append <i>
		this.$input.prop('checked', true);
		$span.append('<i class="icon-dot" />');

		Gumby.debug('Triggering onCheck event', this.$el);

		this.$el.addClass('checked').trigger('gumby.onCheck');
	};

	// add initialisation
	Gumby.addInitalisation('radiobtn', function() {
		$('.radio').each(function() {
			var $this = $(this);
			// this element has already been initialized
			if($this.data('isRadioBtn')) {
				return true;
			}
			// mark element as initialized
			$this.data('isRadioBtn', true);
			new RadioBtn($this);
		});
	});

	// register UI module
	Gumby.UIModule({
		module: 'radiobtn',
		events: ['onCheck', 'check'],
		init: function() {
			Gumby.initialize('radiobtn');
		}
	});
}(jQuery);

/**
* Gumby Tabs
*/
!function($) {

	'use strict';

	function Tabs($el) {

		Gumby.debug('Initializing Tabs', $el);

		this.$el = $el;
		this.$nav = this.$el.find('> ul.tab-nav > li');
		this.$content = this.$el.children('.tab-content');

		var scope = this;

		// listen for click event on tab nav and custom gumby set event
		this.$nav.children('a').on(Gumby.click, function(e) {
			e.preventDefault();
			scope.click($(this));
		});

		// listen for gumby.set value for dynamically set tabs
		this.$el.on('gumby.set', function(e, index) {
			Gumby.debug('Set event triggered', scope.$el);
			scope.set(e, index);
		});
	}

	// handle tab nav click event
	Tabs.prototype.click = function($this) {
		// index of item to activate
		var index = $this.parent().index();

		if(this.$nav.eq(index).add(this.$content.eq(index)).hasClass('active')) {
			return;
		}

		Gumby.debug('Setting active tab to '+index, this.$el);

		// deactivate other tab navigation and content
		this.$nav.add(this.$content).removeClass('active');

		// activate this tab nav link and content
		this.$nav.eq(index).add(this.$content.eq(index)).addClass('active');

		// trigger gumby.change event and pass current active tab index
		Gumby.debug('Triggering onChange event', this.$el);
		this.$el.trigger('gumby.onChange', index);
	};

	// set specific tab
	Tabs.prototype.set = function(e, index) {
		this.$nav.eq(index).find('a').trigger(Gumby.click);
	};

	// add initialisation
	Gumby.addInitalisation('tabs', function() {
		$('.tabs').each(function() {
			var $this = $(this);
			// this element has already been initialized
			if($this.data('isTabs')) {
				return true;
			}
			// mark element as initialized
			$this.data('isTabs', true);
			new Tabs($this);
		});
	});

	// register UI module
	Gumby.UIModule({
		module: 'tabs',
		events: ['onChange', 'set'],
		init: function() {
			Gumby.initialize('tabs');
		}
	});
}(jQuery);

/**
* Gumby Navbar
*/
!function($) {

	'use strict';

	// define and init module on touch enabled devices only
	if(!Gumby.gumbyTouch) {
		return;
	}

	function Navbar($el) {

		Gumby.debug('Initializing Navbar', $el);

		this.$el = $el;
		this.$dropDowns = this.$el.find('li:has(.dropdown)');
		var scope = this;

		var persist = this.$el.attr('gumby-persist');
		if(typeof persist === 'undefined' && persist !== 'false') {
			this.$el.find('li:not(:has(.dropdown)) a').on(Gumby.click, function() {
				scope.$el.find('ul').removeClass('active');
			});
		}

		// when navbar items
		this.$dropDowns
		// are tapped hide/show dropdowns
		.on(Gumby.click, this.toggleDropdown)
		// are swiped right open link
		.on('swiperight', this.openLink);

		// if there's a link set
		if(this.$dropDowns.children('a').attr('href') !== '#') {
			// append an icon
			this.$dropDowns.children('a').append('<i class="icon-popup"></i>').children('i')
			// and bind to click event to open link
			.on(Gumby.click, this.openLink);
		}

		// override with childlinks
		this.$el.find('li:not(:has(.dropdown)) a[href]').on(Gumby.click, this.openLink);
	}

	Navbar.prototype.toggleDropdown = function(e) {
		e.preventDefault();

		if($(this).parents('.dropdown')) {
			e.stopImmediatePropagation();
		}

		if($(e.target).is('i')) {
			return;
		}

		var $this = $(this);

		if($this.hasClass('active')) {
			$this.removeClass('active');
		} else {
			$this.addClass('active');
		}
	};

	// handle opening list item link
	Navbar.prototype.openLink = function(e) {
		e.preventDefault();

		var $this = $(this),
			$el = $this, href;

		// tapped icon
		if($this.is('i')) {
			$el = $this.parent('a');
		// swiped li
		} else if($this.is('li')) {
			$el = $this.children('a');
		}

		href = $el.attr('href');

		// open in new window
		if($el.attr('target') == 'blank') {
			window.open(href);
		// regular relocation
		} else {
			window.location = href;
		}
	};

	// add initialisation
	Gumby.addInitalisation('navbar', function() {
		$('.navbar').each(function() {
			var $this = $(this);
			// this element has already been initialized
			if($this.data('isNavbar')) {
				return true;
			}
			// mark element as initialized
			$this.data('isNavbar', true);
			new Navbar($this);
		});
	});

	// register UI module
	Gumby.UIModule({
		module: 'navbar',
		events: [],
		init: function() {
			Gumby.initialize('navbar');
		}
	});
}(jQuery);

/**
* Gumby jQuery Validation Plugin
*/
!function($) {

	'use strict';

	function Validation($this, req) {

		if(Gumby) {
			Gumby.debug('Initializing Validation', $this);
		}

		// input and holder .field
		this.$this = $this;
		this.$field = this.$this.parents('.field');

		// supplied validation function with default length check
		this.req = req || function() {
			return !!this.$this.val().length;
		};

		// reference to this class
		var scope = this;

		// checkboxes and radio buttons use gumby.onChange event to validate
		if(this.$this.is('[type=checkbox], [type=radio]')) {
			this.$field = this.$this.parent('label');
			this.$field.on('gumby.onChange', function() {
				scope.validate();
			});

		// selects validate on change
		} else if(this.$this.is('select')) {
			this.$field = this.$this.parents('.picker');
			this.$field.on('change', function() {
				scope.validate();
			});

		// others (text input, textarea) use blur
		} else {
			this.$this.on('blur', function(e) {
				// ignore tab
				if(e.which !== 9) {
					scope.validate();
				}
			});
		}
	}

	// validate field
	Validation.prototype.validate = function() {

		var result = this.req(this.$this);

		// failed
		if(!result) {
			this.$field.removeClass('success').addClass('danger');

		// passed
		} else {
		//} else if(this.$field.hasClass('danger')) {
			this.$field.removeClass('danger').addClass('success');
		}

		return result;
	};

	// jQuery plugin definition
	$.fn.validation = function(options) {

		var // extend params with defaults
			settings = $.extend({
				submit : false,
				fail: false,
				required : []
			}, options),
			// store validation objects
			validations = [];

		// init each form plugin is called on
		return this.each(function() {

			// no required fields so plugin is pointless
			if(!settings.required.length) {
				return false;
			}

			var $this = $(this),
				reqLength = settings.required.length,
				i;

			// loop round each required field and instantiate new validation object
			for(i = 0; i < reqLength; i++) {
				validations.push(new Validation(
					$this.find('[name="'+settings.required[i].name+'"]'),
					settings.required[i].validate || false
				));
			}

			// hijack submit event
			$this.on('submit', function(e) {

				// reference to whole form pass/fail
				var failed = false;

				// if no passed attribute found we should halt form submit
				if(!$this.data('passed')) {
					e.preventDefault();

					// loop round validation objects and validate each
					var reqLength = validations.length, i;
					for(i = 0; i < reqLength; i++) {
						if(!validations[i].validate()) {
							failed = true;
						}
					}

					// passed
					if(!failed) {
						// if submit method present call that otherwise submit form
						if(settings.submit && typeof settings.submit === 'function') {
							settings.submit($this.serializeArray());
							return;
						}

						// store passed bool and re-submit
						$this.data('passed', true).submit();

						// failed
						} else {
						// call fail method if present
						if(settings.fail && typeof settings.fail === 'function') {
							settings.fail();
							return;
						}
					}
				}
			});
		});
	};
}(jQuery);

/**
* Gumby Init
*/

!function($) {

	'use strict';

	// not touch device or no touch events required so auto initialize here
	if((!Gumby.touchDevice || !Gumby.touchEvents) && Gumby.autoInit) {
		window.Gumby.init();

	// load jQuery mobile touch events
	} else if(Gumby.touchEvents && Gumby.touchDevice) {
		Gumby.debug('Loading jQuery mobile touch events');
		// set timeout to 2sec
		yepnope.errorTimeout = 2000;
		Modernizr.load({
			test: Modernizr.touch,
			yep: Gumby.touchEvents+'/jquery.mobile.custom.js',
			complete: function() {
				// error loading jQuery mobile
				if(!$.mobile) {
					Gumby.error('Error loading jQuery mobile touch events');
				}

				// if not auto initializing
				// this will allow helpers to fire when initialized
				Gumby.touchEventsLoaded = true;

				// auto initialize
				if(Gumby.autoInit) {
					window.Gumby.init();

				// if already manually initialized then fire helpers
				} else if(Gumby.uiModulesReady) {
					Gumby.helpers();
				}
			}
		});
	}

	// if AMD return Gumby object to define
	if(typeof define == "function" && define.amd) {
		define(window.Gumby);
	}
}(jQuery);
