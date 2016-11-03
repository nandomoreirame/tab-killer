(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _metal = require('metal');

var _metalDom = require('metal-dom');

var _ComponentRegistry = require('./ComponentRegistry');

var _ComponentRegistry2 = _interopRequireDefault(_ComponentRegistry);

var _ComponentRenderer = require('./ComponentRenderer');

var _ComponentRenderer2 = _interopRequireDefault(_ComponentRenderer);

var _metalEvents = require('metal-events');

var _metalState = require('metal-state');

var _metalState2 = _interopRequireDefault(_metalState);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Component collects common behaviors to be followed by UI components, such
 * as Lifecycle, CSS classes management, events encapsulation and support for
 * different types of rendering.
 * Rendering logic can be done by either:
 *     - Listening to the `render` event inside the `created` lifecycle function
 *       and adding the rendering logic to the listener.
 *     - Using an existing implementation of `ComponentRenderer` like `Soy`,
 *       and following its patterns.
 *     - Building your own implementation of a `ComponentRenderer`.
 * Specifying the renderer that will be used can be done by setting the RENDERER
 * static variable to the renderer's constructor function.
 *
 * Example:
 *
 * <code>
 * class CustomComponent extends Component {
 *   constructor(config) {
 *     super(config);
 *   }
 *
 *   created() {
 *   }
 *
 *   rendered() {
 *   }
 *
 *   attached() {
 *   }
 *
 *   detached() {
 *   }
 * }
 *
 * CustomComponent.RENDERER = MyRenderer;
 *
 * CustomComponent.STATE = {
 *   title: { value: 'Title' },
 *   fontSize: { value: '10px' }
 * };
 * </code>
 *
 * @extends {State}
 */

var Component = function (_State) {
	_inherits(Component, _State);

	/**
  * Constructor function for `Component`.
  * @param {Object=} opt_config An object with the initial values for this
  *     component's state.
  * @param {boolean|string|Element=} opt_parentElement The element where the
  *     component should be rendered. Can be given as a selector or an element.
  *     If `false` is passed, the component won't be rendered automatically
  *     after created.
  * @constructor
  */

	function Component(opt_config, opt_parentElement) {
		_classCallCheck(this, Component);

		/**
   * All listeners that were attached until the `DomEventEmitterProxy` instance
   * was created.
   * @type {!Object<string, bool>}
   * @protected
   */

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Component).call(this, opt_config));

		_this.attachedListeners_ = {};

		/**
   * Gets all nested components.
   * @type {!Array<!Component>}
   */
		_this.components = {};

		/**
   * Instance of `DomEventEmitterProxy` which proxies events from the component's
   * element to the component itself.
   * @type {DomEventEmitterProxy}
   * @protected
   */
		_this.elementEventProxy_ = null;

		/**
   * The `EventHandler` instance for events attached from the `events` state key.
   * @type {!EventHandler}
   * @protected
   */
		_this.eventsStateKeyHandler_ = new _metalEvents.EventHandler();

		/**
   * Whether the element is in document.
   * @type {boolean}
   */
		_this.inDocument = false;

		/**
   * The initial config option passed to this constructor.
   * @type {!Object}
   * @protected
   */
		_this.initialConfig_ = opt_config || {};

		/**
   * Whether the element was rendered.
   * @type {boolean}
   */
		_this.wasRendered = false;

		/**
   * The component's element will be appended to the element this variable is
   * set to, unless the user specifies another parent when calling `render` or
   * `attach`.
   * @type {!Element}
   */
		_this.DEFAULT_ELEMENT_PARENT = document.body;

		_metal.core.mergeSuperClassesProperty(_this.constructor, 'ELEMENT_CLASSES', _this.mergeElementClasses_);

		_this.renderer_ = _this.createRenderer();
		_this.renderer_.on('rendered', _this.rendered.bind(_this));

		_this.on('stateChanged', _this.handleStateChanged_);
		_this.newListenerHandle_ = _this.on('newListener', _this.handleNewListener_);
		_this.on('eventsChanged', _this.onEventsChanged_);
		_this.addListenersFromObj_(_this.events);

		_this.created();
		if (opt_parentElement !== false) {
			_this.render_(opt_parentElement);
		}
		_this.on('elementChanged', _this.onElementChanged_);
		return _this;
	}

	/**
  * Adds the necessary classes to the component's element.
  */


	_createClass(Component, [{
		key: 'addElementClasses',
		value: function addElementClasses() {
			var classesToAdd = this.constructor.ELEMENT_CLASSES_MERGED;
			if (this.elementClasses) {
				classesToAdd = classesToAdd + ' ' + this.elementClasses;
			}
			_metalDom.dom.addClasses(this.element, classesToAdd);
		}

		/**
   * Adds the listeners specified in the given object.
   * @param {Object} events
   * @protected
   */

	}, {
		key: 'addListenersFromObj_',
		value: function addListenersFromObj_(events) {
			var eventNames = Object.keys(events || {});
			for (var i = 0; i < eventNames.length; i++) {
				var info = this.extractListenerInfo_(events[eventNames[i]]);
				if (info.fn) {
					var handler;
					if (info.selector) {
						handler = this.delegate(eventNames[i], info.selector, info.fn);
					} else {
						handler = this.on(eventNames[i], info.fn);
					}
					this.eventsStateKeyHandler_.add(handler);
				}
			}
		}

		/**
   * Invokes the attached Lifecycle. When attached, the component element is
   * appended to the DOM and any other action to be performed must be
   * implemented in this method, such as, binding DOM events. A component can
   * be re-attached multiple times.
   * @param {(string|Element)=} opt_parentElement Optional parent element
   *     to render the component.
   * @param {(string|Element)=} opt_siblingElement Optional sibling element
   *     to render the component before it. Relevant when the component needs
   *     to be rendered before an existing element in the DOM.
   * @protected
   * @chainable
   */

	}, {
		key: 'attach',
		value: function attach(opt_parentElement, opt_siblingElement) {
			if (!this.inDocument) {
				this.renderElement_(opt_parentElement, opt_siblingElement);
				this.inDocument = true;
				this.emit('attached', {
					parent: opt_parentElement,
					sibling: opt_siblingElement
				});
				this.attached();
			}
			return this;
		}

		/**
   * Lifecycle. When attached, the component element is appended to the DOM
   * and any other action to be performed must be implemented in this method,
   * such as, binding DOM events. A component can be re-attached multiple
   * times, therefore the undo behavior for any action performed in this phase
   * must be implemented on the detach phase.
   */

	}, {
		key: 'attached',
		value: function attached() {}

		/**
   * Adds a sub component, creating it if it doesn't yet exist.
   * @param {string} key
   * @param {string|!Function} componentNameOrCtor
   * @param {Object=} opt_data
   * @param {boolean=} opt_dontDispose Optional flag indicating that if an
   *     existing sub component is replaced, it shouldn't be disposed as well.
   * @return {!Component}
   */

	}, {
		key: 'addSubComponent',
		value: function addSubComponent(key, componentNameOrCtor, opt_data, opt_dontDispose) {
			var ConstructorFn = componentNameOrCtor;
			if (_metal.core.isString(ConstructorFn)) {
				ConstructorFn = _ComponentRegistry2.default.getConstructor(componentNameOrCtor);
			}

			var component = this.components[key];
			if (component && component.constructor !== ConstructorFn) {
				if (!opt_dontDispose) {
					component.dispose();
				}
				component = null;
			}

			if (!component) {
				this.components[key] = new ConstructorFn(opt_data, false);
			}
			return this.components[key];
		}

		/**
   * Lifecycle. This is called when the component has just been created, before
   * it's rendered.
   */

	}, {
		key: 'created',
		value: function created() {}

		/**
   * Creates the renderer for this component. Sub classes can override this to
   * return a custom renderer as needed.
   * @return {!ComponentRenderer}
   */

	}, {
		key: 'createRenderer',
		value: function createRenderer() {
			_metal.core.mergeSuperClassesProperty(this.constructor, 'RENDERER', _metal.array.firstDefinedValue);
			return new this.constructor.RENDERER_MERGED(this);
		}

		/**
   * Listens to a delegate event on the component's element.
   * @param {string} eventName The name of the event to listen to.
   * @param {string} selector The selector that matches the child elements that
   *   the event should be triggered for.
   * @param {!function(!Object)} callback Function to be called when the event is
   *   triggered. It will receive the normalized event object.
   * @return {!EventHandle} Can be used to remove the listener.
   */

	}, {
		key: 'delegate',
		value: function delegate(eventName, selector, callback) {
			return this.on('delegate:' + eventName + ':' + selector, callback);
		}

		/**
   * Invokes the detached Lifecycle. When detached, the component element is
   * removed from the DOM and any other action to be performed must be
   * implemented in this method, such as, unbinding DOM events. A component
   * can be detached multiple times.
   * @chainable
   */

	}, {
		key: 'detach',
		value: function detach() {
			if (this.inDocument) {
				if (this.element && this.element.parentNode) {
					this.element.parentNode.removeChild(this.element);
				}
				this.inDocument = false;
				this.detached();
			}
			this.emit('detached');
			return this;
		}

		/**
   * Lifecycle. When detached, the component element is removed from the DOM
   * and any other action to be performed must be implemented in this method,
   * such as, unbinding DOM events. A component can be detached multiple
   * times, therefore the undo behavior for any action performed in this phase
   * must be implemented on the attach phase.
   */

	}, {
		key: 'detached',
		value: function detached() {}

		/**
   * Lifecycle. Called when the component is disposed. Should be overridden by
   * sub classes to dispose of any internal data or events.
   */

	}, {
		key: 'disposed',
		value: function disposed() {}

		/**
   * @inheritDoc
   */

	}, {
		key: 'disposeInternal',
		value: function disposeInternal() {
			this.disposed();

			this.detach();

			if (this.elementEventProxy_) {
				this.elementEventProxy_.dispose();
				this.elementEventProxy_ = null;
			}

			this.disposeSubComponents(Object.keys(this.components));
			this.components = null;

			this.renderer_.dispose();
			this.renderer_ = null;

			_get(Object.getPrototypeOf(Component.prototype), 'disposeInternal', this).call(this);
		}

		/**
   * Calls `dispose` on all subcomponents.
   * @param {!Array<string>} keys
   */

	}, {
		key: 'disposeSubComponents',
		value: function disposeSubComponents(keys) {
			for (var i = 0; i < keys.length; i++) {
				var component = this.components[keys[i]];
				if (component && !component.isDisposed()) {
					component.dispose();
					delete this.components[keys[i]];
				}
			}
		}

		/**
   * Extracts listener info from the given value.
   * @param {function()|string|{selector:string,fn:function()|string}} value
   * @return {!{selector:string,fn:function()}}
   * @protected
   */

	}, {
		key: 'extractListenerInfo_',
		value: function extractListenerInfo_(value) {
			var info = {
				fn: value
			};
			if (_metal.core.isObject(value) && !_metal.core.isFunction(value)) {
				info.selector = value.selector;
				info.fn = value.fn;
			}
			if (_metal.core.isString(info.fn)) {
				info.fn = this.getListenerFn(info.fn);
			}
			return info;
		}

		/**
   * Gets the configuration object that was passed to this component's constructor.
   * @return {!Object}
   */

	}, {
		key: 'getInitialConfig',
		value: function getInitialConfig() {
			return this.initialConfig_;
		}

		/**
   * Gets the listener function from its name. If the name is prefixed with a
   * component id, the function will be called on that specified component. Otherwise
   * it will be called on this component instead.
   * @param {string} fnName
   * @return {function()}
   */

	}, {
		key: 'getListenerFn',
		value: function getListenerFn(fnName) {
			if (_metal.core.isFunction(this[fnName])) {
				return this[fnName].bind(this);
			} else {
				console.error('No function named "' + fnName + '" was found in the ' + 'component "' + _metal.core.getFunctionName(this.constructor) + '". Make ' + 'sure that you specify valid function names when adding inline listeners.');
			}
		}

		/**
   * Calls the synchronization function for the state key.
   * @param {string} key
   * @param {Object.<string, Object>=} opt_change Object containing newVal and
   *     prevVal keys.
   * @protected
   */

	}, {
		key: 'fireStateKeyChange_',
		value: function fireStateKeyChange_(key, opt_change) {
			var fn = this['sync' + key.charAt(0).toUpperCase() + key.slice(1)];
			if (_metal.core.isFunction(fn)) {
				if (!opt_change) {
					opt_change = {
						newVal: this[key],
						prevVal: undefined
					};
				}
				fn.call(this, opt_change.newVal, opt_change.prevVal);
			}
		}

		/**
   * Gets the `ComponentRenderer` instance being used.
   * @return {!ComponentRenderer}
   */

	}, {
		key: 'getRenderer',
		value: function getRenderer() {
			return this.renderer_;
		}

		/**
   * Handles state batch changes. Calls any existing `sync` functions that
   * match the changed state keys.
   * @param {Event} event
   * @protected
   */

	}, {
		key: 'handleStateChanged_',
		value: function handleStateChanged_(event) {
			this.syncStateFromChanges_(event.changes);
			this.emit('stateSynced', event);
		}

		/**
   * Handles the `newListener` event. Just flags that this event type has been
   * attached, so we can start proxying it when `DomEventEmitterProxy` is created.
   * @param {string} event
   * @protected
   */

	}, {
		key: 'handleNewListener_',
		value: function handleNewListener_(event) {
			this.attachedListeners_[event] = true;
		}

		/**
   * Merges an array of values for the ELEMENT_CLASSES property into a single object.
   * @param {!Array.<string>} values The values to be merged.
   * @return {!string} The merged value.
   * @protected
   */

	}, {
		key: 'mergeElementClasses_',
		value: function mergeElementClasses_(values) {
			var marked = {};
			return values.filter(function (val) {
				if (!val || marked[val]) {
					return false;
				} else {
					marked[val] = true;
					return true;
				}
			}).join(' ');
		}

		/**
   * Fired when the `element` state value is changed.
   * @param {!Object} event
   * @protected
   */

	}, {
		key: 'onElementChanged_',
		value: function onElementChanged_(event) {
			if (event.prevVal === event.newVal) {
				// The `elementChanged` event will be fired whenever the element is set,
				// even if its value hasn't actually changed, since that's how State
				// handles objects. We need to check manually here.
				return;
			}

			this.setUpProxy_();
			this.elementEventProxy_.setOriginEmitter(event.newVal);
			this.addElementClasses();
			this.syncVisible(this.visible);
		}

		/**
   * Fired when the `events` state value is changed.
   * @param {!Object} event
   * @protected
   */

	}, {
		key: 'onEventsChanged_',
		value: function onEventsChanged_(event) {
			this.eventsStateKeyHandler_.removeAllListeners();
			this.addListenersFromObj_(event.newVal);
		}

		/**
   * Lifecycle. Renders the component into the DOM.
   *
   * Render Lifecycle:
   *   render event - The "render" event is emitted. Renderers act on this step.
   *   state synchronization - All synchronization methods are called.
   *   attach - Attach Lifecycle is called.
   *
   * @param {(string|Element|boolean)=} opt_parentElement Optional parent element
   *     to render the component. If set to `false`, the element won't be
   *     attached to any element after rendering. In this case, `attach` should
   *     be called manually later to actually attach it to the dom.
   * @param {boolean=} opt_skipRender Optional flag indicating that the actual
   *     rendering should be skipped. Only the other render lifecycle logic will
   *     be run, like syncing state and attaching the element. Should only
   *     be set if the component has already been rendered, like sub components.
   * @protected
   */

	}, {
		key: 'render_',
		value: function render_(opt_parentElement, opt_skipRender) {
			if (!opt_skipRender) {
				this.emit('render');
			}
			this.setUpProxy_();
			this.syncState_();
			this.attach(opt_parentElement);
			this.wasRendered = true;
		}

		/**
   * Renders this component as a subcomponent, meaning that no actual rendering is
   * needed since it was already rendered by the parent component. This just handles
   * other logics from the rendering lifecycle, like calling sync methods for the
   * state.
   */

	}, {
		key: 'renderAsSubComponent',
		value: function renderAsSubComponent() {
			this.render_(null, true);
		}

		/**
   * Renders the component element into the DOM.
   * @param {(string|Element)=} opt_parentElement Optional parent element
   *     to render the component.
   * @param {(string|Element)=} opt_siblingElement Optional sibling element
   *     to render the component before it. Relevant when the component needs
   *     to be rendered before an existing element in the DOM, e.g.
   *     `component.attach(null, existingElement)`.
   * @protected
   */

	}, {
		key: 'renderElement_',
		value: function renderElement_(opt_parentElement, opt_siblingElement) {
			var element = this.element;
			if (element && (opt_siblingElement || !element.parentNode)) {
				var parent = _metalDom.dom.toElement(opt_parentElement) || this.DEFAULT_ELEMENT_PARENT;
				parent.insertBefore(element, _metalDom.dom.toElement(opt_siblingElement));
			}
		}

		/**
   * Setter logic for element state key.
   * @param {string|Element} newVal
   * @param {Element} currentVal
   * @return {Element}
   * @protected
   */

	}, {
		key: 'setterElementFn_',
		value: function setterElementFn_(newVal, currentVal) {
			var element = newVal;
			if (element) {
				element = _metalDom.dom.toElement(newVal) || currentVal;
			}
			return element;
		}

		/**
   * Creates the `DomEventEmitterProxy` instance and has it start proxying any
   * listeners that have already been listened to.
   * @protected
   */

	}, {
		key: 'setUpProxy_',
		value: function setUpProxy_() {
			if (this.elementEventProxy_) {
				return;
			}

			var proxy = new _metalDom.DomEventEmitterProxy(this.element, this);
			this.elementEventProxy_ = proxy;

			_metal.object.map(this.attachedListeners_, proxy.proxyEvent.bind(proxy));
			this.attachedListeners_ = null;

			this.newListenerHandle_.removeListener();
			this.newListenerHandle_ = null;
		}

		/**
   * Fires state synchronization functions.
   * @protected
   */

	}, {
		key: 'syncState_',
		value: function syncState_() {
			var keys = this.getStateKeys();
			for (var i = 0; i < keys.length; i++) {
				this.fireStateKeyChange_(keys[i]);
			}
		}

		/**
   * Fires synchronization changes for state keys.
   * @param {Object.<string, Object>} changes Object containing the state key
   *     name as key and an object with newVal and prevVal as value.
   * @protected
   */

	}, {
		key: 'syncStateFromChanges_',
		value: function syncStateFromChanges_(changes) {
			for (var key in changes) {
				this.fireStateKeyChange_(key, changes[key]);
			}
		}

		/**
   * State synchronization logic for the `elementClasses` state key.
   * @param {string} newVal
   * @param {string} prevVal
   */

	}, {
		key: 'syncElementClasses',
		value: function syncElementClasses(newVal, prevVal) {
			if (this.element && prevVal) {
				_metalDom.dom.removeClasses(this.element, prevVal);
			}
			this.addElementClasses();
		}

		/**
   * State synchronization logic for `visible` state key.
   * Updates the element's display value according to its visibility.
   * @param {boolean} newVal
   */

	}, {
		key: 'syncVisible',
		value: function syncVisible(newVal) {
			if (this.element) {
				this.element.style.display = newVal ? '' : 'none';
			}
		}

		/**
   * Lifecycle. Called whenever the component has just been rendered.
   * @param {boolean} firstRender Flag indicating if this was the component's
   *     first render.
   */

	}, {
		key: 'rendered',
		value: function rendered() {}

		/**
   * Validator logic for elementClasses state key.
   * @param {string} val
   * @return {boolean} True if val is a valid element classes.
   * @protected
   */

	}, {
		key: 'validatorElementClassesFn_',
		value: function validatorElementClassesFn_(val) {
			return _metal.core.isString(val);
		}

		/**
   * Validator logic for element state key.
   * @param {?string|Element} val
   * @return {boolean} True if val is a valid element.
   * @protected
   */

	}, {
		key: 'validatorElementFn_',
		value: function validatorElementFn_(val) {
			return _metal.core.isElement(val) || _metal.core.isString(val) || !_metal.core.isDefAndNotNull(val);
		}

		/**
   * Validator logic for the `events` state key.
   * @param {Object} val
   * @return {boolean}
   * @protected
   */

	}, {
		key: 'validatorEventsFn_',
		value: function validatorEventsFn_(val) {
			return !_metal.core.isDefAndNotNull(val) || _metal.core.isObject(val);
		}
	}]);

	return Component;
}(_metalState2.default);

/**
 * Component state definition.
 * @type {Object}
 * @static
 */


Component.STATE = {
	/**
  * Component element bounding box.
  * @type {Element}
  * @writeOnce
  */
	element: {
		setter: 'setterElementFn_',
		validator: 'validatorElementFn_'
	},

	/**
  * CSS classes to be applied to the element.
  * @type {string}
  */
	elementClasses: {
		validator: 'validatorElementClassesFn_'
	},

	/**
  * Listeners that should be attached to this component. Should be provided as an object,
  * where the keys are event names and the values are the listener functions (or function
  * names).
  * @type {Object<string, (function()|string|{selector: string, fn: function()|string})>}
  */
	events: {
		validator: 'validatorEventsFn_',
		value: null
	},

	/**
  * Indicates if the component is visible or not.
  * @type {boolean}
  */
	visible: {
		validator: _metal.core.isBoolean,
		value: true
	}
};

/**
 * CSS classes to be applied to the element.
 * @type {string}
 * @protected
 * @static
 */
Component.ELEMENT_CLASSES = '';

/**
 * The `ComponentRenderer` that should be used. Components need to set this
 * to a subclass of `ComponentRenderer` that has the rendering logic, like
 * `SoyRenderer`.
 * @type {!ComponentRenderer}
 * @static
 */
Component.RENDERER = _ComponentRenderer2.default;

/**
 * A list with state key names that will automatically be rejected as invalid.
 * @type {!Array<string>}
 */
Component.INVALID_KEYS = ['components', 'wasRendered'];

exports.default = Component;
},{"./ComponentRegistry":2,"./ComponentRenderer":3,"metal":39,"metal-dom":9,"metal-events":20,"metal-state":34}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _metal = require('metal');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The component registry is used to register components, so they can
 * be accessible by name.
 * @type {Object}
 */

var ComponentRegistry = function () {
	function ComponentRegistry() {
		_classCallCheck(this, ComponentRegistry);
	}

	_createClass(ComponentRegistry, null, [{
		key: 'getConstructor',

		/**
   * Gets the constructor function for the given component name, or
   * undefined if it hasn't been registered yet.
   * @param {string} name The component's name.
   * @return {?function}
   * @static
   */
		value: function getConstructor(name) {
			var constructorFn = ComponentRegistry.components_[name];
			if (!constructorFn) {
				console.error('There\'s no constructor registered for the component ' + 'named ' + name + '. Components need to be registered via ' + 'ComponentRegistry.register.');
			}
			return constructorFn;
		}

		/**
   * Registers a component, so it can be found by its name.
   * @param {!Function} constructorFn The component's constructor function.
   * @param {string=} opt_name Name of the registered component. If none is given
   *   the name defined by the NAME static variable will be used instead. If that
   *   isn't set as well, the name of the constructor function will be used.
   * @static
   */

	}, {
		key: 'register',
		value: function register(constructorFn, opt_name) {
			var name = opt_name;
			if (!name) {
				if (constructorFn.hasOwnProperty('NAME')) {
					name = constructorFn.NAME;
				} else {
					name = _metal.core.getFunctionName(constructorFn);
				}
			}
			constructorFn.NAME = name;
			ComponentRegistry.components_[name] = constructorFn;
		}
	}]);

	return ComponentRegistry;
}();

/**
 * Holds all registered components, indexed by their names.
 * @type {!Object<string, function()>}
 * @protected
 * @static
 */


ComponentRegistry.components_ = {};

exports.default = ComponentRegistry;
},{"metal":39}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _metalEvents = require('metal-events');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Base class that component renderers should extend from. It defines the
 * required methods all renderers should have.
 */

var ComponentRenderer = function (_EventEmitter) {
	_inherits(ComponentRenderer, _EventEmitter);

	/**
  * Constructor function for `ComponentRenderer`.
  * @param {!Component} component The component that this renderer is
  *     responsible for.
  */

	function ComponentRenderer(component) {
		_classCallCheck(this, ComponentRenderer);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ComponentRenderer).call(this));

		_this.component_ = component;
		_this.componentRendererEvents_ = new _metalEvents.EventHandler();
		_this.componentRendererEvents_.add(_this.component_.on('stateChanged', _this.handleComponentRendererStateChanged_.bind(_this)), _this.component_.once('render', _this.render.bind(_this)));
		return _this;
	}

	/**
  * @inheritDoc
  */


	_createClass(ComponentRenderer, [{
		key: 'disposeInternal',
		value: function disposeInternal() {
			this.componentRendererEvents_.removeAllListeners();
			this.componentRendererEvents_ = null;
		}

		/**
   * Handles an `stateChanged` event from this renderer's component. Calls the
   * `update` function if the component has already been rendered for the first
   * time.
   * @param {Object.<string, Object>} changes Object containing the names
   *     of all changed state keys, each mapped to an object with its new
   *     (newVal) and previous (prevVal) values.
   */

	}, {
		key: 'handleComponentRendererStateChanged_',
		value: function handleComponentRendererStateChanged_(changes) {
			if (this.component_.wasRendered) {
				this.update(changes);
			}
		}

		/**
   * Renders the component's whole content (including its main element).
   */

	}, {
		key: 'render',
		value: function render() {
			if (!this.component_.element) {
				this.component_.element = document.createElement('div');
			}
		}

		/**
   * Updates the component's element html. This is automatically called by
   * the component when the value of at least one of its state keys has changed.
   * @param {Object.<string, Object>} changes Object containing the names
   *     of all changed state keys, each mapped to an object with its new
   *     (newVal) and previous (prevVal) values.
   */

	}, {
		key: 'update',
		value: function update() {}
	}]);

	return ComponentRenderer;
}(_metalEvents.EventEmitter);

exports.default = ComponentRenderer;
},{"metal-events":20}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _metal = require('metal');

var _metalEvents = require('metal-events');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Collects inline events from a passed element, detaching previously
 * attached events that are not being used anymore.
 * @param {Component} component
 * @constructor
 * @extends {Disposable}
 */

var EventsCollector = function (_Disposable) {
	_inherits(EventsCollector, _Disposable);

	function EventsCollector(component) {
		_classCallCheck(this, EventsCollector);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(EventsCollector).call(this));

		if (!component) {
			throw new Error('The component instance is mandatory');
		}

		/**
   * Holds the component intance.
   * @type {!Component}
   * @protected
   */
		_this.component_ = component;

		/**
   * Holds the attached delegate event handles, indexed by the css selector.
   * @type {!Object<string, EventHandler>}
   * @protected
   */
		_this.eventHandles_ = {};

		/**
   * Holds flags indicating which selectors have listeners.
   * @type {!Object<string, boolean>}
   * @protected
   */
		_this.hasListener_ = {};
		return _this;
	}

	/**
  * Attaches the listener described by the given params, unless it has already
  * been attached.
  * @param {string} eventType
  * @param {string} fnNamesString
  */


	_createClass(EventsCollector, [{
		key: 'attachListener',
		value: function attachListener(eventType, fnNamesString) {
			var selector = '[data-on' + eventType + '="' + fnNamesString + '"]';

			this.hasListener_[selector] = true;

			if (!this.eventHandles_[selector]) {
				this.eventHandles_[selector] = new _metalEvents.EventHandler();
				var fnNames = fnNamesString.split(',');
				for (var i = 0; i < fnNames.length; i++) {
					var fn = this.component_.getListenerFn(fnNames[i]);
					if (fn) {
						this.eventHandles_[selector].add(this.component_.delegate(eventType, selector, this.onEvent_.bind(this, fn)));
					}
				}
			}
		}

		/**
   * Removes all previously attached event listeners to the component.
   */

	}, {
		key: 'detachAllListeners',
		value: function detachAllListeners() {
			for (var selector in this.eventHandles_) {
				if (this.eventHandles_[selector]) {
					this.eventHandles_[selector].removeAllListeners();
				}
			}
			this.eventHandles_ = {};
			this.listenerCounts_ = {};
		}

		/**
   * Detaches all existing listeners that are not being used anymore.
   * @protected
   */

	}, {
		key: 'detachUnusedListeners',
		value: function detachUnusedListeners() {
			for (var selector in this.eventHandles_) {
				if (this.eventHandles_[selector] && !this.hasListener_[selector]) {
					this.eventHandles_[selector].removeAllListeners();
					this.eventHandles_[selector] = null;
				}
			}
		}

		/**
   * @inheritDoc
   */

	}, {
		key: 'disposeInternal',
		value: function disposeInternal() {
			this.detachAllListeners();
			this.component_ = null;
		}

		/**
   * Fires when an event that was registered by this collector is triggered. Makes
   * sure that the event was meant for this component and calls the appropriate
   * listener function for it.
   * @param {!function(!Object)} fn
   * @param {!Object} event
   * @return {*} The return value of the call to the listener function, or undefined
   *   if no function was called.
   * @protected
   */

	}, {
		key: 'onEvent_',
		value: function onEvent_(fn, event) {
			// This check prevents parent components from handling their child inline listeners.
			var eventComp = event.handledByComponent;
			if (!eventComp || eventComp === this.component_ || event.delegateTarget.contains(eventComp.element)) {
				event.handledByComponent = this.component_;
				return fn(event);
			}
		}

		/**
   * Prepares the collector to start collecting listeners. Should be called
   * before all calls to `attachListener`.
   */

	}, {
		key: 'startCollecting',
		value: function startCollecting() {
			this.hasListener_ = {};
		}
	}]);

	return EventsCollector;
}(_metal.Disposable);

exports.default = EventsCollector;
},{"metal":39,"metal-events":20}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.EventsCollector = exports.ComponentRenderer = exports.ComponentRegistry = exports.Component = undefined;

var _Component = require('../Component');

var _Component2 = _interopRequireDefault(_Component);

var _ComponentRegistry = require('../ComponentRegistry');

var _ComponentRegistry2 = _interopRequireDefault(_ComponentRegistry);

var _ComponentRenderer = require('../ComponentRenderer');

var _ComponentRenderer2 = _interopRequireDefault(_ComponentRenderer);

var _EventsCollector = require('../EventsCollector');

var _EventsCollector2 = _interopRequireDefault(_EventsCollector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Component2.default;
exports.Component = _Component2.default;
exports.ComponentRegistry = _ComponentRegistry2.default;
exports.ComponentRenderer = _ComponentRenderer2.default;
exports.EventsCollector = _EventsCollector2.default;
},{"../Component":1,"../ComponentRegistry":2,"../ComponentRenderer":3,"../EventsCollector":4}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _metal = require('metal');

var _domData = require('./domData');

var _domData2 = _interopRequireDefault(_domData);

var _metalEvents = require('metal-events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * This is a special EventHandle, that is responsible for dom delegated events
 * (only the ones that receive a target element, not a selector string).
 * @extends {EventHandle}
 */
var DomDelegatedEventHandle = function (_EventHandle) {
	_inherits(DomDelegatedEventHandle, _EventHandle);

	/**
  * The constructor for `DomDelegatedEventHandle`.
  * @param {!Event} emitter Element the event was subscribed to.
  * @param {string} event The name of the event that was subscribed to.
  * @param {!Function} listener The listener subscribed to the event.
  * @param {string=} opt_selector An optional selector used when delegating
  *     the event.
  * @constructor
  */
	function DomDelegatedEventHandle(emitter, event, listener, opt_selector) {
		_classCallCheck(this, DomDelegatedEventHandle);

		var _this = _possibleConstructorReturn(this, (DomDelegatedEventHandle.__proto__ || Object.getPrototypeOf(DomDelegatedEventHandle)).call(this, emitter, event, listener));

		_this.selector_ = opt_selector;
		return _this;
	}

	/**
  * @inheritDoc
  */


	_createClass(DomDelegatedEventHandle, [{
		key: 'removeListener',
		value: function removeListener() {
			var data = _domData2.default.get(this.emitter_);
			var selector = this.selector_;
			var arr = _metal.core.isString(selector) ? data.delegating[this.event_].selectors : data.listeners;
			var key = _metal.core.isString(selector) ? selector : this.event_;

			_metal.array.remove(arr[key] || [], this.listener_);
			if (arr[key] && arr[key].length === 0) {
				delete arr[key];
			}
		}
	}]);

	return DomDelegatedEventHandle;
}(_metalEvents.EventHandle);

exports.default = DomDelegatedEventHandle;
},{"./domData":11,"metal":39,"metal-events":20}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _dom = require('./dom');

var _dom2 = _interopRequireDefault(_dom);

var _metalEvents = require('metal-events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * DomEventEmitterProxy utility. It extends `EventEmitterProxy` to also accept
 * dom elements as origin emitters.
 * @extends {EventEmitterProxy}
 */
var DomEventEmitterProxy = function (_EventEmitterProxy) {
	_inherits(DomEventEmitterProxy, _EventEmitterProxy);

	function DomEventEmitterProxy() {
		_classCallCheck(this, DomEventEmitterProxy);

		return _possibleConstructorReturn(this, (DomEventEmitterProxy.__proto__ || Object.getPrototypeOf(DomEventEmitterProxy)).apply(this, arguments));
	}

	_createClass(DomEventEmitterProxy, [{
		key: 'addListener_',

		/**
   * Adds the given listener for the given event.
   * @param {string} event.
   * @param {!function()} listener
   * @return {!EventHandle} The listened event's handle.
   * @protected
   * @override
   */
		value: function addListener_(event, listener) {
			if (this.originEmitter_.addEventListener) {
				if (this.isDelegateEvent_(event)) {
					var index = event.indexOf(':', 9);
					var eventName = event.substring(9, index);
					var selector = event.substring(index + 1);
					return _dom2.default.delegate(this.originEmitter_, eventName, selector, listener);
				} else {
					return _dom2.default.on(this.originEmitter_, event, listener);
				}
			} else {
				return _get(DomEventEmitterProxy.prototype.__proto__ || Object.getPrototypeOf(DomEventEmitterProxy.prototype), 'addListener_', this).call(this, event, listener);
			}
		}

		/**
   * Checks if the given event is of the delegate type.
   * @param {string} event
   * @return {boolean}
   * @protected
   */

	}, {
		key: 'isDelegateEvent_',
		value: function isDelegateEvent_(event) {
			return event.substr(0, 9) === 'delegate:';
		}

		/**
   * Checks if the given event is supported by the origin element.
   * @param {string} event
   * @protected
   */

	}, {
		key: 'isSupportedDomEvent_',
		value: function isSupportedDomEvent_(event) {
			if (!this.originEmitter_ || !this.originEmitter_.addEventListener) {
				return true;
			}
			return this.isDelegateEvent_(event) && event.indexOf(':', 9) !== -1 || _dom2.default.supportsEvent(this.originEmitter_, event);
		}

		/**
   * Checks if the given event should be proxied.
   * @param {string} event
   * @return {boolean}
   * @protected
   * @override
   */

	}, {
		key: 'shouldProxyEvent_',
		value: function shouldProxyEvent_(event) {
			return _get(DomEventEmitterProxy.prototype.__proto__ || Object.getPrototypeOf(DomEventEmitterProxy.prototype), 'shouldProxyEvent_', this).call(this, event) && this.isSupportedDomEvent_(event);
		}
	}]);

	return DomEventEmitterProxy;
}(_metalEvents.EventEmitterProxy);

exports.default = DomEventEmitterProxy;
},{"./dom":10,"metal-events":20}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _metalEvents = require('metal-events');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * This is a special EventHandle, that is responsible for dom events, instead
 * of EventEmitter events.
 * @extends {EventHandle}
 */
var DomEventHandle = function (_EventHandle) {
	_inherits(DomEventHandle, _EventHandle);

	/**
  * The constructor for `DomEventHandle`.
  * @param {!EventEmitter} emitter Emitter the event was subscribed to.
  * @param {string} event The name of the event that was subscribed to.
  * @param {!Function} listener The listener subscribed to the event.
  * @param {boolean} opt_capture Flag indicating if listener should be triggered
  *   during capture phase, instead of during the bubbling phase. Defaults to false.
  * @constructor
  */
	function DomEventHandle(emitter, event, listener, opt_capture) {
		_classCallCheck(this, DomEventHandle);

		var _this = _possibleConstructorReturn(this, (DomEventHandle.__proto__ || Object.getPrototypeOf(DomEventHandle)).call(this, emitter, event, listener));

		_this.capture_ = opt_capture;
		return _this;
	}

	/**
  * @inheritDoc
  */


	_createClass(DomEventHandle, [{
		key: 'removeListener',
		value: function removeListener() {
			this.emitter_.removeEventListener(this.event_, this.listener_, this.capture_);
		}
	}]);

	return DomEventHandle;
}(_metalEvents.EventHandle);

exports.default = DomEventHandle;
},{"metal-events":20}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.globalEvalStyles = exports.globalEval = exports.features = exports.DomEventHandle = exports.DomEventEmitterProxy = exports.domData = exports.dom = undefined;

var _dom = require('../dom');

var _dom2 = _interopRequireDefault(_dom);

var _domData = require('../domData');

var _domData2 = _interopRequireDefault(_domData);

var _DomEventEmitterProxy = require('../DomEventEmitterProxy');

var _DomEventEmitterProxy2 = _interopRequireDefault(_DomEventEmitterProxy);

var _DomEventHandle = require('../DomEventHandle');

var _DomEventHandle2 = _interopRequireDefault(_DomEventHandle);

var _features = require('../features');

var _features2 = _interopRequireDefault(_features);

var _globalEval = require('../globalEval');

var _globalEval2 = _interopRequireDefault(_globalEval);

var _globalEvalStyles = require('../globalEvalStyles');

var _globalEvalStyles2 = _interopRequireDefault(_globalEvalStyles);

require('../events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _dom2.default;
exports.dom = _dom2.default;
exports.domData = _domData2.default;
exports.DomEventEmitterProxy = _DomEventEmitterProxy2.default;
exports.DomEventHandle = _DomEventHandle2.default;
exports.features = _features2.default;
exports.globalEval = _globalEval2.default;
exports.globalEvalStyles = _globalEvalStyles2.default;
},{"../DomEventEmitterProxy":7,"../DomEventHandle":8,"../dom":10,"../domData":11,"../events":12,"../features":13,"../globalEval":14,"../globalEvalStyles":15}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _metal = require('metal');

var _domData = require('./domData');

var _domData2 = _interopRequireDefault(_domData);

var _DomDelegatedEventHandle = require('./DomDelegatedEventHandle');

var _DomDelegatedEventHandle2 = _interopRequireDefault(_DomDelegatedEventHandle);

var _DomEventHandle = require('./DomEventHandle');

var _DomEventHandle2 = _interopRequireDefault(_DomEventHandle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NEXT_TARGET = '__metal_next_target__';
var USE_CAPTURE = {
	blur: true,
	error: true,
	focus: true,
	invalid: true,
	load: true,
	scroll: true
};

var dom = function () {
	function dom() {
		_classCallCheck(this, dom);
	}

	_createClass(dom, null, [{
		key: 'addClasses',

		/**
   * Adds the requested CSS classes to an element.
   * @param {!Element} element The element to add CSS classes to.
   * @param {string} classes CSS classes to add.
   */
		value: function addClasses(element, classes) {
			if (!_metal.core.isObject(element) || !_metal.core.isString(classes)) {
				return;
			}

			if ('classList' in element) {
				dom.addClassesWithNative_(element, classes);
			} else {
				dom.addClassesWithoutNative_(element, classes);
			}
		}

		/**
   * Adds the requested CSS classes to an element using classList.
   * @param {!Element} element The element to add CSS classes to.
   * @param {string} classes CSS classes to add.
   * @protected
   */

	}, {
		key: 'addClassesWithNative_',
		value: function addClassesWithNative_(element, classes) {
			classes.split(' ').forEach(function (className) {
				if (className) {
					element.classList.add(className);
				}
			});
		}

		/**
   * Adds the requested CSS classes to an element without using classList.
   * @param {!Element} element The element to add CSS classes to.
   * @param {string} classes CSS classes to add.
   * @protected
   */

	}, {
		key: 'addClassesWithoutNative_',
		value: function addClassesWithoutNative_(element, classes) {
			var elementClassName = ' ' + element.className + ' ';
			var classesToAppend = '';

			classes = classes.split(' ');

			for (var i = 0; i < classes.length; i++) {
				var className = classes[i];

				if (elementClassName.indexOf(' ' + className + ' ') === -1) {
					classesToAppend += ' ' + className;
				}
			}

			if (classesToAppend) {
				element.className = element.className + classesToAppend;
			}
		}

		/**
   * Adds an event listener to the given element, to be triggered via delegate.
   * @param {!Element} element
   * @param {string} eventName
   * @param {!function()} listener
   * @protected
   */

	}, {
		key: 'addElementListener_',
		value: function addElementListener_(element, eventName, listener) {
			var data = _domData2.default.get(element);
			dom.addToArr_(data.listeners, eventName, listener);
		}

		/**
   * Adds an event listener to the given element, to be triggered via delegate
   * selectors.
   * @param {!Element} element
   * @param {string} eventName
   * @param {string} selector
   * @param {!function()} listener
   * @protected
   */

	}, {
		key: 'addSelectorListener_',
		value: function addSelectorListener_(element, eventName, selector, listener) {
			var data = _domData2.default.get(element);
			dom.addToArr_(data.delegating[eventName].selectors, selector, listener);
		}

		/**
   * Adds a value to an array inside an object, creating it first if it doesn't
   * yet exist.
   * @param {!Array} arr
   * @param {string} key
   * @param {*} value
   * @protected
   */

	}, {
		key: 'addToArr_',
		value: function addToArr_(arr, key, value) {
			if (!arr[key]) {
				arr[key] = [];
			}
			arr[key].push(value);
		}

		/**
   * Attaches a delegate listener, unless there's already one attached.
   * @param {!Element} element
   * @param {string} eventName
   * @protected
   */

	}, {
		key: 'attachDelegateEvent_',
		value: function attachDelegateEvent_(element, eventName) {
			var data = _domData2.default.get(element);
			if (!data.delegating[eventName]) {
				data.delegating[eventName] = {
					handle: dom.on(element, eventName, dom.handleDelegateEvent_, !!USE_CAPTURE[eventName]),
					selectors: {}
				};
			}
		}

		/**
   * Gets the closest element up the tree from the given element (including
   * itself) that matches the specified selector, or null if none match.
   * @param {Element} element
   * @param {string} selector
   * @return {Element}
   */

	}, {
		key: 'closest',
		value: function closest(element, selector) {
			while (element && !dom.match(element, selector)) {
				element = element.parentNode;
			}
			return element;
		}

		/**
   * Appends a child node with text or other nodes to a parent node. If
   * child is a HTML string it will be automatically converted to a document
   * fragment before appending it to the parent.
   * @param {!Element} parent The node to append nodes to.
   * @param {!(Element|NodeList|string)} child The thing to append to the parent.
   * @return {!Element} The appended child.
   */

	}, {
		key: 'append',
		value: function append(parent, child) {
			if (_metal.core.isString(child)) {
				child = dom.buildFragment(child);
			}
			if (child instanceof NodeList) {
				var childArr = Array.prototype.slice.call(child);
				for (var i = 0; i < childArr.length; i++) {
					parent.appendChild(childArr[i]);
				}
			} else {
				parent.appendChild(child);
			}
			return child;
		}

		/**
   * Helper for converting a HTML string into a document fragment.
   * @param {string} htmlString The HTML string to convert.
   * @return {!Element} The resulting document fragment.
   */

	}, {
		key: 'buildFragment',
		value: function buildFragment(htmlString) {
			var tempDiv = document.createElement('div');
			tempDiv.innerHTML = '<br>' + htmlString;
			tempDiv.removeChild(tempDiv.firstChild);

			var fragment = document.createDocumentFragment();
			while (tempDiv.firstChild) {
				fragment.appendChild(tempDiv.firstChild);
			}
			return fragment;
		}

		/**
   * Checks if the first element contains the second one.
   * @param {!Element} element1
   * @param {!Element} element2
   * @return {boolean}
   */

	}, {
		key: 'contains',
		value: function contains(element1, element2) {
			if (_metal.core.isDocument(element1)) {
				// document.contains is not defined on IE9, so call it on documentElement instead.
				return element1.documentElement.contains(element2);
			} else {
				return element1.contains(element2);
			}
		}

		/**
   * Listens to the specified event on the given DOM element, but only calls the
   * given callback listener when it's triggered by elements that match the
   * given selector or target element.
   * @param {!Element} element The DOM element the event should be listened on.
   * @param {string} eventName The name of the event to listen to.
   * @param {!Element|string} selectorOrTarget Either an element or css selector
   *     that should match the event for the listener to be triggered.
   * @param {!function(!Object)} callback Function to be called when the event
   *     is triggered. It will receive the normalized event object.
   * @param {boolean=} opt_default Optional flag indicating if this is a default
   *     listener. That means that it would only be executed after all non
   *     default listeners, and only if the event isn't prevented via
   *     `preventDefault`.
   * @return {!EventHandle} Can be used to remove the listener.
   */

	}, {
		key: 'delegate',
		value: function delegate(element, eventName, selectorOrTarget, callback, opt_default) {
			var customConfig = dom.customEvents[eventName];
			if (customConfig && customConfig.delegate) {
				eventName = customConfig.originalEvent;
				callback = customConfig.handler.bind(customConfig, callback);
			}

			if (opt_default) {
				// Wrap callback so we don't set property directly on it.
				callback = callback.bind();
				callback.defaultListener_ = true;
			}

			dom.attachDelegateEvent_(element, eventName);
			if (_metal.core.isString(selectorOrTarget)) {
				dom.addSelectorListener_(element, eventName, selectorOrTarget, callback);
			} else {
				dom.addElementListener_(selectorOrTarget, eventName, callback);
			}

			return new _DomDelegatedEventHandle2.default(_metal.core.isString(selectorOrTarget) ? element : selectorOrTarget, eventName, callback, _metal.core.isString(selectorOrTarget) ? selectorOrTarget : null);
		}

		/**
   * Inserts node in document as last element.
   * @param {Element} node Element to remove children from.
   */

	}, {
		key: 'enterDocument',
		value: function enterDocument(node) {
			node && dom.append(document.body, node);
		}

		/**
   * Removes node from document.
   * @param {Element} node Element to remove children from.
   */

	}, {
		key: 'exitDocument',
		value: function exitDocument(node) {
			if (node && node.parentNode) {
				node.parentNode.removeChild(node);
			}
		}

		/**
   * This is called when an event is triggered by a delegate listener. All
   * matching listeners of this event type from `target` to `currentTarget` will
   * be triggered.
   * @param {!Event} event The event payload.
   * @return {boolean} False if at least one of the triggered callbacks returns
   *     false, or true otherwise.
   * @protected
   */

	}, {
		key: 'handleDelegateEvent_',
		value: function handleDelegateEvent_(event) {
			dom.normalizeDelegateEvent_(event);
			var currElement = _metal.core.isDef(event[NEXT_TARGET]) ? event[NEXT_TARGET] : event.target;
			var ret = true;
			var container = event.currentTarget;
			var limit = event.currentTarget.parentNode;
			var defFns = [];

			while (currElement && currElement !== limit && !event.stopped) {
				event.delegateTarget = currElement;
				ret &= dom.triggerMatchedListeners_(container, currElement, event, defFns);
				currElement = currElement.parentNode;
			}

			for (var i = 0; i < defFns.length && !event.defaultPrevented; i++) {
				event.delegateTarget = defFns[i].element;
				ret &= defFns[i].fn(event);
			}

			event.delegateTarget = null;
			event[NEXT_TARGET] = limit;
			return ret;
		}

		/**
   * Checks if the given element has the requested css class.
   * @param {!Element} element
   * @param {string} className
   * @return {boolean}
   */

	}, {
		key: 'hasClass',
		value: function hasClass(element, className) {
			if ('classList' in element) {
				return dom.hasClassWithNative_(element, className);
			} else {
				return dom.hasClassWithoutNative_(element, className);
			}
		}

		/**
   * Checks if the given element has the requested css class using classList.
   * @param {!Element} element
   * @param {string} className
   * @return {boolean}
   * @protected
   */

	}, {
		key: 'hasClassWithNative_',
		value: function hasClassWithNative_(element, className) {
			return element.classList.contains(className);
		}

		/**
   * Checks if the given element has the requested css class without using classList.
   * @param {!Element} element
   * @param {string} className
   * @return {boolean}
   * @protected
   */

	}, {
		key: 'hasClassWithoutNative_',
		value: function hasClassWithoutNative_(element, className) {
			return (' ' + element.className + ' ').indexOf(' ' + className + ' ') >= 0;
		}

		/**
   * Checks if the given element is empty or not.
   * @param {!Element} element
   * @return {boolean}
   */

	}, {
		key: 'isEmpty',
		value: function isEmpty(element) {
			return element.childNodes.length === 0;
		}

		/**
   * Check if an element matches a given selector.
   * @param {Element} element
   * @param {string} selector
   * @return {boolean}
   */

	}, {
		key: 'match',
		value: function match(element, selector) {
			if (!element || element.nodeType !== 1) {
				return false;
			}

			var p = Element.prototype;
			var m = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || p.oMatchesSelector;
			if (m) {
				return m.call(element, selector);
			}

			return dom.matchFallback_(element, selector);
		}

		/**
   * Check if an element matches a given selector, using an internal implementation
   * instead of calling existing javascript functions.
   * @param {Element} element
   * @param {string} selector
   * @return {boolean}
   * @protected
   */

	}, {
		key: 'matchFallback_',
		value: function matchFallback_(element, selector) {
			var nodes = document.querySelectorAll(selector, element.parentNode);
			for (var i = 0; i < nodes.length; ++i) {
				if (nodes[i] === element) {
					return true;
				}
			}
			return false;
		}

		/**
   * Returns the next sibling of the given element that matches the specified
   * selector, or null if there is none.
   * @param {!Element} element
   * @param {?string} selector
   */

	}, {
		key: 'next',
		value: function next(element, selector) {
			do {
				element = element.nextSibling;
				if (element && dom.match(element, selector)) {
					return element;
				}
			} while (element);
			return null;
		}

		/**
   * Normalizes the event payload for delegate listeners.
   * @param {!Event} event
   */

	}, {
		key: 'normalizeDelegateEvent_',
		value: function normalizeDelegateEvent_(event) {
			event.stopPropagation = dom.stopPropagation_;
			event.stopImmediatePropagation = dom.stopImmediatePropagation_;
		}

		/**
   * Listens to the specified event on the given DOM element. This function normalizes
   * DOM event payloads and functions so they'll work the same way on all supported
   * browsers.
   * @param {!Element|string} element The DOM element to listen to the event on, or
   *   a selector that should be delegated on the entire document.
   * @param {string} eventName The name of the event to listen to.
   * @param {!function(!Object)} callback Function to be called when the event is
   *   triggered. It will receive the normalized event object.
   * @param {boolean} opt_capture Flag indicating if listener should be triggered
   *   during capture phase, instead of during the bubbling phase. Defaults to false.
   * @return {!DomEventHandle} Can be used to remove the listener.
   */

	}, {
		key: 'on',
		value: function on(element, eventName, callback, opt_capture) {
			if (_metal.core.isString(element)) {
				return dom.delegate(document, eventName, element, callback);
			}
			var customConfig = dom.customEvents[eventName];
			if (customConfig && customConfig.event) {
				eventName = customConfig.originalEvent;
				callback = customConfig.handler.bind(customConfig, callback);
			}
			element.addEventListener(eventName, callback, opt_capture);
			return new _DomEventHandle2.default(element, eventName, callback, opt_capture);
		}

		/**
   * Listens to the specified event on the given DOM element once. This
   * function normalizes DOM event payloads and functions so they'll work the
   * same way on all supported browsers.
   * @param {!Element} element The DOM element to listen to the event on.
   * @param {string} eventName The name of the event to listen to.
   * @param {!function(!Object)} callback Function to be called when the event
   *   is triggered. It will receive the normalized event object.
   * @return {!DomEventHandle} Can be used to remove the listener.
   */

	}, {
		key: 'once',
		value: function once(element, eventName, callback) {
			var domEventHandle = this.on(element, eventName, function () {
				domEventHandle.removeListener();
				return callback.apply(this, arguments);
			});
			return domEventHandle;
		}

		/**
   * Gets the first parent from the given element that matches the specified
   * selector, or null if none match.
   * @param {!Element} element
   * @param {string} selector
   * @return {Element}
   */

	}, {
		key: 'parent',
		value: function parent(element, selector) {
			return dom.closest(element.parentNode, selector);
		}

		/**
   * Registers a custom event.
   * @param {string} eventName The name of the custom event.
   * @param {!Object} customConfig An object with information about how the event
   *   should be handled.
   */

	}, {
		key: 'registerCustomEvent',
		value: function registerCustomEvent(eventName, customConfig) {
			dom.customEvents[eventName] = customConfig;
		}

		/**
   * Removes all the child nodes on a DOM node.
   * @param {Element} node Element to remove children from.
   */

	}, {
		key: 'removeChildren',
		value: function removeChildren(node) {
			var child;
			while (child = node.firstChild) {
				node.removeChild(child);
			}
		}

		/**
   * Removes the requested CSS classes from an element.
   * @param {!Element} element The element to remove CSS classes from.
   * @param {string} classes CSS classes to remove.
   */

	}, {
		key: 'removeClasses',
		value: function removeClasses(element, classes) {
			if (!_metal.core.isObject(element) || !_metal.core.isString(classes)) {
				return;
			}

			if ('classList' in element) {
				dom.removeClassesWithNative_(element, classes);
			} else {
				dom.removeClassesWithoutNative_(element, classes);
			}
		}

		/**
   * Removes the requested CSS classes from an element using classList.
   * @param {!Element} element The element to remove CSS classes from.
   * @param {string} classes CSS classes to remove.
   * @protected
   */

	}, {
		key: 'removeClassesWithNative_',
		value: function removeClassesWithNative_(element, classes) {
			classes.split(' ').forEach(function (className) {
				if (className) {
					element.classList.remove(className);
				}
			});
		}

		/**
   * Removes the requested CSS classes from an element without using classList.
   * @param {!Element} element The element to remove CSS classes from.
   * @param {string} classes CSS classes to remove.
   * @protected
   */

	}, {
		key: 'removeClassesWithoutNative_',
		value: function removeClassesWithoutNative_(element, classes) {
			var elementClassName = ' ' + element.className + ' ';

			classes = classes.split(' ');

			for (var i = 0; i < classes.length; i++) {
				elementClassName = elementClassName.replace(' ' + classes[i] + ' ', ' ');
			}

			element.className = elementClassName.trim();
		}

		/**
   * Replaces the first element with the second.
   * @param {Element} element1
   * @param {Element} element2
   */

	}, {
		key: 'replace',
		value: function replace(element1, element2) {
			if (element1 && element2 && element1 !== element2 && element1.parentNode) {
				element1.parentNode.insertBefore(element2, element1);
				element1.parentNode.removeChild(element1);
			}
		}

		/**
   * The function that replaces `stopImmediatePropagation_` for events.
   * @protected
   */

	}, {
		key: 'stopImmediatePropagation_',
		value: function stopImmediatePropagation_() {
			this.stopped = true;
			this.stoppedImmediate = true;
			Event.prototype.stopImmediatePropagation.call(this);
		}

		/**
   * The function that replaces `stopPropagation` for events.
   * @protected
   */

	}, {
		key: 'stopPropagation_',
		value: function stopPropagation_() {
			this.stopped = true;
			Event.prototype.stopPropagation.call(this);
		}

		/**
   * Checks if the given element supports the given event type.
   * @param {!Element|string} element The DOM element or element tag name to check.
   * @param {string} eventName The name of the event to check.
   * @return {boolean}
   */

	}, {
		key: 'supportsEvent',
		value: function supportsEvent(element, eventName) {
			if (dom.customEvents[eventName]) {
				return true;
			}

			if (_metal.core.isString(element)) {
				if (!elementsByTag[element]) {
					elementsByTag[element] = document.createElement(element);
				}
				element = elementsByTag[element];
			}
			return 'on' + eventName in element;
		}

		/**
   * Converts the given argument to a DOM element. Strings are assumed to
   * be selectors, and so a matched element will be returned. If the arg
   * is already a DOM element it will be the return value.
   * @param {string|Element|Document} selectorOrElement
   * @return {Element} The converted element, or null if none was found.
   */

	}, {
		key: 'toElement',
		value: function toElement(selectorOrElement) {
			if (_metal.core.isElement(selectorOrElement) || _metal.core.isDocument(selectorOrElement)) {
				return selectorOrElement;
			} else if (_metal.core.isString(selectorOrElement)) {
				if (selectorOrElement[0] === '#' && selectorOrElement.indexOf(' ') === -1) {
					return document.getElementById(selectorOrElement.substr(1));
				} else {
					return document.querySelector(selectorOrElement);
				}
			} else {
				return null;
			}
		}

		/**
   * Adds or removes one or more classes from an element. If any of the classes
   * is present, it will be removed from the element, or added otherwise.
   * @param {!Element} element The element which classes will be toggled.
   * @param {string} classes The classes which have to added or removed from the element.
   */

	}, {
		key: 'toggleClasses',
		value: function toggleClasses(element, classes) {
			if (!_metal.core.isObject(element) || !_metal.core.isString(classes)) {
				return;
			}

			if ('classList' in element) {
				dom.toggleClassesWithNative_(element, classes);
			} else {
				dom.toggleClassesWithoutNative_(element, classes);
			}
		}

		/**
   * Adds or removes one or more classes from an element using classList.
   * If any of the classes is present, it will be removed from the element,
   * or added otherwise.
   * @param {!Element} element The element which classes will be toggled.
   * @param {string} classes The classes which have to added or removed from the element.
   */

	}, {
		key: 'toggleClassesWithNative_',
		value: function toggleClassesWithNative_(element, classes) {
			classes.split(' ').forEach(function (className) {
				element.classList.toggle(className);
			});
		}

		/**
   * Adds or removes one or more classes from an element without using classList.
   * If any of the classes is present, it will be removed from the element,
   * or added otherwise.
   * @param {!Element} element The element which classes will be toggled.
   * @param {string} classes The classes which have to added or removed from the element.
   */

	}, {
		key: 'toggleClassesWithoutNative_',
		value: function toggleClassesWithoutNative_(element, classes) {
			var elementClassName = ' ' + element.className + ' ';

			classes = classes.split(' ');

			for (var i = 0; i < classes.length; i++) {
				var className = ' ' + classes[i] + ' ';
				var classIndex = elementClassName.indexOf(className);

				if (classIndex === -1) {
					elementClassName = elementClassName + classes[i] + ' ';
				} else {
					elementClassName = elementClassName.substring(0, classIndex) + ' ' + elementClassName.substring(classIndex + className.length);
				}
			}

			element.className = elementClassName.trim();
		}

		/**
   * Triggers the specified event on the given element.
   * NOTE: This should mostly be used for testing, not on real code.
   * @param {!Element} element The node that should trigger the event.
   * @param {string} eventName The name of the event to be triggred.
   * @param {Object=} opt_eventObj An object with data that should be on the
   *   triggered event's payload.
   */

	}, {
		key: 'triggerEvent',
		value: function triggerEvent(element, eventName, opt_eventObj) {
			var eventObj = document.createEvent('HTMLEvents');
			eventObj.initEvent(eventName, true, true);
			_metal.object.mixin(eventObj, opt_eventObj);
			element.dispatchEvent(eventObj);
		}

		/**
   * Triggers the given listeners array.
   * @param {Array<!function()} listeners
   * @param {!Event} event
   * @param {!Element} element
   * @param {!Array} defaultFns Array to collect default listeners in, instead
   *     of running them.
   * @return {boolean} False if at least one of the triggered callbacks returns
   *     false, or true otherwise.
   * @protected
   */

	}, {
		key: 'triggerListeners_',
		value: function triggerListeners_(listeners, event, element, defaultFns) {
			var ret = true;
			listeners = listeners || [];
			for (var i = 0; i < listeners.length && !event.stoppedImmediate; i++) {
				if (listeners[i].defaultListener_) {
					defaultFns.push({
						element: element,
						fn: listeners[i]
					});
				} else {
					ret &= listeners[i](event);
				}
			}
			return ret;
		}

		/**
   * Triggers all listeners for the given event type that are stored in the
   * specified element.
   * @param {!Element} container
   * @param {!Element} element
   * @param {!Event} event
   * @param {!Array} defaultFns Array to collect default listeners in, instead
   *     of running them.
   * @return {boolean} False if at least one of the triggered callbacks returns
   *     false, or true otherwise.
   * @protected
   */

	}, {
		key: 'triggerMatchedListeners_',
		value: function triggerMatchedListeners_(container, element, event, defaultFns) {
			var data = _domData2.default.get(element);
			var listeners = data.listeners[event.type];
			var ret = dom.triggerListeners_(listeners, event, element, defaultFns);

			var selectorsMap = _domData2.default.get(container).delegating[event.type].selectors;
			var selectors = Object.keys(selectorsMap);
			for (var i = 0; i < selectors.length && !event.stoppedImmediate; i++) {
				if (dom.match(element, selectors[i])) {
					listeners = selectorsMap[selectors[i]];
					ret &= dom.triggerListeners_(listeners, event, element, defaultFns);
				}
			}

			return ret;
		}
	}]);

	return dom;
}();

var elementsByTag = {};
dom.customEvents = {};

exports.default = dom;
},{"./DomDelegatedEventHandle":6,"./DomEventHandle":8,"./domData":11,"metal":39}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var METAL_DATA = '__metal_data__';

var domData = function () {
	function domData() {
		_classCallCheck(this, domData);
	}

	_createClass(domData, null, [{
		key: 'get',

		/**
   * Gets Metal.js's data for the given element.
   * @param {!Element} element
   * @return {!Object}
   */
		value: function get(element) {
			if (!element[METAL_DATA]) {
				element[METAL_DATA] = {
					delegating: {},
					listeners: {}
				};
			}
			return element[METAL_DATA];
		}
	}]);

	return domData;
}();

exports.default = domData;
},{}],12:[function(require,module,exports){
'use strict';

var _dom = require('./dom');

var _dom2 = _interopRequireDefault(_dom);

var _features = require('./features');

var _features2 = _interopRequireDefault(_features);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mouseEventMap = {
	mouseenter: 'mouseover',
	mouseleave: 'mouseout',
	pointerenter: 'pointerover',
	pointerleave: 'pointerout'
};
Object.keys(mouseEventMap).forEach(function (eventName) {
	_dom2.default.registerCustomEvent(eventName, {
		delegate: true,
		handler: function handler(callback, event) {
			var related = event.relatedTarget;
			var target = event.delegateTarget;
			if (!related || related !== target && !target.contains(related)) {
				event.customType = eventName;
				return callback(event);
			}
		},
		originalEvent: mouseEventMap[eventName]
	});
});

var animationEventMap = {
	animation: 'animationend',
	transition: 'transitionend'
};
Object.keys(animationEventMap).forEach(function (eventType) {
	var eventName = animationEventMap[eventType];
	_dom2.default.registerCustomEvent(eventName, {
		event: true,
		delegate: true,
		handler: function handler(callback, event) {
			event.customType = eventName;
			return callback(event);
		},
		originalEvent: _features2.default.checkAnimationEventName()[eventType]
	});
});
},{"./dom":10,"./features":13}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dom = require('./dom');

var _dom2 = _interopRequireDefault(_dom);

var _metal = require('metal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Class with static methods responsible for doing browser feature checks.
 */
var features = function () {
	function features() {
		_classCallCheck(this, features);
	}

	_createClass(features, null, [{
		key: 'checkAnimationEventName',

		/**
   * Some browsers still supports prefixed animation events. This method can
   * be used to retrieve the current browser event name for both, animation
   * and transition.
   * @return {object}
   */
		value: function checkAnimationEventName() {
			if (features.animationEventName_ === undefined) {
				features.animationEventName_ = {
					animation: features.checkAnimationEventName_('animation'),
					transition: features.checkAnimationEventName_('transition')
				};
			}
			return features.animationEventName_;
		}

		/**
   * @protected
   * @param {string} type Type to test: animation, transition.
   * @return {string} Browser event name.
   */

	}, {
		key: 'checkAnimationEventName_',
		value: function checkAnimationEventName_(type) {
			var prefixes = ['Webkit', 'MS', 'O', ''];
			var typeTitleCase = _metal.string.replaceInterval(type, 0, 1, type.substring(0, 1).toUpperCase());
			var suffixes = [typeTitleCase + 'End', typeTitleCase + 'End', typeTitleCase + 'End', type + 'end'];
			for (var i = 0; i < prefixes.length; i++) {
				if (features.animationElement_.style[prefixes[i] + typeTitleCase] !== undefined) {
					return prefixes[i].toLowerCase() + suffixes[i];
				}
			}
			return type + 'end';
		}

		/**
   * Some browsers (like IE9) change the order of element attributes, when html
   * is rendered. This method can be used to check if this behavior happens on
   * the current browser.
   * @return {boolean}
   */

	}, {
		key: 'checkAttrOrderChange',
		value: function checkAttrOrderChange() {
			if (features.attrOrderChange_ === undefined) {
				var originalContent = '<div data-component="" data-ref=""></div>';
				var element = document.createElement('div');
				_dom2.default.append(element, originalContent);
				features.attrOrderChange_ = originalContent !== element.innerHTML;
			}
			return features.attrOrderChange_;
		}
	}]);

	return features;
}();

features.animationElement_ = document.createElement('div');
features.animationEventName_ = undefined;
features.attrOrderChange_ = undefined;

exports.default = features;
},{"./dom":10,"metal":39}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _metal = require('metal');

var _dom = require('./dom');

var _dom2 = _interopRequireDefault(_dom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Utility functions for running javascript code in the global scope.
 */
var globalEval = function () {
	function globalEval() {
		_classCallCheck(this, globalEval);
	}

	_createClass(globalEval, null, [{
		key: 'run',

		/**
   * Evaluates the given string in the global scope.
   * @param {string} text
   * @param {function()=} opt_appendFn Optional function to append the node
   *   into document.
   * @return {Element} script
   */
		value: function run(text, opt_appendFn) {
			var script = document.createElement('script');
			script.text = text;
			if (opt_appendFn) {
				opt_appendFn(script);
			} else {
				document.head.appendChild(script);
			}
			_dom2.default.exitDocument(script);
			return script;
		}

		/**
   * Evaluates the given javascript file in the global scope.
   * @param {string} src The file's path.
   * @param {function()=} opt_callback Optional function to be called
   *   when the script has been run.
   * @param {function()=} opt_appendFn Optional function to append the node
   *   into document.
   * @return {Element} script
   */

	}, {
		key: 'runFile',
		value: function runFile(src, opt_callback, opt_appendFn) {
			var script = document.createElement('script');
			script.src = src;

			var callback = function callback() {
				_dom2.default.exitDocument(script);
				opt_callback && opt_callback();
			};
			_dom2.default.once(script, 'load', callback);
			_dom2.default.once(script, 'error', callback);

			if (opt_appendFn) {
				opt_appendFn(script);
			} else {
				document.head.appendChild(script);
			}

			return script;
		}

		/**
   * Evaluates the code referenced by the given script element.
   * @param {!Element} script
   * @param {function()=} opt_callback Optional function to be called
   *   when the script has been run.
   * @param {function()=} opt_appendFn Optional function to append the node
   *   into document.
   * @return {Element} script
   */

	}, {
		key: 'runScript',
		value: function runScript(script, opt_callback, opt_appendFn) {
			var callback = function callback() {
				opt_callback && opt_callback();
			};
			if (script.type && script.type !== 'text/javascript') {
				_metal.async.nextTick(callback);
				return;
			}
			_dom2.default.exitDocument(script);
			if (script.src) {
				return globalEval.runFile(script.src, opt_callback, opt_appendFn);
			} else {
				_metal.async.nextTick(callback);
				return globalEval.run(script.text, opt_appendFn);
			}
		}

		/**
   * Evaluates any script tags present in the given element.
   * @params {!Element} element
   * @param {function()=} opt_callback Optional function to be called
   *   when the script has been run.
   * @param {function()=} opt_appendFn Optional function to append the node
   *   into document.
   */

	}, {
		key: 'runScriptsInElement',
		value: function runScriptsInElement(element, opt_callback, opt_appendFn) {
			var scripts = element.querySelectorAll('script');
			if (scripts.length) {
				globalEval.runScriptsInOrder(scripts, 0, opt_callback, opt_appendFn);
			} else if (opt_callback) {
				_metal.async.nextTick(opt_callback);
			}
		}

		/**
   * Runs the given scripts elements in the order that they appear.
   * @param {!NodeList} scripts
   * @param {number} index
   * @param {function()=} opt_callback Optional function to be called
   *   when the script has been run.
   * @param {function()=} opt_appendFn Optional function to append the node
   *   into document.
   */

	}, {
		key: 'runScriptsInOrder',
		value: function runScriptsInOrder(scripts, index, opt_callback, opt_appendFn) {
			globalEval.runScript(scripts.item(index), function () {
				if (index < scripts.length - 1) {
					globalEval.runScriptsInOrder(scripts, index + 1, opt_callback, opt_appendFn);
				} else if (opt_callback) {
					_metal.async.nextTick(opt_callback);
				}
			}, opt_appendFn);
		}
	}]);

	return globalEval;
}();

exports.default = globalEval;
},{"./dom":10,"metal":39}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _metal = require('metal');

var _dom = require('./dom');

var _dom2 = _interopRequireDefault(_dom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Utility functions for running styles.
 */
var globalEvalStyles = function () {
	function globalEvalStyles() {
		_classCallCheck(this, globalEvalStyles);
	}

	_createClass(globalEvalStyles, null, [{
		key: 'run',

		/**
   * Evaluates the given style.
   * @param {string} text
   * @param {function()=} opt_appendFn Optional function to append the node
   *   into document.
   * @return {Element} style
   */
		value: function run(text, opt_appendFn) {
			var style = document.createElement('style');
			style.innerHTML = text;
			if (opt_appendFn) {
				opt_appendFn(style);
			} else {
				document.head.appendChild(style);
			}
			return style;
		}

		/**
   * Evaluates the given style file.
   * @param {string} href The file's path.
   * @param {function()=} opt_callback Optional function to be called
   *   when the styles has been run.
   * @param {function()=} opt_appendFn Optional function to append the node
   *   into document.
   * @return {Element} style
   */

	}, {
		key: 'runFile',
		value: function runFile(href, opt_callback, opt_appendFn) {
			var link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = href;
			globalEvalStyles.runStyle(link, opt_callback, opt_appendFn);
			return link;
		}

		/**
   * Evaluates the code referenced by the given style/link element.
   * @param {!Element} style
   * @param {function()=} opt_callback Optional function to be called
   *   when the script has been run.
   * @param {function()=} opt_appendFn Optional function to append the node
   *   into document.
   *  @return {Element} style
   */

	}, {
		key: 'runStyle',
		value: function runStyle(style, opt_callback, opt_appendFn) {
			var callback = function callback() {
				opt_callback && opt_callback();
			};
			if (style.rel && style.rel !== 'stylesheet') {
				_metal.async.nextTick(callback);
				return;
			}

			if (style.tagName === 'STYLE') {
				_metal.async.nextTick(callback);
			} else {
				_dom2.default.once(style, 'load', callback);
				_dom2.default.once(style, 'error', callback);
			}

			if (opt_appendFn) {
				opt_appendFn(style);
			} else {
				document.head.appendChild(style);
			}

			return style;
		}

		/**
   * Evaluates any style present in the given element.
   * @params {!Element} element
   * @param {function()=} opt_callback Optional function to be called when the
   *   style has been run.
   * @param {function()=} opt_appendFn Optional function to append the node
   *   into document.
   */

	}, {
		key: 'runStylesInElement',
		value: function runStylesInElement(element, opt_callback, opt_appendFn) {
			var styles = element.querySelectorAll('style,link');
			if (styles.length === 0 && opt_callback) {
				_metal.async.nextTick(opt_callback);
				return;
			}

			var loadCount = 0;
			var callback = function callback() {
				if (opt_callback && ++loadCount === styles.length) {
					_metal.async.nextTick(opt_callback);
				}
			};
			for (var i = 0; i < styles.length; i++) {
				globalEvalStyles.runStyle(styles[i], callback, opt_appendFn);
			}
		}
	}]);

	return globalEvalStyles;
}();

exports.default = globalEvalStyles;
},{"./dom":10,"metal":39}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _metal = require('metal');

var _EventHandle = require('./EventHandle');

var _EventHandle2 = _interopRequireDefault(_EventHandle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * EventEmitter utility.
 * @constructor
 * @extends {Disposable}
 */
var EventEmitter = function (_Disposable) {
	_inherits(EventEmitter, _Disposable);

	function EventEmitter() {
		_classCallCheck(this, EventEmitter);

		/**
   * Holds event listeners scoped by event type.
   * @type {!Object<string, !Array<!function()>>}
   * @protected
   */
		var _this = _possibleConstructorReturn(this, (EventEmitter.__proto__ || Object.getPrototypeOf(EventEmitter)).call(this));

		_this.events_ = [];

		/**
   * The maximum number of listeners allowed for each event type. If the number
   * becomes higher than the max, a warning will be issued.
   * @type {number}
   * @protected
   */
		_this.maxListeners_ = 10;

		/**
   * Configuration option which determines if an event facade should be sent
   * as a param of listeners when emitting events. If set to true, the facade
   * will be passed as the first argument of the listener.
   * @type {boolean}
   * @protected
   */
		_this.shouldUseFacade_ = false;
		return _this;
	}

	/**
  * Adds a listener to the end of the listeners array for the specified events.
  * @param {!(Array|string)} events
  * @param {!Function} listener
  * @param {boolean} opt_default Flag indicating if this listener is a default
  *   action for this event. Default actions are run last, and only if no previous
  *   listener call `preventDefault()` on the received event facade.
  * @return {!EventHandle} Can be used to remove the listener.
  */


	_createClass(EventEmitter, [{
		key: 'addListener',
		value: function addListener(events, listener, opt_default) {
			this.validateListener_(listener);

			events = this.normalizeEvents_(events);
			for (var i = 0; i < events.length; i++) {
				this.addSingleListener_(events[i], listener, opt_default);
			}

			return new _EventHandle2.default(this, events, listener);
		}

		/**
   * Adds a listener to the end of the listeners array for a single event.
   * @param {string} event
   * @param {!Function} listener
   * @param {boolean} opt_default Flag indicating if this listener is a default
   *   action for this event. Default actions are run last, and only if no previous
   *   listener call `preventDefault()` on the received event facade.
   * @return {!EventHandle} Can be used to remove the listener.
   * @param {Function=} opt_origin The original function that was added as a
   *   listener, if there is any.
   * @protected
   */

	}, {
		key: 'addSingleListener_',
		value: function addSingleListener_(event, listener, opt_default, opt_origin) {
			this.emit('newListener', event, listener);

			if (!this.events_[event]) {
				this.events_[event] = [];
			}
			this.events_[event].push({
				default: opt_default,
				fn: listener,
				origin: opt_origin
			});

			var listeners = this.events_[event];
			if (listeners.length > this.maxListeners_ && !listeners.warned) {
				console.warn('Possible EventEmitter memory leak detected. %d listeners added ' + 'for event %s. Use emitter.setMaxListeners() to increase limit.', listeners.length, event);
				listeners.warned = true;
			}
		}

		/**
   * Disposes of this instance's object references.
   * @override
   */

	}, {
		key: 'disposeInternal',
		value: function disposeInternal() {
			this.events_ = [];
		}

		/**
   * Execute each of the listeners in order with the supplied arguments.
   * @param {string} event
   * @param {*} opt_args [arg1], [arg2], [...]
   * @return {boolean} Returns true if event had listeners, false otherwise.
   */

	}, {
		key: 'emit',
		value: function emit(event) {
			var args = _metal.array.slice(arguments, 1);
			var listeners = (this.events_[event] || []).concat();

			var facade;
			if (this.getShouldUseFacade()) {
				facade = {
					preventDefault: function preventDefault() {
						facade.preventedDefault = true;
					},
					target: this,
					type: event
				};
				args.push(facade);
			}

			var defaultListeners = [];
			for (var i = 0; i < listeners.length; i++) {
				if (listeners[i].default) {
					defaultListeners.push(listeners[i]);
				} else {
					listeners[i].fn.apply(this, args);
				}
			}
			if (!facade || !facade.preventedDefault) {
				for (var j = 0; j < defaultListeners.length; j++) {
					defaultListeners[j].fn.apply(this, args);
				}
			}

			if (event !== '*') {
				this.emit.apply(this, ['*', event].concat(args));
			}

			return listeners.length > 0;
		}

		/**
   * Gets the configuration option which determines if an event facade should
   * be sent as a param of listeners when emitting events. If set to true, the
   * facade will be passed as the first argument of the listener.
   * @return {boolean}
   */

	}, {
		key: 'getShouldUseFacade',
		value: function getShouldUseFacade() {
			return this.shouldUseFacade_;
		}

		/**
   * Returns an array of listeners for the specified event.
   * @param {string} event
   * @return {Array} Array of listeners.
   */

	}, {
		key: 'listeners',
		value: function listeners(event) {
			return (this.events_[event] || []).map(function (listener) {
				return listener.fn;
			});
		}

		/**
   * Adds a listener that will be invoked a fixed number of times for the
   * events. After each event is triggered the specified amount of times, the
   * listener is removed for it.
   * @param {!(Array|string)} events
   * @param {number} amount The amount of times this event should be listened
   * to.
   * @param {!Function} listener
   * @return {!EventHandle} Can be used to remove the listener.
   */

	}, {
		key: 'many',
		value: function many(events, amount, listener) {
			events = this.normalizeEvents_(events);
			for (var i = 0; i < events.length; i++) {
				this.many_(events[i], amount, listener);
			}

			return new _EventHandle2.default(this, events, listener);
		}

		/**
   * Adds a listener that will be invoked a fixed number of times for a single
   * event. After the event is triggered the specified amount of times, the
   * listener is removed.
   * @param {string} event
   * @param {number} amount The amount of times this event should be listened
   * to.
   * @param {!Function} listener
   * @protected
   */

	}, {
		key: 'many_',
		value: function many_(event, amount, listener) {
			var self = this;

			if (amount <= 0) {
				return;
			}

			function handlerInternal() {
				if (--amount === 0) {
					self.removeListener(event, handlerInternal);
				}
				listener.apply(self, arguments);
			}

			self.addSingleListener_(event, handlerInternal, false, listener);
		}

		/**
   * Checks if a listener object matches the given listener function. To match,
   * it needs to either point to that listener or have it as its origin.
   * @param {!Object} listenerObj
   * @param {!Function} listener
   * @return {boolean}
   * @protected
   */

	}, {
		key: 'matchesListener_',
		value: function matchesListener_(listenerObj, listener) {
			return listenerObj.fn === listener || listenerObj.origin && listenerObj.origin === listener;
		}

		/**
   * Converts the parameter to an array if only one event is given.
   * @param  {!(Array|string)} events
   * @return {!Array}
   * @protected
   */

	}, {
		key: 'normalizeEvents_',
		value: function normalizeEvents_(events) {
			return _metal.core.isString(events) ? [events] : events;
		}

		/**
   * Removes a listener for the specified events.
   * Caution: changes array indices in the listener array behind the listener.
   * @param {!(Array|string)} events
   * @param {!Function} listener
   * @return {!Object} Returns emitter, so calls can be chained.
   */

	}, {
		key: 'off',
		value: function off(events, listener) {
			this.validateListener_(listener);

			events = this.normalizeEvents_(events);
			for (var i = 0; i < events.length; i++) {
				var listenerObjs = this.events_[events[i]] || [];
				this.removeMatchingListenerObjs_(listenerObjs, listener);
			}

			return this;
		}

		/**
   * Adds a listener to the end of the listeners array for the specified events.
   * @param {!(Array|string)} events
   * @param {!Function} listener
   * @return {!EventHandle} Can be used to remove the listener.
   */

	}, {
		key: 'on',
		value: function on() {
			return this.addListener.apply(this, arguments);
		}

		/**
   * Adds a one time listener for the events. This listener is invoked only the
   * next time each event is fired, after which it is removed.
   * @param {!(Array|string)} events
   * @param {!Function} listener
   * @return {!EventHandle} Can be used to remove the listener.
   */

	}, {
		key: 'once',
		value: function once(events, listener) {
			return this.many(events, 1, listener);
		}

		/**
   * Removes all listeners, or those of the specified events. It's not a good
   * idea to remove listeners that were added elsewhere in the code,
   * especially when it's on an emitter that you didn't create.
   * @param {(Array|string)=} opt_events
   * @return {!Object} Returns emitter, so calls can be chained.
   */

	}, {
		key: 'removeAllListeners',
		value: function removeAllListeners(opt_events) {
			if (opt_events) {
				var events = this.normalizeEvents_(opt_events);
				for (var i = 0; i < events.length; i++) {
					this.events_[events[i]] = null;
				}
			} else {
				this.events_ = {};
			}
			return this;
		}

		/**
   * Removes all listener objects from the given array that match the given
   * listener function.
   * @param {!Array.<Object>} listenerObjs
   * @param {!Function} listener
   * @protected
   */

	}, {
		key: 'removeMatchingListenerObjs_',
		value: function removeMatchingListenerObjs_(listenerObjs, listener) {
			for (var i = listenerObjs.length - 1; i >= 0; i--) {
				if (this.matchesListener_(listenerObjs[i], listener)) {
					listenerObjs.splice(i, 1);
				}
			}
		}

		/**
   * Removes a listener for the specified events.
   * Caution: changes array indices in the listener array behind the listener.
   * @param {!(Array|string)} events
   * @param {!Function} listener
   * @return {!Object} Returns emitter, so calls can be chained.
   */

	}, {
		key: 'removeListener',
		value: function removeListener() {
			return this.off.apply(this, arguments);
		}

		/**
   * By default EventEmitters will print a warning if more than 10 listeners
   * are added for a particular event. This is a useful default which helps
   * finding memory leaks. Obviously not all Emitters should be limited to 10.
   * This function allows that to be increased. Set to zero for unlimited.
   * @param {number} max The maximum number of listeners.
   * @return {!Object} Returns emitter, so calls can be chained.
   */

	}, {
		key: 'setMaxListeners',
		value: function setMaxListeners(max) {
			this.maxListeners_ = max;
			return this;
		}

		/**
   * Sets the configuration option which determines if an event facade should
   * be sent as a param of listeners when emitting events. If set to true, the
   * facade will be passed as the first argument of the listener.
   * @param {boolean} shouldUseFacade
   * @return {!Object} Returns emitter, so calls can be chained.
   */

	}, {
		key: 'setShouldUseFacade',
		value: function setShouldUseFacade(shouldUseFacade) {
			this.shouldUseFacade_ = shouldUseFacade;
			return this;
		}

		/**
   * Checks if the given listener is valid, throwing an exception when it's not.
   * @param  {*} listener
   * @protected
   */

	}, {
		key: 'validateListener_',
		value: function validateListener_(listener) {
			if (!_metal.core.isFunction(listener)) {
				throw new TypeError('Listener must be a function');
			}
		}
	}]);

	return EventEmitter;
}(_metal.Disposable);

exports.default = EventEmitter;
},{"./EventHandle":18,"metal":39}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _metal = require('metal');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * EventEmitterProxy utility. It's responsible for linking two EventEmitter
 * instances together, emitting events from the first emitter through the
 * second one. That means that listening to a supported event on the target
 * emitter will mean listening to it on the origin emitter as well.
 * @param {EventEmitter} originEmitter Events originated on this emitter
 *   will be fired for the target emitter's listeners as well.
 * @param {EventEmitter} targetEmitter Event listeners attached to this emitter
 *   will also be triggered when the event is fired by the origin emitter.
 * @param {Object} opt_blacklist Optional blacklist of events that should not be
 *   proxied.
 * @constructor
 * @extends {Disposable}
 */
var EventEmitterProxy = function (_Disposable) {
	_inherits(EventEmitterProxy, _Disposable);

	function EventEmitterProxy(originEmitter, targetEmitter, opt_blacklist, opt_whitelist) {
		_classCallCheck(this, EventEmitterProxy);

		/**
   * Map of events that should not be proxied.
   * @type {Object}
   * @protected
   */
		var _this = _possibleConstructorReturn(this, (EventEmitterProxy.__proto__ || Object.getPrototypeOf(EventEmitterProxy)).call(this));

		_this.blacklist_ = opt_blacklist || {};

		/**
   * The origin emitter. This emitter's events will be proxied through the
   * target emitter.
   * @type {EventEmitter}
   * @protected
   */
		_this.originEmitter_ = originEmitter;

		/**
   * A list of events that are pending to be listened by an actual origin
   * emitter. Events are stored here when the origin doesn't exist, so they
   * can be set on a new origin when one is set.
   * @type {!Array}
   * @protected
   */
		_this.pendingEvents_ = [];

		/**
   * Holds a map of events from the origin emitter that are already being proxied.
   * @type {Object<string, !EventHandle>}
   * @protected
   */
		_this.proxiedEvents_ = {};

		/**
   * The target emitter. This emitter will emit all events that come from
   * the origin emitter.
   * @type {EventEmitter}
   * @protected
   */
		_this.targetEmitter_ = targetEmitter;

		/**
   * Map of events that should be proxied. If whitelist is set blacklist is ignored.
   * @type {Object}
   * @protected
   */
		_this.whitelist_ = opt_whitelist;

		_this.startProxy_();
		return _this;
	}

	/**
  * Adds the given listener for the given event.
  * @param {string} event
  * @param {!function()} listener
  * @return {!EventHandle} The listened event's handle.
  * @protected
  */


	_createClass(EventEmitterProxy, [{
		key: 'addListener_',
		value: function addListener_(event, listener) {
			return this.originEmitter_.on(event, listener);
		}

		/**
   * Adds the proxy listener for the given event.
   * @param {string} event
   * @return {!EventHandle} The listened event's handle.
   * @protected
   */

	}, {
		key: 'addListenerForEvent_',
		value: function addListenerForEvent_(event) {
			return this.addListener_(event, this.emitOnTarget_.bind(this, event));
		}

		/**
   * @inheritDoc
   */

	}, {
		key: 'disposeInternal',
		value: function disposeInternal() {
			this.removeListeners_();
			this.proxiedEvents_ = null;
			this.originEmitter_ = null;
			this.targetEmitter_ = null;
		}

		/**
   * Emits the specified event type on the target emitter.
   * @param {string} eventType
   * @protected
   */

	}, {
		key: 'emitOnTarget_',
		value: function emitOnTarget_(eventType) {
			var args = [eventType].concat(_metal.array.slice(arguments, 1));
			this.targetEmitter_.emit.apply(this.targetEmitter_, args);
		}

		/**
   * Proxies the given event from the origin to the target emitter.
   * @param {string} event
   */

	}, {
		key: 'proxyEvent',
		value: function proxyEvent(event) {
			if (this.shouldProxyEvent_(event)) {
				this.tryToAddListener_(event);
			}
		}

		/**
   * Removes the proxy listener for all events.
   * @protected
   */

	}, {
		key: 'removeListeners_',
		value: function removeListeners_() {
			var events = Object.keys(this.proxiedEvents_);
			for (var i = 0; i < events.length; i++) {
				this.proxiedEvents_[events[i]].removeListener();
			}
			this.proxiedEvents_ = {};
			this.pendingEvents_ = [];
		}

		/**
   * Changes the origin emitter. This automatically detaches any events that
   * were already being proxied from the previous emitter, and starts proxying
   * them on the new emitter instead.
   * @param {!EventEmitter} originEmitter
   */

	}, {
		key: 'setOriginEmitter',
		value: function setOriginEmitter(originEmitter) {
			var _this2 = this;

			var events = this.originEmitter_ ? Object.keys(this.proxiedEvents_) : this.pendingEvents_;
			this.removeListeners_();
			this.originEmitter_ = originEmitter;
			events.forEach(function (event) {
				return _this2.proxyEvent(event);
			});
		}

		/**
   * Checks if the given event should be proxied.
   * @param {string} event
   * @return {boolean}
   * @protected
   */

	}, {
		key: 'shouldProxyEvent_',
		value: function shouldProxyEvent_(event) {
			if (this.whitelist_ && !this.whitelist_[event]) {
				return false;
			}
			if (this.blacklist_[event]) {
				return false;
			}
			return !this.proxiedEvents_[event];
		}

		/**
   * Starts proxying all events from the origin to the target emitter.
   * @protected
   */

	}, {
		key: 'startProxy_',
		value: function startProxy_() {
			this.targetEmitter_.on('newListener', this.proxyEvent.bind(this));
		}

		/**
   * Adds a listener to the origin emitter, if it exists. Otherwise, stores
   * the pending listener so it can be used on a future origin emitter.
   * @param {string} event
   * @protected
   */

	}, {
		key: 'tryToAddListener_',
		value: function tryToAddListener_(event) {
			if (this.originEmitter_) {
				this.proxiedEvents_[event] = this.addListenerForEvent_(event);
			} else {
				this.pendingEvents_.push(event);
			}
		}
	}]);

	return EventEmitterProxy;
}(_metal.Disposable);

exports.default = EventEmitterProxy;
},{"metal":39}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _metal = require('metal');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * EventHandle utility. Holds information about an event subscription, and
 * allows removing them easily.
 * EventHandle is a Disposable, but it's important to note that the
 * EventEmitter that created it is not the one responsible for disposing it.
 * That responsibility is for the code that holds a reference to it.
 * @param {!EventEmitter} emitter Emitter the event was subscribed to.
 * @param {string} event The name of the event that was subscribed to.
 * @param {!Function} listener The listener subscribed to the event.
 * @constructor
 * @extends {Disposable}
 */
var EventHandle = function (_Disposable) {
	_inherits(EventHandle, _Disposable);

	function EventHandle(emitter, event, listener) {
		_classCallCheck(this, EventHandle);

		/**
   * The EventEmitter instance that the event was subscribed to.
   * @type {EventEmitter}
   * @protected
   */
		var _this = _possibleConstructorReturn(this, (EventHandle.__proto__ || Object.getPrototypeOf(EventHandle)).call(this));

		_this.emitter_ = emitter;

		/**
   * The name of the event that was subscribed to.
   * @type {string}
   * @protected
   */
		_this.event_ = event;

		/**
   * The listener subscribed to the event.
   * @type {Function}
   * @protected
   */
		_this.listener_ = listener;
		return _this;
	}

	/**
  * Disposes of this instance's object references.
  * @override
  */


	_createClass(EventHandle, [{
		key: 'disposeInternal',
		value: function disposeInternal() {
			this.removeListener();
			this.emitter_ = null;
			this.listener_ = null;
		}

		/**
   * Removes the listener subscription from the emitter.
   */

	}, {
		key: 'removeListener',
		value: function removeListener() {
			if (!this.emitter_.isDisposed()) {
				this.emitter_.removeListener(this.event_, this.listener_);
			}
		}
	}]);

	return EventHandle;
}(_metal.Disposable);

exports.default = EventHandle;
},{"metal":39}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _metal = require('metal');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * EventHandler utility. It's useful for easily removing a group of
 * listeners from different EventEmitter instances.
 * @constructor
 * @extends {Disposable}
 */
var EventHandler = function (_Disposable) {
	_inherits(EventHandler, _Disposable);

	function EventHandler() {
		_classCallCheck(this, EventHandler);

		/**
   * An array that holds the added event handles, so the listeners can be
   * removed later.
   * @type {Array.<EventHandle>}
   * @protected
   */
		var _this = _possibleConstructorReturn(this, (EventHandler.__proto__ || Object.getPrototypeOf(EventHandler)).call(this));

		_this.eventHandles_ = [];
		return _this;
	}

	/**
  * Adds event handles to be removed later through the `removeAllListeners`
  * method.
  * @param {...(!EventHandle)} var_args
  */


	_createClass(EventHandler, [{
		key: 'add',
		value: function add() {
			for (var i = 0; i < arguments.length; i++) {
				this.eventHandles_.push(arguments[i]);
			}
		}

		/**
   * Disposes of this instance's object references.
   * @override
   */

	}, {
		key: 'disposeInternal',
		value: function disposeInternal() {
			this.eventHandles_ = null;
		}

		/**
   * Removes all listeners that have been added through the `add` method.
   */

	}, {
		key: 'removeAllListeners',
		value: function removeAllListeners() {
			for (var i = 0; i < this.eventHandles_.length; i++) {
				this.eventHandles_[i].removeListener();
			}

			this.eventHandles_ = [];
		}
	}]);

	return EventHandler;
}(_metal.Disposable);

exports.default = EventHandler;
},{"metal":39}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EventHandler = exports.EventHandle = exports.EventEmitterProxy = exports.EventEmitter = undefined;

var _EventEmitter = require('./EventEmitter');

var _EventEmitter2 = _interopRequireDefault(_EventEmitter);

var _EventEmitterProxy = require('./EventEmitterProxy');

var _EventEmitterProxy2 = _interopRequireDefault(_EventEmitterProxy);

var _EventHandle = require('./EventHandle');

var _EventHandle2 = _interopRequireDefault(_EventHandle);

var _EventHandler = require('./EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _EventEmitter2.default;
exports.EventEmitter = _EventEmitter2.default;
exports.EventEmitterProxy = _EventEmitterProxy2.default;
exports.EventHandle = _EventHandle2.default;
exports.EventHandler = _EventHandler2.default;
},{"./EventEmitter":16,"./EventEmitterProxy":17,"./EventHandle":18,"./EventHandler":19}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('./incremental-dom');

var _metal = require('metal');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Class responsible for intercepting incremental dom functions through AOP.
 */
var IncrementalDomAop = function () {
	function IncrementalDomAop() {
		_classCallCheck(this, IncrementalDomAop);
	}

	_createClass(IncrementalDomAop, null, [{
		key: 'getOriginalFns',

		/**
   * Gets the original functions that are intercepted by `IncrementalDomAop`.
   * @return {!Object}
   */
		value: function getOriginalFns() {
			return fnStack[0];
		}

		/**
   * Starts intercepting calls to incremental dom, replacing them with the given
   * functions. Note that `elementVoid`, `elementOpenStart`, `elementOpenEnd`
   * and `attr` are the only ones that can't be intercepted, since they'll
   * automatically be converted into equivalent calls to `elementOpen` and
   * `elementClose`.
   * @param {!Object} fns Functions to be called instead of the original ones
   *     from incremental DOM. Should be given as a map from the function name
   *     to the function that should intercept it. All interceptors will receive
   *     the original function as the first argument, the actual arguments from
   *     from the original call following it.
   */

	}, {
		key: 'startInterception',
		value: function startInterception(fns) {
			var originals = IncrementalDomAop.getOriginalFns();
			fns = _metal.object.map(fns, function (name, value) {
				return value.bind(null, originals[name]);
			});
			fnStack.push(_metal.object.mixin({}, originals, fns, {
				attr: fnAttr,
				elementOpenEnd: fnOpenEnd,
				elementOpenStart: fnOpenStart,
				elementVoid: fnVoid
			}));
		}

		/**
   * Restores the original `elementOpen` function from incremental dom to the
   * implementation it used before the last call to `startInterception`.
   */

	}, {
		key: 'stopInterception',
		value: function stopInterception() {
			if (fnStack.length > 1) {
				fnStack.pop();
			}
		}
	}]);

	return IncrementalDomAop;
}();

var fnStack = [{
	attr: IncrementalDOM.attr,
	attributes: IncrementalDOM.attributes[IncrementalDOM.symbols.default],
	elementClose: IncrementalDOM.elementClose,
	elementOpen: IncrementalDOM.elementOpen,
	elementOpenEnd: IncrementalDOM.elementOpenEnd,
	elementOpenStart: IncrementalDOM.elementOpenStart,
	elementVoid: IncrementalDOM.elementVoid,
	text: IncrementalDOM.text
}];

var collectedArgs = [];

function fnAttr(name, value) {
	collectedArgs.push(name, value);
}

function fnOpenStart(tag, key, statics) {
	collectedArgs = [tag, key, statics];
}

function fnOpenEnd() {
	return getFn('elementOpen').apply(null, collectedArgs);
}

function fnVoid(tag) {
	getFn('elementOpen').apply(null, arguments);
	return getFn('elementClose')(tag);
}

function getFn(name) {
	return fnStack[fnStack.length - 1][name];
}

function handleCall(name) {
	return getFn(name).apply(null, _metal.array.slice(arguments, 1));
}

IncrementalDOM.attr = handleCall.bind(null, 'attr');
IncrementalDOM.elementClose = handleCall.bind(null, 'elementClose');
IncrementalDOM.elementOpen = handleCall.bind(null, 'elementOpen');
IncrementalDOM.elementOpenEnd = handleCall.bind(null, 'elementOpenEnd');
IncrementalDOM.elementOpenStart = handleCall.bind(null, 'elementOpenStart');
IncrementalDOM.elementVoid = handleCall.bind(null, 'elementVoid');
IncrementalDOM.text = handleCall.bind(null, 'text');

IncrementalDOM.attributes[IncrementalDOM.symbols.default] = handleCall.bind(null, 'attributes');

exports.default = IncrementalDomAop;
},{"./incremental-dom":25,"metal":39}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

require('./incremental-dom');

var _metal = require('metal');

var _metalDom = require('metal-dom');

var _metalDom2 = _interopRequireDefault(_metalDom);

var _metalComponent = require('metal-component');

var _IncrementalDomAop = require('./IncrementalDomAop');

var _IncrementalDomAop2 = _interopRequireDefault(_IncrementalDomAop);

var _IncrementalDomChildren = require('./children/IncrementalDomChildren');

var _IncrementalDomChildren2 = _interopRequireDefault(_IncrementalDomChildren);

var _IncrementalDomUnusedComponents = require('./cleanup/IncrementalDomUnusedComponents');

var _IncrementalDomUnusedComponents2 = _interopRequireDefault(_IncrementalDomUnusedComponents);

var _IncrementalDomUtils = require('./utils/IncrementalDomUtils');

var _IncrementalDomUtils2 = _interopRequireDefault(_IncrementalDomUtils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Class responsible for rendering components via incremental dom.
 */
var IncrementalDomRenderer = function (_ComponentRenderer) {
	_inherits(IncrementalDomRenderer, _ComponentRenderer);

	/**
  * @inheritDoc
  */
	function IncrementalDomRenderer(comp) {
		_classCallCheck(this, IncrementalDomRenderer);

		var _this = _possibleConstructorReturn(this, (IncrementalDomRenderer.__proto__ || Object.getPrototypeOf(IncrementalDomRenderer)).call(this, comp));

		comp.context = {};
		_this.setConfig_(comp, comp.getInitialConfig());
		_this.changes_ = {};
		comp.on('attached', _this.handleAttached_.bind(_this));

		if (!_this.component_.constructor.SYNC_UPDATES_MERGED) {
			// If the component is being updated synchronously we'll just reuse the
			// `handleComponentRendererStateKeyChanged_` function from
			// `ComponentRenderer`.
			comp.on('stateKeyChanged', _this.handleStateKeyChanged_.bind(_this));
		}

		// Binds functions that will be used many times, to avoid creating new
		// functions each time.
		_this.handleInterceptedAttributesCall_ = _this.handleInterceptedAttributesCall_.bind(_this);
		_this.handleInterceptedOpenCall_ = _this.handleInterceptedOpenCall_.bind(_this);
		_this.handleChildrenCaptured_ = _this.handleChildrenCaptured_.bind(_this);
		_this.handleChildRender_ = _this.handleChildRender_.bind(_this);
		_this.renderInsidePatchDontSkip_ = _this.renderInsidePatchDontSkip_.bind(_this);
		return _this;
	}

	/**
  * Attaches inline listeners found on the first component render, since those
  * may come from existing elements on the page that already have
  * data-on[eventname] attributes set to its final value. This won't trigger
  * `handleInterceptedAttributesCall_`, so we need manual work to guarantee
  * that projects using progressive enhancement like this will still work.
  * @param {!Element} node
  * @param {!Array} args
  * @protected
  */


	_createClass(IncrementalDomRenderer, [{
		key: 'attachDecoratedListeners_',
		value: function attachDecoratedListeners_(node, args) {
			if (!this.component_.wasRendered) {
				var attrs = (args[2] || []).concat(args.slice(3));
				for (var i = 0; i < attrs.length; i += 2) {
					var eventName = this.getEventFromListenerAttr_(attrs[i]);
					if (eventName && !node[eventName + '__handle__']) {
						this.attachEvent_(node, attrs[i], eventName, attrs[i + 1]);
					}
				}
			}
		}

		/**
   * Listens to the specified event, attached via incremental dom calls.
   * @param {!Element} element
   * @param {string} key
   * @param {string} eventName
   * @param {function()|string} fn
   * @protected
   */

	}, {
		key: 'attachEvent_',
		value: function attachEvent_(element, key, eventName, fn) {
			var handleKey = eventName + '__handle__';
			if (element[handleKey]) {
				element[handleKey].removeListener();
				element[handleKey] = null;
			}

			element[key] = fn;
			if (fn) {
				if (_metal.core.isString(fn)) {
					if (key[0] === 'd') {
						// Allow data-on[eventkey] listeners to stay in the dom, as they
						// won't cause conflicts.
						element.setAttribute(key, fn);
					}
					fn = this.component_.getListenerFn(fn);
				}
				element[handleKey] = _metalDom2.default.delegate(document, eventName, element, fn);
			} else {
				element.removeAttribute(key);
			}
		}

		/**
   * Builds the "children" config property to be passed to the current
   * component.
   * @param {!Array<!Object>} children
   * @return {!Array<!Object>}
   * @protected
   */

	}, {
		key: 'buildChildren_',
		value: function buildChildren_(children) {
			return children.length === 0 ? emptyChildren_ : children;
		}

		/**
   * Builds the key for the next component that is found.
   * @param {string} tag The component's tag.
   * @return {string}
   */

	}, {
		key: 'buildRef',
		value: function buildRef(tag) {
			var ctor = _metal.core.isString(tag) ? _metalComponent.ComponentRegistry.getConstructor(tag) : tag;
			var prefix = this.currentPrefix_ + _metal.core.getUid(ctor, true);
			var count = this.generatedRefCount_[prefix] || 0;
			this.generatedRefCount_[prefix] = count + 1;
			return prefix + 'sub' + count;
		}

		/**
   * Gets the component being currently rendered via `IncrementalDomRenderer`.
   * @return {Component}
   */

	}, {
		key: 'getSubComponent_',


		/**
   * Gets the sub component referenced by the given tag and config data,
   * creating it if it doesn't yet exist.
   * @param {string|!Function} tagOrCtor The tag name.
   * @param {!Object} config The config object for the sub component.
   * @return {!Component} The sub component.
   * @protected
   */
		value: function getSubComponent_(tagOrCtor, config) {
			var ConstructorFn = tagOrCtor;
			if (_metal.core.isString(ConstructorFn)) {
				ConstructorFn = _metalComponent.ComponentRegistry.getConstructor(tagOrCtor);
			}

			var comp = this.component_.components[config.ref];
			if (comp && comp.constructor !== ConstructorFn) {
				comp = null;
			}

			if (!comp) {
				comp = new ConstructorFn(config, false);
				this.component_.addSubComponent(config.ref, comp);
			}

			if (comp.wasRendered) {
				this.setConfig_(comp, config);
				comp.getRenderer().startSkipUpdates();
				comp.setState(config);
				comp.getRenderer().stopSkipUpdates();
			}
			return comp;
		}

		/**
   * Guarantees that the component's element has a parent. That's necessary
   * when calling incremental dom's `patchOuter` for now, as otherwise it will
   * throw an error if the element needs to be replaced.
   * @return {Element} The parent, in case it was added.
   * @protected
   */

	}, {
		key: 'guaranteeParent_',
		value: function guaranteeParent_() {
			var element = this.component_.element;
			if (!element || !element.parentNode) {
				var parent = document.createElement('div');
				if (element) {
					_metalDom2.default.append(parent, element);
				}
				return parent;
			}
		}

		/**
   * Removes the most recent component from the queue of rendering components.
   */

	}, {
		key: 'handleAttached_',


		/**
   * Handles the `attached` listener. Stores attach data.
   * @param {!Object} data
   * @protected
   */
		value: function handleAttached_(data) {
			this.attachData_ = data;
		}

		/**
   * Handles an intercepted call to the attributes default handler from
   * incremental dom.
   * @param {!function()} originalFn The original function before interception.
   * @param {!Element} element
   * @param {string} name
   * @param {*} value
   * @protected
   */

	}, {
		key: 'handleInterceptedAttributesCall_',
		value: function handleInterceptedAttributesCall_(originalFn, element, name, value) {
			var eventName = this.getEventFromListenerAttr_(name);
			if (eventName) {
				this.attachEvent_(element, name, eventName, value);
				return;
			}

			if (name === 'checked') {
				// This is a temporary fix to account for incremental dom setting
				// "checked" as an attribute only, which can cause bugs since that won't
				// necessarily check/uncheck the element it's set on. See
				// https://github.com/google/incremental-dom/issues/198 for more details.
				value = _metal.core.isDefAndNotNull(value) && value !== false;
			}

			if (name === 'value' && element.value !== value) {
				// This is a temporary fix to account for incremental dom setting
				// "value" as an attribute only, which can cause bugs since that won't
				// necessarily update the input's content it's set on. See
				// https://github.com/google/incremental-dom/issues/239 for more details.
				// We only do this if the new value is different though, as otherwise the
				// browser will automatically move the typing cursor to the end of the
				// field.
				element[name] = value;
			}

			if (_metal.core.isBoolean(value)) {
				// Incremental dom sets boolean values as string data attributes, which
				// is counter intuitive. This changes the behavior to use the actual
				// boolean value.
				element[name] = value;
				if (value) {
					element.setAttribute(name, '');
				} else {
					element.removeAttribute(name);
				}
			} else {
				originalFn(element, name, value);
			}
		}

		/**
   * Handles the event of children having finished being captured.
   * @param {!Object} The captured children in tree format.
   * @protected
   */

	}, {
		key: 'handleChildrenCaptured_',
		value: function handleChildrenCaptured_(tree) {
			var _componentToRender_ = this.componentToRender_,
			    config = _componentToRender_.config,
			    tag = _componentToRender_.tag;

			config.children = this.buildChildren_(tree.config.children);
			this.componentToRender_ = null;
			this.currentPrefix_ = this.prevPrefix_;
			this.prevPrefix_ = null;
			this.renderFromTag_(tag, config);
		}

		/**
   * Handles a child being rendered via `IncrementalDomChildren.render`. Skips
   * component nodes so that they can be rendered the correct way without
   * having to recapture both them and their children via incremental dom.
   * @param {!Object} node
   * @return {boolean}
   * @protected
   */

	}, {
		key: 'handleChildRender_',
		value: function handleChildRender_(node) {
			if (node.tag && _IncrementalDomUtils2.default.isComponentTag(node.tag)) {
				node.config.children = this.buildChildren_(node.config.children);
				this.renderFromTag_(node.tag, node.config);
				return true;
			}
		}

		/**
   * Handles the `stateKeyChanged` event. Overrides original method from
   * `ComponentRenderer` to guarantee that `IncrementalDomRenderer`'s logic
   * will run first.
   * @param {!Object} data
   * @override
   * @protected
   */

	}, {
		key: 'handleComponentRendererStateKeyChanged_',
		value: function handleComponentRendererStateKeyChanged_(data) {
			this.handleStateKeyChanged_(data);
			_get(IncrementalDomRenderer.prototype.__proto__ || Object.getPrototypeOf(IncrementalDomRenderer.prototype), 'handleComponentRendererStateKeyChanged_', this).call(this, data);
		}

		/**
   * Handles an intercepted call to the `elementOpen` function from incremental
   * dom.
   * @param {!function()} originalFn The original function before interception.
   * @param {string} tag
   * @protected
   */

	}, {
		key: 'handleInterceptedOpenCall_',
		value: function handleInterceptedOpenCall_(originalFn, tag) {
			if (_IncrementalDomUtils2.default.isComponentTag(tag)) {
				return this.handleSubComponentCall_.apply(this, arguments);
			} else {
				return this.handleRegularCall_.apply(this, arguments);
			}
		}

		/**
   * Handles an intercepted call to the `elementOpen` function from incremental
   * dom, done for a regular element. Adds any inline listeners found and makes
   * sure that component root elements are always reused.
   * @param {!function()} originalFn The original function before interception.
   * @protected
   */

	}, {
		key: 'handleRegularCall_',
		value: function handleRegularCall_(originalFn) {
			var currComp = IncrementalDomRenderer.getComponentBeingRendered();
			var currRenderer = currComp.getRenderer();

			for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
				args[_key - 1] = arguments[_key];
			}

			if (!currRenderer.rootElementReached_ && currComp.config.key) {
				args[1] = currComp.config.key;
			}

			var node = originalFn.apply(null, args);
			this.attachDecoratedListeners_(node, args);
			this.updateElementIfNotReached_(node);
			return node;
		}

		/**
   * Handles the `stateKeyChanged` event. Stores state properties that have
   * changed since the last render.
   * @param {!Object} data
   * @protected
   */

	}, {
		key: 'handleStateKeyChanged_',
		value: function handleStateKeyChanged_(data) {
			this.changes_[data.key] = data;
		}

		/**
   * Handles an intercepted call to the `elementOpen` function from incremental
   * dom, done for a sub component element. Creates and updates the appropriate
   * sub component.
   * @param {!function()} originalFn The original function before interception.
   * @protected
   */

	}, {
		key: 'handleSubComponentCall_',
		value: function handleSubComponentCall_(originalFn) {
			for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
				args[_key2 - 1] = arguments[_key2];
			}

			var config = _IncrementalDomUtils2.default.buildConfigFromCall(args);
			config.ref = _metal.core.isDefAndNotNull(config.ref) ? config.ref : this.buildRef(args[0]);
			this.componentToRender_ = {
				config: config,
				tag: args[0]
			};

			this.prevPrefix_ = this.currentPrefix_;
			this.currentPrefix_ = config.ref;
			this.generatedRefCount_[this.currentPrefix_] = 0;
			_IncrementalDomChildren2.default.capture(this, this.handleChildrenCaptured_);
		}

		/**
   * Intercepts incremental dom calls from this component.
   * @protected
   */

	}, {
		key: 'intercept_',
		value: function intercept_() {
			_IncrementalDomAop2.default.startInterception({
				attributes: this.handleInterceptedAttributesCall_,
				elementOpen: this.handleInterceptedOpenCall_
			});
		}

		/**
   * Checks if the given object is an incremental dom node.
   * @param {!Object} node
   * @return {boolean}
   */

	}, {
		key: 'getEventFromListenerAttr_',


		/**
   * Returns the event name if the given attribute is a listener (of the form
   * "on<EventName>"), or null if it isn't.
   * @param {string} attr
   * @return {?string}
   * @protected
   */
		value: function getEventFromListenerAttr_(attr) {
			var matches = IncrementalDomRenderer.LISTENER_REGEX.exec(attr);
			var eventName = matches ? matches[1] ? matches[1] : matches[2] : null;
			return eventName ? eventName.toLowerCase() : null;
		}

		/**
   * Gets the component that is this component's parent (that is, the one that
   * actually rendered it), or null if there's no parent.
   * @return {Component}
   */

	}, {
		key: 'getParent',
		value: function getParent() {
			return this.parent_;
		}

		/**
   * Gets the component that is this component's owner (that is, the one that
   * passed its config properties and holds its ref), or null if there's none.
   * @return {Component}
   */

	}, {
		key: 'getOwner',
		value: function getOwner() {
			return this.owner_;
		}

		/**
   * Creates and renders the given function, which can either be a simple
   * incremental dom function or a component constructor.
   * @param {!function()} fnOrCtor Either be a simple incremental dom function
   or a component constructor.
   * @param {Object|Element=} opt_dataOrElement Optional config data for the
   *     function or parent for the rendered content.
   * @param {Element=} opt_element Optional parent for the rendered content.
   * @return {!Component} The rendered component's instance.
   */

	}, {
		key: 'render',


		/**
   * Renders the renderer's component for the first time, patching its element
   * through the incremental dom function calls done by `renderIncDom`.
   */
		value: function render() {
			this.patch();
		}

		/**
   * Renders the given child node via its owner renderer.
   * @param {!Object} child
   */

	}, {
		key: 'renderChild',


		/**
   * Renders the given child node.
   * @param {!Object} child
   */
		value: function renderChild(child) {
			this.intercept_();
			_IncrementalDomChildren2.default.render(child, this.handleChildRender_);
			_IncrementalDomAop2.default.stopInterception();
		}

		/**
   * Renders the contents for the given tag.
   * @param {!function()|string} tag
   * @param {!Object} config
   * @protected
   */

	}, {
		key: 'renderFromTag_',
		value: function renderFromTag_(tag, config) {
			if (_metal.core.isString(tag) || tag.prototype.getRenderer) {
				var comp = this.renderSubComponent_(tag, config);
				this.updateElementIfNotReached_(comp.element);
				return comp.element;
			} else {
				return tag(config);
			}
		}

		/**
   * Calls functions from `IncrementalDOM` to build the component element's
   * content. Can be overriden by subclasses (for integration with template
   * engines for example).
   */

	}, {
		key: 'renderIncDom',
		value: function renderIncDom() {
			if (this.component_.render) {
				this.component_.render();
			} else {
				IncrementalDOM.elementVoid('div');
			}
		}

		/**
   * Runs the incremental dom functions for rendering this component, but
   * doesn't call `patch` yet. Rather, this will be the function that should be
   * called by `patch`.
   */

	}, {
		key: 'renderInsidePatch',
		value: function renderInsidePatch() {
			if (this.component_.wasRendered && !this.shouldUpdate(this.changes_) && IncrementalDOM.currentPointer() === this.component_.element) {
				if (this.component_.element) {
					IncrementalDOM.skipNode();
				}
				return;
			}
			this.renderInsidePatchDontSkip_();
		}

		/**
   * The same as `renderInsidePatch`, but without the check that may skip the
   * render action.
   * @protected
   */

	}, {
		key: 'renderInsidePatchDontSkip_',
		value: function renderInsidePatchDontSkip_() {
			IncrementalDomRenderer.startedRenderingComponent(this.component_);
			this.changes_ = {};
			this.rootElementReached_ = false;
			_IncrementalDomUnusedComponents2.default.schedule(this.childComponents_ || []);
			this.childComponents_ = [];
			this.generatedRefCount_ = {};
			this.listenersToAttach_ = [];
			this.currentPrefix_ = '';
			this.intercept_();
			this.renderIncDom();
			_IncrementalDomAop2.default.stopInterception();
			if (!this.rootElementReached_) {
				this.component_.element = null;
			} else {
				this.component_.addElementClasses();
			}
			this.emit('rendered', !this.isRendered_);
			IncrementalDomRenderer.finishedRenderingComponent();
		}

		/**
   * This updates the sub component that is represented by the given data.
   * The sub component is created, added to its parent and rendered. If it
   * had already been rendered before though, it will only have its state
   * updated instead.
   * @param {string|!function()} tagOrCtor The tag name or constructor function.
   * @param {!Object} config The config object for the sub component.
   * @return {!Component} The updated sub component.
   * @protected
   */

	}, {
		key: 'renderSubComponent_',
		value: function renderSubComponent_(tagOrCtor, config) {
			var comp = this.getSubComponent_(tagOrCtor, config);
			this.updateContext_(comp);
			var renderer = comp.getRenderer();
			if (renderer instanceof IncrementalDomRenderer) {
				var parentComp = IncrementalDomRenderer.getComponentBeingRendered();
				parentComp.getRenderer().childComponents_.push(comp);
				renderer.parent_ = parentComp;
				renderer.owner_ = this.component_;
				renderer.renderInsidePatch();
			} else {
				console.warn('IncrementalDomRenderer doesn\'t support rendering sub components ' + 'that don\'t use IncrementalDomRenderer as well, like:', comp);
			}
			if (!comp.wasRendered) {
				comp.renderAsSubComponent();
			}
			return comp;
		}

		/**
   * Sets the component's config object with its new value.
   * @param {!Component} comp The component to set the config for.
   * @param {!Object} config
   * @protected
   */

	}, {
		key: 'setConfig_',
		value: function setConfig_(comp, config) {
			var prevConfig = comp.config;
			comp.config = config;
			if (_metal.core.isFunction(comp.configChanged)) {
				comp.configChanged(config, prevConfig || {});
			}
			comp.emit('configChanged', {
				prevVal: prevConfig,
				newVal: config
			});
		}

		/**
   * Checks if the component should be updated with the current state changes.
   * Can be overridden by subclasses or implemented by components to provide
   * customized behavior (only updating when a state property used by the
   * template changes, for example).
   * @param {!Object} changes
   * @return {boolean}
   */

	}, {
		key: 'shouldUpdate',
		value: function shouldUpdate(changes) {
			if (this.component_.shouldUpdate) {
				return this.component_.shouldUpdate(changes);
			}
			return true;
		}

		/**
   * Stores the component that has just started being rendered.
   * @param {!Component} comp
   */

	}, {
		key: 'patch',


		/**
   * Patches the component's element with the incremental dom function calls
   * done by `renderIncDom`.
   */
		value: function patch() {
			if (!this.component_.element && this.parent_) {
				// If the component has no content but was rendered from another component,
				// we'll need to patch this parent to make sure that any new content will
				// be added in the right place.
				this.parent_.getRenderer().patch();
				return;
			}

			var tempParent = this.guaranteeParent_();
			if (tempParent) {
				IncrementalDOM.patch(tempParent, this.renderInsidePatchDontSkip_);
				_metalDom2.default.exitDocument(this.component_.element);
				if (this.component_.element && this.component_.inDocument) {
					this.component_.renderElement_(this.attachData_.parent, this.attachData_.sibling);
				}
			} else {
				var element = this.component_.element;
				IncrementalDOM.patchOuter(element, this.renderInsidePatchDontSkip_);
				if (!this.component_.element) {
					_metalDom2.default.exitDocument(element);
				}
			}
		}

		/**
   * Updates the renderer's component when state changes, patching its element
   * through the incremental dom function calls done by `renderIncDom`. Makes
   * sure that it won't cause a rerender if the only change was for the
   * "element" property.
   */

	}, {
		key: 'update',
		value: function update() {
			if (this.hasChangedBesidesElement_(this.changes_) && this.shouldUpdate(this.changes_)) {
				this.patch();
			}
		}

		/**
   * Updates this renderer's component's element with the given values, unless
   * it has already been reached by an earlier call.
   * @param {!Element} node
   * @protected
   */

	}, {
		key: 'updateElementIfNotReached_',
		value: function updateElementIfNotReached_(node) {
			var currComp = IncrementalDomRenderer.getComponentBeingRendered();
			var currRenderer = currComp.getRenderer();
			if (!currRenderer.rootElementReached_) {
				currRenderer.rootElementReached_ = true;
				if (currComp.element !== node) {
					currComp.element = node;
				}
			}
		}

		/**
   * Updates the given component's context according to the data from the
   * component that is currently being rendered.
   * @param {!Component} comp
   * @protected
   */

	}, {
		key: 'updateContext_',
		value: function updateContext_(comp) {
			var context = comp.context;
			var parent = IncrementalDomRenderer.getComponentBeingRendered();
			var childContext = parent.getChildContext ? parent.getChildContext() : {};
			_metal.object.mixin(context, parent.context, childContext);
			comp.context = context;
		}
	}], [{
		key: 'getComponentBeingRendered',
		value: function getComponentBeingRendered() {
			return renderingComponents_[renderingComponents_.length - 1];
		}
	}, {
		key: 'finishedRenderingComponent',
		value: function finishedRenderingComponent() {
			renderingComponents_.pop();
			if (renderingComponents_.length === 0) {
				_IncrementalDomUnusedComponents2.default.disposeUnused();
			}
		}
	}, {
		key: 'isIncDomNode',
		value: function isIncDomNode(node) {
			return !!node[_IncrementalDomChildren2.default.CHILD_OWNER];
		}
	}, {
		key: 'render',
		value: function render(fnOrCtor, opt_dataOrElement, opt_parent) {
			if (!_metalComponent.Component.isComponentCtor(fnOrCtor)) {
				var fn = fnOrCtor;

				var TempComponent = function (_Component) {
					_inherits(TempComponent, _Component);

					function TempComponent() {
						_classCallCheck(this, TempComponent);

						return _possibleConstructorReturn(this, (TempComponent.__proto__ || Object.getPrototypeOf(TempComponent)).apply(this, arguments));
					}

					_createClass(TempComponent, [{
						key: 'created',
						value: function created() {
							if (IncrementalDomRenderer.getComponentBeingRendered()) {
								this.getRenderer().updateContext_(this);
							}
						}
					}, {
						key: 'render',
						value: function render() {
							fn(this.config);
						}
					}]);

					return TempComponent;
				}(_metalComponent.Component);

				TempComponent.RENDERER = IncrementalDomRenderer;
				fnOrCtor = TempComponent;
			}
			return _metalComponent.Component.render(fnOrCtor, opt_dataOrElement, opt_parent);
		}
	}, {
		key: 'renderChild',
		value: function renderChild(child) {
			child[_IncrementalDomChildren2.default.CHILD_OWNER].renderChild(child);
		}
	}, {
		key: 'startedRenderingComponent',
		value: function startedRenderingComponent(comp) {
			renderingComponents_.push(comp);
		}
	}]);

	return IncrementalDomRenderer;
}(_metalComponent.ComponentRenderer);

var renderingComponents_ = [];
var emptyChildren_ = [];

IncrementalDomRenderer.LISTENER_REGEX = /^(?:on([A-Z]\w+))|(?:data-on(\w+))$/;

exports.default = IncrementalDomRenderer;
},{"./IncrementalDomAop":21,"./children/IncrementalDomChildren":23,"./cleanup/IncrementalDomUnusedComponents":24,"./incremental-dom":25,"./utils/IncrementalDomUtils":26,"metal":39,"metal-component":30,"metal-dom":9}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _metal = require('metal');

var _metal2 = _interopRequireDefault(_metal);

var _IncrementalDomAop = require('../IncrementalDomAop');

var _IncrementalDomAop2 = _interopRequireDefault(_IncrementalDomAop);

var _IncrementalDomUtils = require('../utils/IncrementalDomUtils');

var _IncrementalDomUtils2 = _interopRequireDefault(_IncrementalDomUtils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Provides helpers for capturing children elements from incremental dom calls,
 * as well as actually rendering those captured children via incremental dom
 * later.
 */
var IncrementalDomChildren = function () {
	function IncrementalDomChildren() {
		_classCallCheck(this, IncrementalDomChildren);
	}

	_createClass(IncrementalDomChildren, null, [{
		key: 'capture',

		/**
   * Captures all child elements from incremental dom calls.
   * @param {!IncrementalDomRenderer} renderer The renderer that is capturing
   *   children.
   * @param {!function} callback Function to be called when children have all
   *     been captured.
  	 */
		value: function capture(renderer, callback) {
			renderer_ = renderer;
			callback_ = callback;
			tree_ = {
				config: {
					children: []
				}
			};
			currentParent_ = tree_;
			isCapturing_ = true;
			_IncrementalDomAop2.default.startInterception({
				elementClose: handleInterceptedCloseCall_,
				elementOpen: handleInterceptedOpenCall_,
				text: handleInterceptedTextCall_
			});
		}

		/**
   * Renders a children tree through incremental dom.
   * @param {!{args: Array, !children: Array, isText: ?boolean}}
   * @param {function()=} opt_skipNode Optional function that is called for
   *     each node to be rendered. If it returns true, the node will be skipped.
   * @protected
   */

	}, {
		key: 'render',
		value: function render(tree, opt_skipNode) {
			if (isCapturing_) {
				// If capturing, just add the node directly to the captured tree.
				addChildToTree(tree);
				return;
			}

			if (opt_skipNode && opt_skipNode(tree)) {
				return;
			}

			if (_metal2.default.isDef(tree.text)) {
				var args = tree.args ? tree.args : [];
				args[0] = tree.text;
				IncrementalDOM.text.apply(null, args);
			} else {
				var _args = _IncrementalDomUtils2.default.buildCallFromConfig(tree.tag, tree.config);
				IncrementalDOM.elementOpen.apply(null, _args);
				if (tree.config.children) {
					for (var i = 0; i < tree.config.children.length; i++) {
						IncrementalDomChildren.render(tree.config.children[i], opt_skipNode);
					}
				}
				IncrementalDOM.elementClose(tree.tag);
			}
		}
	}]);

	return IncrementalDomChildren;
}();

var callback_;
var currentParent_;
var isCapturing_ = false;
var renderer_;
var tree_;

/**
 * Adds a child element to the tree.
 * @param {!Array} args The arguments passed to the incremental dom call.
 * @param {boolean=} opt_isText Optional flag indicating if the child is a
 *     text element.
 * @protected
 */
function addChildCallToTree_(args, opt_isText) {
	var child = _defineProperty({
		parent: currentParent_
	}, IncrementalDomChildren.CHILD_OWNER, renderer_);

	if (opt_isText) {
		child.text = args[0];
		if (args.length > 1) {
			child.args = args;
		}
	} else {
		child.tag = args[0];
		child.config = _IncrementalDomUtils2.default.buildConfigFromCall(args);
		if (_IncrementalDomUtils2.default.isComponentTag(child.tag)) {
			child.config.ref = _metal2.default.isDefAndNotNull(child.config.ref) ? child.config.ref : renderer_.buildRef(args[0]);
		}
		child.config.children = [];
	}

	addChildToTree(child);
	return child;
}

function addChildToTree(child) {
	currentParent_.config.children.push(child);
}

/**
 * Handles an intercepted call to the `elementClose` function from incremental
 * dom.
 * @protected
 */
function handleInterceptedCloseCall_() {
	if (currentParent_ === tree_) {
		_IncrementalDomAop2.default.stopInterception();
		isCapturing_ = false;
		callback_(tree_);
		callback_ = null;
		currentParent_ = null;
		renderer_ = null;
		tree_ = null;
	} else {
		currentParent_ = currentParent_.parent;
	}
}

/**
 * Handles an intercepted call to the `elementOpen` function from incremental
 * dom.
 * @param {!function()} originalFn The original function before interception.
 * @protected
 */
function handleInterceptedOpenCall_(originalFn) {
	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		args[_key - 1] = arguments[_key];
	}

	currentParent_ = addChildCallToTree_(args);
}

/**
 * Handles an intercepted call to the `text` function from incremental dom.
 * @param {!function()} originalFn The original function before interception.
 * @protected
 */
function handleInterceptedTextCall_(originalFn) {
	for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
		args[_key2 - 1] = arguments[_key2];
	}

	addChildCallToTree_(args, true);
}

/**
 * Property identifying a specific object as a Metal.js child node, and
 * pointing to the renderer instance that created it.
 * @type {string}
 * @static
 */
IncrementalDomChildren.CHILD_OWNER = '__metalChildOwner';

exports.default = IncrementalDomChildren;
},{"../IncrementalDomAop":21,"../utils/IncrementalDomUtils":26,"metal":39}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var comps_ = [];

var IncrementalDomUnusedComponents = function () {
	function IncrementalDomUnusedComponents() {
		_classCallCheck(this, IncrementalDomUnusedComponents);
	}

	_createClass(IncrementalDomUnusedComponents, null, [{
		key: 'disposeUnused',

		/**
   * Disposes all sub components that were not rerendered since the last
   * time this function was scheduled.
   */
		value: function disposeUnused() {
			for (var i = 0; i < comps_.length; i++) {
				if (!comps_[i].isDisposed()) {
					var renderer = comps_[i].getRenderer();
					if (!renderer.getParent()) {
						// Don't let disposing cause the element to be removed, since it may
						// be currently being reused by another component.
						comps_[i].element = null;

						var ref = comps_[i].config.ref;
						var owner = renderer.getOwner();
						if (owner.components[ref] === comps_[i]) {
							owner.disposeSubComponents([ref]);
						} else {
							comps_[i].dispose();
						}
					}
				}
			}
			comps_ = [];
		}

		/**
   * Schedules the given components to be checked and disposed if not used
   * anymore, when `IncrementalDomUnusedComponents.disposeUnused` is called.
   * @param {!Array<!Component} comps
   */

	}, {
		key: 'schedule',
		value: function schedule(comps) {
			for (var i = 0; i < comps.length; i++) {
				comps[i].getRenderer().parent_ = null;
				comps_.push(comps[i]);
			}
		}
	}]);

	return IncrementalDomUnusedComponents;
}();

exports.default = IncrementalDomUnusedComponents;
},{}],25:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* jshint ignore:start */

/**
 * @license
 * Copyright 2015 The Incremental DOM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function (global, factory) {
  factory(global.IncrementalDOM = global.IncrementalDOM || {});
})(window, function (exports) {
  'use strict';

  /**
   * Copyright 2015 The Incremental DOM Authors. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS-IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * A cached reference to the hasOwnProperty function.
   */

  var hasOwnProperty = Object.prototype.hasOwnProperty;

  /**
   * A constructor function that will create blank objects.
   * @constructor
   */
  function Blank() {}

  Blank.prototype = Object.create(null);

  /**
   * Used to prevent property collisions between our "map" and its prototype.
   * @param {!Object<string, *>} map The map to check.
   * @param {string} property The property to check.
   * @return {boolean} Whether map has property.
   */
  var has = function has(map, property) {
    return hasOwnProperty.call(map, property);
  };

  /**
   * Creates an map object without a prototype.
   * @return {!Object}
   */
  var createMap = function createMap() {
    return new Blank();
  };

  /**
   * The property name where we store Incremental DOM data.
   */
  var DATA_PROP = '__incrementalDOMData';

  /**
   * Keeps track of information needed to perform diffs for a given DOM node.
   * @param {!string} nodeName
   * @param {?string=} key
   * @constructor
   */
  function NodeData(nodeName, key) {
    /**
     * The attributes and their values.
     * @const {!Object<string, *>}
     */
    this.attrs = createMap();

    /**
     * An array of attribute name/value pairs, used for quickly diffing the
     * incomming attributes to see if the DOM node's attributes need to be
     * updated.
     * @const {Array<*>}
     */
    this.attrsArr = [];

    /**
     * The incoming attributes for this Node, before they are updated.
     * @const {!Object<string, *>}
     */
    this.newAttrs = createMap();

    /**
     * Whether or not the statics have been applied for the node yet.
     * {boolean}
     */
    this.staticsApplied = false;

    /**
     * The key used to identify this node, used to preserve DOM nodes when they
     * move within their parent.
     * @const
     */
    this.key = key;

    /**
     * Keeps track of children within this node by their key.
     * {!Object<string, !Element>}
     */
    this.keyMap = createMap();

    /**
     * Whether or not the keyMap is currently valid.
     * @type {boolean}
     */
    this.keyMapValid = true;

    /**
     * Whether or the associated node is, or contains, a focused Element.
     * @type {boolean}
     */
    this.focused = false;

    /**
     * The node name for this node.
     * @const {string}
     */
    this.nodeName = nodeName;

    /**
     * @type {?string}
     */
    this.text = null;
  }

  /**
   * Initializes a NodeData object for a Node.
   *
   * @param {Node} node The node to initialize data for.
   * @param {string} nodeName The node name of node.
   * @param {?string=} key The key that identifies the node.
   * @return {!NodeData} The newly initialized data object
   */
  var initData = function initData(node, nodeName, key) {
    var data = new NodeData(nodeName, key);
    node[DATA_PROP] = data;
    return data;
  };

  /**
   * Retrieves the NodeData object for a Node, creating it if necessary.
   *
   * @param {?Node} node The Node to retrieve the data for.
   * @return {!NodeData} The NodeData for this Node.
   */
  var getData = function getData(node) {
    importNode(node);
    return node[DATA_PROP];
  };

  /**
   * Imports node and its subtree, initializing caches.
   *
   * @param {?Node} node The Node to import.
   */
  var importNode = function importNode(node) {
    if (node[DATA_PROP]) {
      return;
    }

    var nodeName = node.nodeName.toLowerCase();
    var isElement = node instanceof Element;
    var key = isElement ? node.getAttribute('key') : null;
    var data = initData(node, nodeName, key);

    if (key) {
      getData(node.parentNode).keyMap[key] = node;
    }

    if (isElement) {
      var attributes = node.attributes;
      var attrs = data.attrs;
      var newAttrs = data.newAttrs;
      var attrsArr = data.attrsArr;

      for (var i = 0; i < attributes.length; i += 1) {
        var attr = attributes[i];
        var name = attr.name;
        var value = attr.value;

        attrs[name] = value;
        newAttrs[name] = undefined;
        attrsArr.push(name);
        attrsArr.push(value);
      }
    }

    for (var child = node.firstChild; child; child = child.nextSibling) {
      importNode(child);
    }
  };

  /**
   * Gets the namespace to create an element (of a given tag) in.
   * @param {string} tag The tag to get the namespace for.
   * @param {?Node} parent
   * @return {?string} The namespace to create the tag in.
   */
  var getNamespaceForTag = function getNamespaceForTag(tag, parent) {
    if (tag === 'svg') {
      return 'http://www.w3.org/2000/svg';
    }

    if (getData(parent).nodeName === 'foreignObject') {
      return null;
    }

    return parent.namespaceURI;
  };

  /**
   * Creates an Element.
   * @param {Document} doc The document with which to create the Element.
   * @param {?Node} parent
   * @param {string} tag The tag for the Element.
   * @param {?string=} key A key to identify the Element.
   * @return {!Element}
   */
  var createElement = function createElement(doc, parent, tag, key) {
    var namespace = getNamespaceForTag(tag, parent);
    var el = undefined;

    if (namespace) {
      el = doc.createElementNS(namespace, tag);
    } else {
      el = doc.createElement(tag);
    }

    initData(el, tag, key);

    return el;
  };

  /**
   * Creates a Text Node.
   * @param {Document} doc The document with which to create the Element.
   * @return {!Text}
   */
  var createText = function createText(doc) {
    var node = doc.createTextNode('');
    initData(node, '#text', null);
    return node;
  };

  /**
   * Copyright 2015 The Incremental DOM Authors. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS-IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /** @const */
  var notifications = {
    /**
     * Called after patch has compleated with any Nodes that have been created
     * and added to the DOM.
     * @type {?function(Array<!Node>)}
     */
    nodesCreated: null,

    /**
     * Called after patch has compleated with any Nodes that have been removed
     * from the DOM.
     * Note it's an applications responsibility to handle any childNodes.
     * @type {?function(Array<!Node>)}
     */
    nodesDeleted: null
  };

  /**
   * Keeps track of the state of a patch.
   * @constructor
   */
  function Context() {
    /**
     * @type {(Array<!Node>|undefined)}
     */
    this.created = notifications.nodesCreated && [];

    /**
     * @type {(Array<!Node>|undefined)}
     */
    this.deleted = notifications.nodesDeleted && [];
  }

  /**
   * @param {!Node} node
   */
  Context.prototype.markCreated = function (node) {
    if (this.created) {
      this.created.push(node);
    }
  };

  /**
   * @param {!Node} node
   */
  Context.prototype.markDeleted = function (node) {
    if (this.deleted) {
      this.deleted.push(node);
    }
  };

  /**
   * Notifies about nodes that were created during the patch opearation.
   */
  Context.prototype.notifyChanges = function () {
    if (this.created && this.created.length > 0) {
      notifications.nodesCreated(this.created);
    }

    if (this.deleted && this.deleted.length > 0) {
      notifications.nodesDeleted(this.deleted);
    }
  };

  /**
   * Copyright 2016 The Incremental DOM Authors. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS-IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * @param {!Node} node
   * @return {boolean} True if the node the root of a document, false otherwise.
   */
  var isDocumentRoot = function isDocumentRoot(node) {
    // For ShadowRoots, check if they are a DocumentFragment instead of if they
    // are a ShadowRoot so that this can work in 'use strict' if ShadowRoots are
    // not supported.
    return node instanceof Document || node instanceof DocumentFragment;
  };

  /**
   * @param {!Node} node The node to start at, inclusive.
   * @param {?Node} root The root ancestor to get until, exclusive.
   * @return {!Array<!Node>} The ancestry of DOM nodes.
   */
  var getAncestry = function getAncestry(node, root) {
    var ancestry = [];
    var cur = node;

    while (cur !== root) {
      ancestry.push(cur);
      cur = cur.parentNode;
    }

    return ancestry;
  };

  /**
   * @param {!Node} node
   * @return {!Node} The root node of the DOM tree that contains node.
   */
  var getRoot = function getRoot(node) {
    var cur = node;
    var prev = cur;

    while (cur) {
      prev = cur;
      cur = cur.parentNode;
    }

    return prev;
  };

  /**
   * @param {!Node} node The node to get the activeElement for.
   * @return {?Element} The activeElement in the Document or ShadowRoot
   *     corresponding to node, if present.
   */
  var getActiveElement = function getActiveElement(node) {
    var root = getRoot(node);
    return isDocumentRoot(root) ? root.activeElement : null;
  };

  /**
   * Gets the path of nodes that contain the focused node in the same document as
   * a reference node, up until the root.
   * @param {!Node} node The reference node to get the activeElement for.
   * @param {?Node} root The root to get the focused path until.
   * @return {!Array<Node>}
   */
  var getFocusedPath = function getFocusedPath(node, root) {
    var activeElement = getActiveElement(node);

    if (!activeElement || !node.contains(activeElement)) {
      return [];
    }

    return getAncestry(activeElement, root);
  };

  /**
   * Like insertBefore, but instead instead of moving the desired node, instead
   * moves all the other nodes after.
   * @param {?Node} parentNode
   * @param {!Node} node
   * @param {?Node} referenceNode
   */
  var moveBefore = function moveBefore(parentNode, node, referenceNode) {
    var insertReferenceNode = node.nextSibling;
    var cur = referenceNode;

    while (cur !== node) {
      var next = cur.nextSibling;
      parentNode.insertBefore(cur, insertReferenceNode);
      cur = next;
    }
  };

  /** @type {?Context} */
  var context = null;

  /** @type {?Node} */
  var currentNode = null;

  /** @type {?Node} */
  var currentParent = null;

  /** @type {?Document} */
  var doc = null;

  /**
   * @param {!Array<Node>} focusPath The nodes to mark.
   * @param {boolean} focused Whether or not they are focused.
   */
  var markFocused = function markFocused(focusPath, focused) {
    for (var i = 0; i < focusPath.length; i += 1) {
      getData(focusPath[i]).focused = focused;
    }
  };

  /**
   * Returns a patcher function that sets up and restores a patch context,
   * running the run function with the provided data.
   * @param {function((!Element|!DocumentFragment),!function(T),T=): ?Node} run
   * @return {function((!Element|!DocumentFragment),!function(T),T=): ?Node}
   * @template T
   */
  var patchFactory = function patchFactory(run) {
    /**
     * TODO(moz): These annotations won't be necessary once we switch to Closure
     * Compiler's new type inference. Remove these once the switch is done.
     *
     * @param {(!Element|!DocumentFragment)} node
     * @param {!function(T)} fn
     * @param {T=} data
     * @return {?Node} node
     * @template T
     */
    var f = function f(node, fn, data) {
      var prevContext = context;
      var prevDoc = doc;
      var prevCurrentNode = currentNode;
      var prevCurrentParent = currentParent;
      var previousInAttributes = false;
      var previousInSkip = false;

      context = new Context();
      doc = node.ownerDocument;
      currentParent = node.parentNode;

      if ('production' !== 'production') {}

      var focusPath = getFocusedPath(node, currentParent);
      markFocused(focusPath, true);
      var retVal = run(node, fn, data);
      markFocused(focusPath, false);

      if ('production' !== 'production') {}

      context.notifyChanges();

      context = prevContext;
      doc = prevDoc;
      currentNode = prevCurrentNode;
      currentParent = prevCurrentParent;

      return retVal;
    };
    return f;
  };

  /**
   * Patches the document starting at node with the provided function. This
   * function may be called during an existing patch operation.
   * @param {!Element|!DocumentFragment} node The Element or Document
   *     to patch.
   * @param {!function(T)} fn A function containing elementOpen/elementClose/etc.
   *     calls that describe the DOM.
   * @param {T=} data An argument passed to fn to represent DOM state.
   * @return {!Node} The patched node.
   * @template T
   */
  var patchInner = patchFactory(function (node, fn, data) {
    currentNode = node;

    enterNode();
    fn(data);
    exitNode();

    if ('production' !== 'production') {}

    return node;
  });

  /**
   * Patches an Element with the the provided function. Exactly one top level
   * element call should be made corresponding to `node`.
   * @param {!Element} node The Element where the patch should start.
   * @param {!function(T)} fn A function containing elementOpen/elementClose/etc.
   *     calls that describe the DOM. This should have at most one top level
   *     element call.
   * @param {T=} data An argument passed to fn to represent DOM state.
   * @return {?Node} The node if it was updated, its replacedment or null if it
   *     was removed.
   * @template T
   */
  var patchOuter = patchFactory(function (node, fn, data) {
    var startNode = /** @type {!Element} */{ nextSibling: node };
    var expectedNextNode = null;
    var expectedPrevNode = null;

    if ('production' !== 'production') {}

    currentNode = startNode;
    fn(data);

    if ('production' !== 'production') {}

    if (node !== currentNode) {
      removeChild(currentParent, node, getData(currentParent).keyMap);
    }

    return startNode === currentNode ? null : currentNode;
  });

  /**
   * Checks whether or not the current node matches the specified nodeName and
   * key.
   *
   * @param {!Node} matchNode A node to match the data to.
   * @param {?string} nodeName The nodeName for this node.
   * @param {?string=} key An optional key that identifies a node.
   * @return {boolean} True if the node matches, false otherwise.
   */
  var matches = function matches(matchNode, nodeName, key) {
    var data = getData(matchNode);

    // Key check is done using double equals as we want to treat a null key the
    // same as undefined. This should be okay as the only values allowed are
    // strings, null and undefined so the == semantics are not too weird.
    return nodeName === data.nodeName && key == data.key;
  };

  /**
   * Aligns the virtual Element definition with the actual DOM, moving the
   * corresponding DOM node to the correct location or creating it if necessary.
   * @param {string} nodeName For an Element, this should be a valid tag string.
   *     For a Text, this should be #text.
   * @param {?string=} key The key used to identify this element.
   */
  var alignWithDOM = function alignWithDOM(nodeName, key) {
    if (currentNode && matches(currentNode, nodeName, key)) {
      return;
    }

    var parentData = getData(currentParent);
    var currentNodeData = currentNode && getData(currentNode);
    var keyMap = parentData.keyMap;
    var node = undefined;

    // Check to see if the node has moved within the parent.
    if (key) {
      var keyNode = keyMap[key];
      if (keyNode) {
        if (matches(keyNode, nodeName, key)) {
          node = keyNode;
        } else if (keyNode === currentNode) {
          context.markDeleted(keyNode);
        } else {
          removeChild(currentParent, keyNode, keyMap);
        }
      }
    }

    // Create the node if it doesn't exist.
    if (!node) {
      if (nodeName === '#text') {
        node = createText(doc);
      } else {
        node = createElement(doc, currentParent, nodeName, key);
      }

      if (key) {
        keyMap[key] = node;
      }

      context.markCreated(node);
    }

    // Re-order the node into the right position, preserving focus if either
    // node or currentNode are focused by making sure that they are not detached
    // from the DOM.
    if (getData(node).focused) {
      // Move everything else before the node.
      moveBefore(currentParent, node, currentNode);
    } else if (currentNodeData && currentNodeData.key && !currentNodeData.focused) {
      // Remove the currentNode, which can always be added back since we hold a
      // reference through the keyMap. This prevents a large number of moves when
      // a keyed item is removed or moved backwards in the DOM.
      currentParent.replaceChild(node, currentNode);
      parentData.keyMapValid = false;
    } else {
      currentParent.insertBefore(node, currentNode);
    }

    currentNode = node;
  };

  /**
   * @param {?Node} node
   * @param {?Node} child
   * @param {?Object<string, !Element>} keyMap
   */
  var removeChild = function removeChild(node, child, keyMap) {
    node.removeChild(child);
    context.markDeleted( /** @type {!Node}*/child);

    var key = getData(child).key;
    if (key) {
      delete keyMap[key];
    }
  };

  /**
   * Clears out any unvisited Nodes, as the corresponding virtual element
   * functions were never called for them.
   */
  var clearUnvisitedDOM = function clearUnvisitedDOM() {
    var node = currentParent;
    var data = getData(node);
    var keyMap = data.keyMap;
    var keyMapValid = data.keyMapValid;
    var child = node.lastChild;
    var key = undefined;

    if (child === currentNode && keyMapValid) {
      return;
    }

    while (child !== currentNode) {
      removeChild(node, child, keyMap);
      child = node.lastChild;
    }

    // Clean the keyMap, removing any unusued keys.
    if (!keyMapValid) {
      for (key in keyMap) {
        child = keyMap[key];
        if (child.parentNode !== node) {
          context.markDeleted(child);
          delete keyMap[key];
        }
      }

      data.keyMapValid = true;
    }
  };

  /**
   * Changes to the first child of the current node.
   */
  var enterNode = function enterNode() {
    currentParent = currentNode;
    currentNode = null;
  };

  /**
   * @return {?Node} The next Node to be patched.
   */
  var getNextNode = function getNextNode() {
    if (currentNode) {
      return currentNode.nextSibling;
    } else {
      return currentParent.firstChild;
    }
  };

  /**
   * Changes to the next sibling of the current node.
   */
  var nextNode = function nextNode() {
    currentNode = getNextNode();
  };

  /**
   * Changes to the parent of the current node, removing any unvisited children.
   */
  var exitNode = function exitNode() {
    clearUnvisitedDOM();

    currentNode = currentParent;
    currentParent = currentParent.parentNode;
  };

  /**
   * Makes sure that the current node is an Element with a matching tagName and
   * key.
   *
   * @param {string} tag The element's tag.
   * @param {?string=} key The key used to identify this element. This can be an
   *     empty string, but performance may be better if a unique value is used
   *     when iterating over an array of items.
   * @return {!Element} The corresponding Element.
   */
  var coreElementOpen = function coreElementOpen(tag, key) {
    nextNode();
    alignWithDOM(tag, key);
    enterNode();
    return (/** @type {!Element} */currentParent
    );
  };

  /**
   * Closes the currently open Element, removing any unvisited children if
   * necessary.
   *
   * @return {!Element} The corresponding Element.
   */
  var coreElementClose = function coreElementClose() {
    if ('production' !== 'production') {}

    exitNode();
    return (/** @type {!Element} */currentNode
    );
  };

  /**
   * Makes sure the current node is a Text node and creates a Text node if it is
   * not.
   *
   * @return {!Text} The corresponding Text Node.
   */
  var coreText = function coreText() {
    nextNode();
    alignWithDOM('#text', null);
    return (/** @type {!Text} */currentNode
    );
  };

  /**
   * Gets the current Element being patched.
   * @return {!Element}
   */
  var currentElement = function currentElement() {
    if ('production' !== 'production') {}
    return (/** @type {!Element} */currentParent
    );
  };

  /**
   * @return {Node} The Node that will be evaluated for the next instruction.
   */
  var currentPointer = function currentPointer() {
    if ('production' !== 'production') {}
    return getNextNode();
  };

  /**
   * Skips the children in a subtree, allowing an Element to be closed without
   * clearing out the children.
   */
  var skip = function skip() {
    if ('production' !== 'production') {}
    currentNode = currentParent.lastChild;
  };

  /**
   * Skips the next Node to be patched, moving the pointer forward to the next
   * sibling of the current pointer.
   */
  var skipNode = nextNode;

  /**
   * Copyright 2015 The Incremental DOM Authors. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS-IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /** @const */
  var symbols = {
    default: '__default'
  };

  /**
   * @param {string} name
   * @return {string|undefined} The namespace to use for the attribute.
   */
  var getNamespace = function getNamespace(name) {
    if (name.lastIndexOf('xml:', 0) === 0) {
      return 'http://www.w3.org/XML/1998/namespace';
    }

    if (name.lastIndexOf('xlink:', 0) === 0) {
      return 'http://www.w3.org/1999/xlink';
    }
  };

  /**
   * Applies an attribute or property to a given Element. If the value is null
   * or undefined, it is removed from the Element. Otherwise, the value is set
   * as an attribute.
   * @param {!Element} el
   * @param {string} name The attribute's name.
   * @param {?(boolean|number|string)=} value The attribute's value.
   */
  var applyAttr = function applyAttr(el, name, value) {
    if (value == null) {
      el.removeAttribute(name);
    } else {
      var attrNS = getNamespace(name);
      if (attrNS) {
        el.setAttributeNS(attrNS, name, value);
      } else {
        el.setAttribute(name, value);
      }
    }
  };

  /**
   * Applies a property to a given Element.
   * @param {!Element} el
   * @param {string} name The property's name.
   * @param {*} value The property's value.
   */
  var applyProp = function applyProp(el, name, value) {
    el[name] = value;
  };

  /**
   * Applies a value to a style declaration. Supports CSS custom properties by
   * setting properties containing a dash using CSSStyleDeclaration.setProperty.
   * @param {CSSStyleDeclaration} style
   * @param {!string} prop
   * @param {*} value
   */
  var setStyleValue = function setStyleValue(style, prop, value) {
    if (prop.indexOf('-') >= 0) {
      style.setProperty(prop, /** @type {string} */value);
    } else {
      style[prop] = value;
    }
  };

  /**
   * Applies a style to an Element. No vendor prefix expansion is done for
   * property names/values.
   * @param {!Element} el
   * @param {string} name The attribute's name.
   * @param {*} style The style to set. Either a string of css or an object
   *     containing property-value pairs.
   */
  var applyStyle = function applyStyle(el, name, style) {
    if (typeof style === 'string') {
      el.style.cssText = style;
    } else {
      el.style.cssText = '';
      var elStyle = el.style;
      var obj = /** @type {!Object<string,string>} */style;

      for (var prop in obj) {
        if (has(obj, prop)) {
          setStyleValue(elStyle, prop, obj[prop]);
        }
      }
    }
  };

  /**
   * Updates a single attribute on an Element.
   * @param {!Element} el
   * @param {string} name The attribute's name.
   * @param {*} value The attribute's value. If the value is an object or
   *     function it is set on the Element, otherwise, it is set as an HTML
   *     attribute.
   */
  var applyAttributeTyped = function applyAttributeTyped(el, name, value) {
    var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);

    if (type === 'object' || type === 'function') {
      applyProp(el, name, value);
    } else {
      applyAttr(el, name, /** @type {?(boolean|number|string)} */value);
    }
  };

  /**
   * Calls the appropriate attribute mutator for this attribute.
   * @param {!Element} el
   * @param {string} name The attribute's name.
   * @param {*} value The attribute's value.
   */
  var updateAttribute = function updateAttribute(el, name, value) {
    var data = getData(el);
    var attrs = data.attrs;

    if (attrs[name] === value) {
      return;
    }

    var mutator = attributes[name] || attributes[symbols.default];
    mutator(el, name, value);

    attrs[name] = value;
  };

  /**
   * A publicly mutable object to provide custom mutators for attributes.
   * @const {!Object<string, function(!Element, string, *)>}
   */
  var attributes = createMap();

  // Special generic mutator that's called for any attribute that does not
  // have a specific mutator.
  attributes[symbols.default] = applyAttributeTyped;

  attributes['style'] = applyStyle;

  /**
   * The offset in the virtual element declaration where the attributes are
   * specified.
   * @const
   */
  var ATTRIBUTES_OFFSET = 3;

  /**
   * Builds an array of arguments for use with elementOpenStart, attr and
   * elementOpenEnd.
   * @const {Array<*>}
   */
  var argsBuilder = [];

  /**
   * @param {string} tag The element's tag.
   * @param {?string=} key The key used to identify this element. This can be an
   *     empty string, but performance may be better if a unique value is used
   *     when iterating over an array of items.
   * @param {?Array<*>=} statics An array of attribute name/value pairs of the
   *     static attributes for the Element. These will only be set once when the
   *     Element is created.
   * @param {...*} var_args, Attribute name/value pairs of the dynamic attributes
   *     for the Element.
   * @return {!Element} The corresponding Element.
   */
  var elementOpen = function elementOpen(tag, key, statics, var_args) {
    if ('production' !== 'production') {}

    var node = coreElementOpen(tag, key);
    var data = getData(node);

    if (!data.staticsApplied) {
      if (statics) {
        for (var _i = 0; _i < statics.length; _i += 2) {
          var name = /** @type {string} */statics[_i];
          var value = statics[_i + 1];
          updateAttribute(node, name, value);
        }
      }
      // Down the road, we may want to keep track of the statics array to use it
      // as an additional signal about whether a node matches or not. For now,
      // just use a marker so that we do not reapply statics.
      data.staticsApplied = true;
    }

    /*
     * Checks to see if one or more attributes have changed for a given Element.
     * When no attributes have changed, this is much faster than checking each
     * individual argument. When attributes have changed, the overhead of this is
     * minimal.
     */
    var attrsArr = data.attrsArr;
    var newAttrs = data.newAttrs;
    var isNew = !attrsArr.length;
    var i = ATTRIBUTES_OFFSET;
    var j = 0;

    for (; i < arguments.length; i += 2, j += 2) {
      var _attr = arguments[i];
      if (isNew) {
        attrsArr[j] = _attr;
        newAttrs[_attr] = undefined;
      } else if (attrsArr[j] !== _attr) {
        break;
      }

      var value = arguments[i + 1];
      if (isNew || attrsArr[j + 1] !== value) {
        attrsArr[j + 1] = value;
        updateAttribute(node, _attr, value);
      }
    }

    if (i < arguments.length || j < attrsArr.length) {
      for (; i < arguments.length; i += 1, j += 1) {
        attrsArr[j] = arguments[i];
      }

      if (j < attrsArr.length) {
        attrsArr.length = j;
      }

      /*
       * Actually perform the attribute update.
       */
      for (i = 0; i < attrsArr.length; i += 2) {
        var name = /** @type {string} */attrsArr[i];
        var value = attrsArr[i + 1];
        newAttrs[name] = value;
      }

      for (var _attr2 in newAttrs) {
        updateAttribute(node, _attr2, newAttrs[_attr2]);
        newAttrs[_attr2] = undefined;
      }
    }

    return node;
  };

  /**
   * Declares a virtual Element at the current location in the document. This
   * corresponds to an opening tag and a elementClose tag is required. This is
   * like elementOpen, but the attributes are defined using the attr function
   * rather than being passed as arguments. Must be folllowed by 0 or more calls
   * to attr, then a call to elementOpenEnd.
   * @param {string} tag The element's tag.
   * @param {?string=} key The key used to identify this element. This can be an
   *     empty string, but performance may be better if a unique value is used
   *     when iterating over an array of items.
   * @param {?Array<*>=} statics An array of attribute name/value pairs of the
   *     static attributes for the Element. These will only be set once when the
   *     Element is created.
   */
  var elementOpenStart = function elementOpenStart(tag, key, statics) {
    if ('production' !== 'production') {}

    argsBuilder[0] = tag;
    argsBuilder[1] = key;
    argsBuilder[2] = statics;
  };

  /***
   * Defines a virtual attribute at this point of the DOM. This is only valid
   * when called between elementOpenStart and elementOpenEnd.
   *
   * @param {string} name
   * @param {*} value
   */
  var attr = function attr(name, value) {
    if ('production' !== 'production') {}

    argsBuilder.push(name);
    argsBuilder.push(value);
  };

  /**
   * Closes an open tag started with elementOpenStart.
   * @return {!Element} The corresponding Element.
   */
  var elementOpenEnd = function elementOpenEnd() {
    if ('production' !== 'production') {}

    var node = elementOpen.apply(null, argsBuilder);
    argsBuilder.length = 0;
    return node;
  };

  /**
   * Closes an open virtual Element.
   *
   * @param {string} tag The element's tag.
   * @return {!Element} The corresponding Element.
   */
  var elementClose = function elementClose(tag) {
    if ('production' !== 'production') {}

    var node = coreElementClose();

    if ('production' !== 'production') {}

    return node;
  };

  /**
   * Declares a virtual Element at the current location in the document that has
   * no children.
   * @param {string} tag The element's tag.
   * @param {?string=} key The key used to identify this element. This can be an
   *     empty string, but performance may be better if a unique value is used
   *     when iterating over an array of items.
   * @param {?Array<*>=} statics An array of attribute name/value pairs of the
   *     static attributes for the Element. These will only be set once when the
   *     Element is created.
   * @param {...*} var_args Attribute name/value pairs of the dynamic attributes
   *     for the Element.
   * @return {!Element} The corresponding Element.
   */
  var elementVoid = function elementVoid(tag, key, statics, var_args) {
    elementOpen.apply(null, arguments);
    return elementClose(tag);
  };

  /**
   * Declares a virtual Text at this point in the document.
   *
   * @param {string|number|boolean} value The value of the Text.
   * @param {...(function((string|number|boolean)):string)} var_args
   *     Functions to format the value which are called only when the value has
   *     changed.
   * @return {!Text} The corresponding text node.
   */
  var text = function text(value, var_args) {
    if ('production' !== 'production') {}

    var node = coreText();
    var data = getData(node);

    if (data.text !== value) {
      data.text = /** @type {string} */value;

      var formatted = value;
      for (var i = 1; i < arguments.length; i += 1) {
        /*
         * Call the formatter function directly to prevent leaking arguments.
         * https://github.com/google/incremental-dom/pull/204#issuecomment-178223574
         */
        var fn = arguments[i];
        formatted = fn(formatted);
      }

      node.data = formatted;
    }

    return node;
  };

  exports.patch = patchInner;
  exports.patchInner = patchInner;
  exports.patchOuter = patchOuter;
  exports.currentElement = currentElement;
  exports.currentPointer = currentPointer;
  exports.skip = skip;
  exports.skipNode = skipNode;
  exports.elementVoid = elementVoid;
  exports.elementOpenStart = elementOpenStart;
  exports.elementOpenEnd = elementOpenEnd;
  exports.elementOpen = elementOpen;
  exports.elementClose = elementClose;
  exports.text = text;
  exports.attr = attr;
  exports.symbols = symbols;
  exports.attributes = attributes;
  exports.applyAttr = applyAttr;
  exports.applyProp = applyProp;
  exports.notifications = notifications;
  exports.importNode = importNode;
});

/* jshint ignore:end */
},{}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _metal = require('metal');

var _metal2 = _interopRequireDefault(_metal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Utility functions used to handle incremental dom calls.
 */
var IncrementalDomUtils = function () {
	function IncrementalDomUtils() {
		_classCallCheck(this, IncrementalDomUtils);
	}

	_createClass(IncrementalDomUtils, null, [{
		key: 'buildConfigFromCall',

		/**
   * Builds the component config object from its incremental dom call's
   * arguments.
   * @param {!Array} args
   * @return {!Object}
   */
		value: function buildConfigFromCall(args) {
			var config = {};
			if (args[1]) {
				config.key = args[1];
			}
			var attrsArr = (args[2] || []).concat(args.slice(3));
			for (var i = 0; i < attrsArr.length; i += 2) {
				config[attrsArr[i]] = attrsArr[i + 1];
			}
			return config;
		}

		/**
   * Builds an incremental dom call array from the given tag and config object.
   * @param {string} tag
   * @param {!Object} config
   * @return {!Array}
   */

	}, {
		key: 'buildCallFromConfig',
		value: function buildCallFromConfig(tag, config) {
			var call = [tag, config.key, []];
			var keys = Object.keys(config);
			for (var i = 0; i < keys.length; i++) {
				if (keys[i] !== 'children') {
					call.push(keys[i], config[keys[i]]);
				}
			}
			return call;
		}

		/**
   * Checks if the given tag represents a metal component.
   * @param {string} tag
   * @param {boolean}
   */

	}, {
		key: 'isComponentTag',
		value: function isComponentTag(tag) {
			return !_metal2.default.isString(tag) || tag[0] === tag[0].toUpperCase();
		}
	}]);

	return IncrementalDomUtils;
}();

exports.default = IncrementalDomUtils;
},{"metal":39}],27:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _metal = require('metal');

var _metalDom = require('metal-dom');

var _ComponentRenderer = require('./ComponentRenderer');

var _ComponentRenderer2 = _interopRequireDefault(_ComponentRenderer);

var _metalEvents = require('metal-events');

var _metalState = require('metal-state');

var _metalState2 = _interopRequireDefault(_metalState);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Component collects common behaviors to be followed by UI components, such
 * as Lifecycle, CSS classes management, events encapsulation and support for
 * different types of rendering.
 * Rendering logic can be done by either:
 *     - Listening to the `render` event inside the `created` lifecycle function
 *       and adding the rendering logic to the listener.
 *     - Using an existing implementation of `ComponentRenderer` like `Soy`,
 *       and following its patterns.
 *     - Building your own implementation of a `ComponentRenderer`.
 * Specifying the renderer that will be used can be done by setting the RENDERER
 * static variable to the renderer's constructor function.
 *
 * Example:
 *
 * <code>
 * class CustomComponent extends Component {
 *   constructor(config) {
 *     super(config);
 *   }
 *
 *   created() {
 *   }
 *
 *   rendered() {
 *   }
 *
 *   attached() {
 *   }
 *
 *   detached() {
 *   }
 * }
 *
 * CustomComponent.RENDERER = MyRenderer;
 *
 * CustomComponent.STATE = {
 *   title: { value: 'Title' },
 *   fontSize: { value: '10px' }
 * };
 * </code>
 *
 * @extends {State}
 */
var Component = function (_State) {
	_inherits(Component, _State);

	/**
  * Constructor function for `Component`.
  * @param {Object=} opt_config An object with the initial values for this
  *     component's state.
  * @param {boolean|string|Element=} opt_parentElement The element where the
  *     component should be rendered. Can be given as a selector or an element.
  *     If `false` is passed, the component won't be rendered automatically
  *     after created.
  * @constructor
  */
	function Component(opt_config, opt_parentElement) {
		_classCallCheck(this, Component);

		/**
   * All listeners that were attached until the `DomEventEmitterProxy` instance
   * was created.
   * @type {!Object<string, bool>}
   * @protected
   */
		var _this = _possibleConstructorReturn(this, (Component.__proto__ || Object.getPrototypeOf(Component)).call(this, opt_config));

		_this.attachedListeners_ = {};

		/**
   * Gets all nested components.
   * @type {!Array<!Component>}
   */
		_this.components = {};

		/**
   * Instance of `DomEventEmitterProxy` which proxies events from the component's
   * element to the component itself.
   * @type {DomEventEmitterProxy}
   * @protected
   */
		_this.elementEventProxy_ = null;

		/**
   * The `EventHandler` instance for events attached from the `events` state key.
   * @type {!EventHandler}
   * @protected
   */
		_this.eventsStateKeyHandler_ = new _metalEvents.EventHandler();

		/**
   * Whether the element is in document.
   * @type {boolean}
   */
		_this.inDocument = false;

		/**
   * The initial config option passed to this constructor.
   * @type {!Object}
   * @protected
   */
		_this.initialConfig_ = opt_config || {};

		/**
   * Whether the element was rendered.
   * @type {boolean}
   */
		_this.wasRendered = false;

		/**
   * The component's element will be appended to the element this variable is
   * set to, unless the user specifies another parent when calling `render` or
   * `attach`.
   * @type {!Element}
   */
		_this.DEFAULT_ELEMENT_PARENT = document.body;

		_metal.core.mergeSuperClassesProperty(_this.constructor, 'ELEMENT_CLASSES', _this.mergeElementClasses_);
		_metal.core.mergeSuperClassesProperty(_this.constructor, 'SYNC_UPDATES', _metal.array.firstDefinedValue);

		_this.renderer_ = _this.createRenderer();
		_this.renderer_.on('rendered', _this.rendered.bind(_this));

		_this.on('stateChanged', _this.handleStateChanged_);
		_this.newListenerHandle_ = _this.on('newListener', _this.handleNewListener_);
		_this.on('eventsChanged', _this.onEventsChanged_);
		_this.addListenersFromObj_(_this.events);

		_this.created();
		if (opt_parentElement !== false) {
			_this.render_(opt_parentElement);
		}
		_this.on('elementChanged', _this.onElementChanged_);
		return _this;
	}

	/**
  * Adds the necessary classes to the component's element.
  */


	_createClass(Component, [{
		key: 'addElementClasses',
		value: function addElementClasses() {
			var classesToAdd = this.constructor.ELEMENT_CLASSES_MERGED;
			if (this.elementClasses) {
				classesToAdd = classesToAdd + ' ' + this.elementClasses;
			}
			_metalDom.dom.addClasses(this.element, classesToAdd);
		}

		/**
   * Adds the listeners specified in the given object.
   * @param {Object} events
   * @protected
   */

	}, {
		key: 'addListenersFromObj_',
		value: function addListenersFromObj_(events) {
			var eventNames = Object.keys(events || {});
			for (var i = 0; i < eventNames.length; i++) {
				var info = this.extractListenerInfo_(events[eventNames[i]]);
				if (info.fn) {
					var handler;
					if (info.selector) {
						handler = this.delegate(eventNames[i], info.selector, info.fn);
					} else {
						handler = this.on(eventNames[i], info.fn);
					}
					this.eventsStateKeyHandler_.add(handler);
				}
			}
		}

		/**
   * Invokes the attached Lifecycle. When attached, the component element is
   * appended to the DOM and any other action to be performed must be
   * implemented in this method, such as, binding DOM events. A component can
   * be re-attached multiple times.
   * @param {(string|Element)=} opt_parentElement Optional parent element
   *     to render the component.
   * @param {(string|Element)=} opt_siblingElement Optional sibling element
   *     to render the component before it. Relevant when the component needs
   *     to be rendered before an existing element in the DOM.
   * @protected
   * @chainable
   */

	}, {
		key: 'attach',
		value: function attach(opt_parentElement, opt_siblingElement) {
			if (!this.inDocument) {
				this.renderElement_(opt_parentElement, opt_siblingElement);
				this.inDocument = true;
				this.emit('attached', {
					parent: opt_parentElement,
					sibling: opt_siblingElement
				});
				this.attached();
			}
			return this;
		}

		/**
   * Lifecycle. When attached, the component element is appended to the DOM
   * and any other action to be performed must be implemented in this method,
   * such as, binding DOM events. A component can be re-attached multiple
   * times, therefore the undo behavior for any action performed in this phase
   * must be implemented on the detach phase.
   */

	}, {
		key: 'attached',
		value: function attached() {}

		/**
   * Adds the given sub component, replacing any existing one with the same ref.
   * @param {string} ref
   * @param {!Component} component
   */

	}, {
		key: 'addSubComponent',
		value: function addSubComponent(ref, component) {
			this.components[ref] = component;
		}

		/**
   * Lifecycle. This is called when the component has just been created, before
   * it's rendered.
   */

	}, {
		key: 'created',
		value: function created() {}

		/**
   * Creates the renderer for this component. Sub classes can override this to
   * return a custom renderer as needed.
   * @return {!ComponentRenderer}
   */

	}, {
		key: 'createRenderer',
		value: function createRenderer() {
			_metal.core.mergeSuperClassesProperty(this.constructor, 'RENDERER', _metal.array.firstDefinedValue);
			return new this.constructor.RENDERER_MERGED(this);
		}

		/**
   * Listens to a delegate event on the component's element.
   * @param {string} eventName The name of the event to listen to.
   * @param {string} selector The selector that matches the child elements that
   *   the event should be triggered for.
   * @param {!function(!Object)} callback Function to be called when the event is
   *   triggered. It will receive the normalized event object.
   * @return {!EventHandle} Can be used to remove the listener.
   */

	}, {
		key: 'delegate',
		value: function delegate(eventName, selector, callback) {
			return this.on('delegate:' + eventName + ':' + selector, callback);
		}

		/**
   * Invokes the detached Lifecycle. When detached, the component element is
   * removed from the DOM and any other action to be performed must be
   * implemented in this method, such as, unbinding DOM events. A component
   * can be detached multiple times.
   * @chainable
   */

	}, {
		key: 'detach',
		value: function detach() {
			if (this.inDocument) {
				if (this.element && this.element.parentNode) {
					this.element.parentNode.removeChild(this.element);
				}
				this.inDocument = false;
				this.detached();
			}
			this.emit('detached');
			return this;
		}

		/**
   * Lifecycle. When detached, the component element is removed from the DOM
   * and any other action to be performed must be implemented in this method,
   * such as, unbinding DOM events. A component can be detached multiple
   * times, therefore the undo behavior for any action performed in this phase
   * must be implemented on the attach phase.
   */

	}, {
		key: 'detached',
		value: function detached() {}

		/**
   * Lifecycle. Called when the component is disposed. Should be overridden by
   * sub classes to dispose of any internal data or events.
   */

	}, {
		key: 'disposed',
		value: function disposed() {}

		/**
   * @inheritDoc
   */

	}, {
		key: 'disposeInternal',
		value: function disposeInternal() {
			this.disposed();

			this.detach();

			if (this.elementEventProxy_) {
				this.elementEventProxy_.dispose();
				this.elementEventProxy_ = null;
			}

			this.disposeSubComponents(Object.keys(this.components));
			this.components = null;

			this.renderer_.dispose();
			this.renderer_ = null;

			_get(Component.prototype.__proto__ || Object.getPrototypeOf(Component.prototype), 'disposeInternal', this).call(this);
		}

		/**
   * Calls `dispose` on all subcomponents.
   * @param {!Array<string>} keys
   */

	}, {
		key: 'disposeSubComponents',
		value: function disposeSubComponents(keys) {
			for (var i = 0; i < keys.length; i++) {
				var component = this.components[keys[i]];
				if (component && !component.isDisposed()) {
					component.element = null;
					component.dispose();
					delete this.components[keys[i]];
				}
			}
		}

		/**
   * Extracts listener info from the given value.
   * @param {function()|string|{selector:string,fn:function()|string}} value
   * @return {!{selector:string,fn:function()}}
   * @protected
   */

	}, {
		key: 'extractListenerInfo_',
		value: function extractListenerInfo_(value) {
			var info = {
				fn: value
			};
			if (_metal.core.isObject(value) && !_metal.core.isFunction(value)) {
				info.selector = value.selector;
				info.fn = value.fn;
			}
			if (_metal.core.isString(info.fn)) {
				info.fn = this.getListenerFn(info.fn);
			}
			return info;
		}

		/**
   * Gets the configuration object that was passed to this component's constructor.
   * @return {!Object}
   */

	}, {
		key: 'getInitialConfig',
		value: function getInitialConfig() {
			return this.initialConfig_;
		}

		/**
   * Gets the listener function from its name. If the name is prefixed with a
   * component id, the function will be called on that specified component. Otherwise
   * it will be called on this component instead.
   * @param {string} fnName
   * @return {function()}
   */

	}, {
		key: 'getListenerFn',
		value: function getListenerFn(fnName) {
			if (_metal.core.isFunction(this[fnName])) {
				return this[fnName].bind(this);
			} else {
				console.error('No function named "' + fnName + '" was found in the ' + 'component "' + _metal.core.getFunctionName(this.constructor) + '". Make ' + 'sure that you specify valid function names when adding inline listeners.');
			}
		}

		/**
   * Calls the synchronization function for the state key.
   * @param {string} key
   * @param {Object.<string, Object>=} opt_change Object containing newVal and
   *     prevVal keys.
   * @protected
   */

	}, {
		key: 'fireStateKeyChange_',
		value: function fireStateKeyChange_(key, opt_change) {
			var fn = this['sync' + key.charAt(0).toUpperCase() + key.slice(1)];
			if (_metal.core.isFunction(fn)) {
				if (!opt_change) {
					opt_change = {
						newVal: this[key],
						prevVal: undefined
					};
				}
				fn.call(this, opt_change.newVal, opt_change.prevVal);
			}
		}

		/**
   * Gets the `ComponentRenderer` instance being used.
   * @return {!ComponentRenderer}
   */

	}, {
		key: 'getRenderer',
		value: function getRenderer() {
			return this.renderer_;
		}

		/**
   * Handles state batch changes. Calls any existing `sync` functions that
   * match the changed state keys.
   * @param {Event} event
   * @protected
   */

	}, {
		key: 'handleStateChanged_',
		value: function handleStateChanged_(event) {
			this.syncStateFromChanges_(event.changes);
			this.emit('stateSynced', event);
		}

		/**
   * Handles the `newListener` event. Just flags that this event type has been
   * attached, so we can start proxying it when `DomEventEmitterProxy` is created.
   * @param {string} event
   * @protected
   */

	}, {
		key: 'handleNewListener_',
		value: function handleNewListener_(event) {
			this.attachedListeners_[event] = true;
		}

		/**
   * Checks if the given function is a component constructor.
   * @param {!function()} fn Any function
   * @return {boolean}
   */

	}, {
		key: 'mergeElementClasses_',


		/**
   * Merges an array of values for the ELEMENT_CLASSES property into a single object.
   * @param {!Array.<string>} values The values to be merged.
   * @return {!string} The merged value.
   * @protected
   */
		value: function mergeElementClasses_(values) {
			var marked = {};
			return values.filter(function (val) {
				if (!val || marked[val]) {
					return false;
				} else {
					marked[val] = true;
					return true;
				}
			}).join(' ');
		}

		/**
   * Fired when the `element` state value is changed.
   * @param {!Object} event
   * @protected
   */

	}, {
		key: 'onElementChanged_',
		value: function onElementChanged_(event) {
			if (event.prevVal === event.newVal) {
				// The `elementChanged` event will be fired whenever the element is set,
				// even if its value hasn't actually changed, since that's how State
				// handles objects. We need to check manually here.
				return;
			}

			this.setUpProxy_();
			this.elementEventProxy_.setOriginEmitter(event.newVal);
			if (event.newVal) {
				this.addElementClasses();
				this.syncVisible(this.visible);
			}
		}

		/**
   * Fired when the `events` state value is changed.
   * @param {!Object} event
   * @protected
   */

	}, {
		key: 'onEventsChanged_',
		value: function onEventsChanged_(event) {
			this.eventsStateKeyHandler_.removeAllListeners();
			this.addListenersFromObj_(event.newVal);
		}

		/**
   * Creates and renders a component for the given constructor function. This
   * will always make sure that the constructor runs without rendering the
   * component, having the `render` step happen only after it has finished.
   * @param {!function()} Ctor The component's constructor function.
   * @param {Object|Element=} opt_configOrElement Optional config data or parent
   *     for the component.
   * @param {Element=} opt_element Optional parent for the component.
   * @return {!Component} The rendered component's instance.
   */

	}, {
		key: 'render_',


		/**
   * Lifecycle. Renders the component into the DOM.
   *
   * Render Lifecycle:
   *   render event - The "render" event is emitted. Renderers act on this step.
   *   state synchronization - All synchronization methods are called.
   *   attach - Attach Lifecycle is called.
   *
   * @param {(string|Element|boolean)=} opt_parentElement Optional parent element
   *     to render the component. If set to `false`, the element won't be
   *     attached to any element after rendering. In this case, `attach` should
   *     be called manually later to actually attach it to the dom.
   * @param {boolean=} opt_skipRender Optional flag indicating that the actual
   *     rendering should be skipped. Only the other render lifecycle logic will
   *     be run, like syncing state and attaching the element. Should only
   *     be set if the component has already been rendered, like sub components.
   * @protected
   */
		value: function render_(opt_parentElement, opt_skipRender) {
			if (!opt_skipRender) {
				this.emit('render');
			}
			this.setUpProxy_();
			this.syncState_();
			this.attach(opt_parentElement);
			this.wasRendered = true;
		}

		/**
   * Renders this component as a subcomponent, meaning that no actual rendering is
   * needed since it was already rendered by the parent component. This just handles
   * other logics from the rendering lifecycle, like calling sync methods for the
   * state.
   */

	}, {
		key: 'renderAsSubComponent',
		value: function renderAsSubComponent() {
			this.render_(null, true);
		}

		/**
   * Renders the component element into the DOM.
   * @param {(string|Element)=} opt_parentElement Optional parent element
   *     to render the component.
   * @param {(string|Element)=} opt_siblingElement Optional sibling element
   *     to render the component before it. Relevant when the component needs
   *     to be rendered before an existing element in the DOM, e.g.
   *     `component.attach(null, existingElement)`.
   * @protected
   */

	}, {
		key: 'renderElement_',
		value: function renderElement_(opt_parentElement, opt_siblingElement) {
			var element = this.element;
			if (element && (opt_siblingElement || !element.parentNode)) {
				var parent = _metalDom.dom.toElement(opt_parentElement) || this.DEFAULT_ELEMENT_PARENT;
				parent.insertBefore(element, _metalDom.dom.toElement(opt_siblingElement));
			}
		}

		/**
   * Setter logic for element state key.
   * @param {string|Element} newVal
   * @param {Element} currentVal
   * @return {Element}
   * @protected
   */

	}, {
		key: 'setterElementFn_',
		value: function setterElementFn_(newVal, currentVal) {
			var element = newVal;
			if (element) {
				element = _metalDom.dom.toElement(newVal) || currentVal;
			}
			return element;
		}

		/**
   * Creates the `DomEventEmitterProxy` instance and has it start proxying any
   * listeners that have already been listened to.
   * @protected
   */

	}, {
		key: 'setUpProxy_',
		value: function setUpProxy_() {
			if (this.elementEventProxy_) {
				return;
			}

			var proxy = new _metalDom.DomEventEmitterProxy(this.element, this);
			this.elementEventProxy_ = proxy;

			_metal.object.map(this.attachedListeners_, proxy.proxyEvent.bind(proxy));
			this.attachedListeners_ = null;

			this.newListenerHandle_.removeListener();
			this.newListenerHandle_ = null;
		}

		/**
   * Fires state synchronization functions.
   * @protected
   */

	}, {
		key: 'syncState_',
		value: function syncState_() {
			var keys = this.getStateKeys();
			for (var i = 0; i < keys.length; i++) {
				this.fireStateKeyChange_(keys[i]);
			}
		}

		/**
   * Fires synchronization changes for state keys.
   * @param {Object.<string, Object>} changes Object containing the state key
   *     name as key and an object with newVal and prevVal as value.
   * @protected
   */

	}, {
		key: 'syncStateFromChanges_',
		value: function syncStateFromChanges_(changes) {
			for (var key in changes) {
				this.fireStateKeyChange_(key, changes[key]);
			}
		}

		/**
   * State synchronization logic for the `elementClasses` state key.
   * @param {string} newVal
   * @param {string} prevVal
   */

	}, {
		key: 'syncElementClasses',
		value: function syncElementClasses(newVal, prevVal) {
			if (this.element && prevVal) {
				_metalDom.dom.removeClasses(this.element, prevVal);
			}
			this.addElementClasses();
		}

		/**
   * State synchronization logic for `visible` state key.
   * Updates the element's display value according to its visibility.
   * @param {boolean} newVal
   */

	}, {
		key: 'syncVisible',
		value: function syncVisible(newVal) {
			if (this.element) {
				this.element.style.display = newVal ? '' : 'none';
			}
		}

		/**
   * Lifecycle. Called whenever the component has just been rendered.
   * @param {boolean} firstRender Flag indicating if this was the component's
   *     first render.
   */

	}, {
		key: 'rendered',
		value: function rendered() {}

		/**
   * Validator logic for elementClasses state key.
   * @param {string} val
   * @return {boolean} True if val is a valid element classes.
   * @protected
   */

	}, {
		key: 'validatorElementClassesFn_',
		value: function validatorElementClassesFn_(val) {
			return _metal.core.isString(val);
		}

		/**
   * Validator logic for element state key.
   * @param {?string|Element} val
   * @return {boolean} True if val is a valid element.
   * @protected
   */

	}, {
		key: 'validatorElementFn_',
		value: function validatorElementFn_(val) {
			return _metal.core.isElement(val) || _metal.core.isString(val) || !_metal.core.isDefAndNotNull(val);
		}

		/**
   * Validator logic for the `events` state key.
   * @param {Object} val
   * @return {boolean}
   * @protected
   */

	}, {
		key: 'validatorEventsFn_',
		value: function validatorEventsFn_(val) {
			return !_metal.core.isDefAndNotNull(val) || _metal.core.isObject(val);
		}
	}], [{
		key: 'isComponentCtor',
		value: function isComponentCtor(fn) {
			return fn.prototype && fn.prototype[Component.COMPONENT_FLAG];
		}
	}, {
		key: 'render',
		value: function render(Ctor, opt_configOrElement, opt_element) {
			var config = opt_configOrElement;
			var element = opt_element;
			if (_metal.core.isElement(opt_configOrElement)) {
				config = null;
				element = opt_configOrElement;
			}
			var instance = new Ctor(config, false);
			instance.render_(element);
			return instance;
		}
	}]);

	return Component;
}(_metalState2.default);

/**
 * Component state definition.
 * @type {Object}
 * @static
 */


Component.STATE = {
	/**
  * Component element bounding box.
  * @type {Element}
  * @writeOnce
  */
	element: {
		setter: 'setterElementFn_',
		validator: 'validatorElementFn_'
	},

	/**
  * CSS classes to be applied to the element.
  * @type {string}
  */
	elementClasses: {
		validator: 'validatorElementClassesFn_'
	},

	/**
  * Listeners that should be attached to this component. Should be provided as an object,
  * where the keys are event names and the values are the listener functions (or function
  * names).
  * @type {Object<string, (function()|string|{selector: string, fn: function()|string})>}
  */
	events: {
		validator: 'validatorEventsFn_',
		value: null
	},

	/**
  * Indicates if the component is visible or not.
  * @type {boolean}
  */
	visible: {
		validator: _metal.core.isBoolean,
		value: true
	}
};

Component.COMPONENT_FLAG = '__metal_component__';

/**
 * CSS classes to be applied to the element.
 * @type {string}
 * @protected
 * @static
 */
Component.ELEMENT_CLASSES = '';

/**
 * The `ComponentRenderer` that should be used. Components need to set this
 * to a subclass of `ComponentRenderer` that has the rendering logic, like
 * `SoyRenderer`.
 * @type {!ComponentRenderer}
 * @static
 */
Component.RENDERER = _ComponentRenderer2.default;

/**
 * Flag indicating if component updates will happen synchronously. Updates are
 * done asynchronously by default, which allows changes to be batched and
 * applied together.
 * @type {boolean}
 */
Component.SYNC_UPDATES = false;

/**
 * A list with state key names that will automatically be rejected as invalid.
 * @type {!Array<string>}
 */
Component.INVALID_KEYS = ['components', 'wasRendered'];

/**
 * Sets a prototype flag to easily determine if a given constructor is for
 * a component or not.
 */
Component.prototype[Component.COMPONENT_FLAG] = true;

exports.default = Component;
},{"./ComponentRenderer":29,"metal":39,"metal-dom":9,"metal-events":20,"metal-state":34}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _metal = require('metal');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The component registry is used to register components, so they can
 * be accessible by name.
 * @type {Object}
 */
var ComponentRegistry = function () {
	function ComponentRegistry() {
		_classCallCheck(this, ComponentRegistry);
	}

	_createClass(ComponentRegistry, null, [{
		key: 'getConstructor',

		/**
   * Gets the constructor function for the given component name, or
   * undefined if it hasn't been registered yet.
   * @param {string} name The component's name.
   * @return {?function}
   * @static
   */
		value: function getConstructor(name) {
			var constructorFn = ComponentRegistry.components_[name];
			if (!constructorFn) {
				console.error('There\'s no constructor registered for the component ' + 'named ' + name + '. Components need to be registered via ' + 'ComponentRegistry.register.');
			}
			return constructorFn;
		}

		/**
   * Registers a component, so it can be found by its name.
   * @param {!Function} constructorFn The component's constructor function.
   * @param {string=} opt_name Name of the registered component. If none is given
   *   the name defined by the NAME static variable will be used instead. If that
   *   isn't set as well, the name of the constructor function will be used.
   * @static
   */

	}, {
		key: 'register',
		value: function register(constructorFn, opt_name) {
			var name = opt_name;
			if (!name) {
				if (constructorFn.hasOwnProperty('NAME')) {
					name = constructorFn.NAME;
				} else {
					name = _metal.core.getFunctionName(constructorFn);
				}
			}
			constructorFn.NAME = name;
			ComponentRegistry.components_[name] = constructorFn;
		}
	}]);

	return ComponentRegistry;
}();

/**
 * Holds all registered components, indexed by their names.
 * @type {!Object<string, function()>}
 * @protected
 * @static
 */


ComponentRegistry.components_ = {};

exports.default = ComponentRegistry;
},{"metal":39}],29:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _metalEvents = require('metal-events');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Base class that component renderers should extend from. It defines the
 * required methods all renderers should have.
 */
var ComponentRenderer = function (_EventEmitter) {
	_inherits(ComponentRenderer, _EventEmitter);

	/**
  * Constructor function for `ComponentRenderer`.
  * @param {!Component} component The component that this renderer is
  *     responsible for.
  */
	function ComponentRenderer(component) {
		_classCallCheck(this, ComponentRenderer);

		var _this = _possibleConstructorReturn(this, (ComponentRenderer.__proto__ || Object.getPrototypeOf(ComponentRenderer)).call(this));

		_this.component_ = component;

		_this.componentRendererEvents_ = new _metalEvents.EventHandler();
		_this.componentRendererEvents_.add(_this.component_.once('render', _this.render.bind(_this)));
		_this.on('rendered', _this.handleRendered_);

		if (_this.component_.constructor.SYNC_UPDATES_MERGED) {
			_this.componentRendererEvents_.add(_this.component_.on('stateKeyChanged', _this.handleComponentRendererStateKeyChanged_.bind(_this)));
		} else {
			_this.componentRendererEvents_.add(_this.component_.on('stateChanged', _this.handleComponentRendererStateChanged_.bind(_this)));
		}
		return _this;
	}

	/**
  * @inheritDoc
  */


	_createClass(ComponentRenderer, [{
		key: 'disposeInternal',
		value: function disposeInternal() {
			this.componentRendererEvents_.removeAllListeners();
			this.componentRendererEvents_ = null;
		}

		/**
   * Handles a `stateChanged` event from this renderer's component. Calls the
   * `update` function if the component has already been rendered for the first
   * time.
   * @param {!Object<string, Object>} changes Object containing the names
   *     of all changed state keys, each mapped to an object with its new
   *     (newVal) and previous (prevVal) values.
   * @protected
   */

	}, {
		key: 'handleComponentRendererStateChanged_',
		value: function handleComponentRendererStateChanged_(changes) {
			if (this.shouldRerender_(changes)) {
				this.update(changes);
			}
		}

		/**
   * Handles a `stateKeyChanged` event from this renderer's component. This is
   * similar to `handleComponentRendererStateChanged_`, but only called for
   * components that have requested updates to happen synchronously.
   * @param {!{key: string, newVal: *, prevVal: *}} data
   * @protected
   */

	}, {
		key: 'handleComponentRendererStateKeyChanged_',
		value: function handleComponentRendererStateKeyChanged_(data) {
			var changes = {
				changes: _defineProperty({}, data.key, data)
			};
			if (this.shouldRerender_(changes)) {
				this.update(changes);
			}
		}

		/**
   * Handles the "rendered" event.
   * @protected
   */

	}, {
		key: 'handleRendered_',
		value: function handleRendered_() {
			this.isRendered_ = true;
		}

		/**
   * Checks if any other state property besides "element" has changed.
   * @param {!Object} changes
   * @return {boolean}
   * @protected
   */

	}, {
		key: 'hasChangedBesidesElement_',
		value: function hasChangedBesidesElement_(changes) {
			var count = Object.keys(changes).length;
			if (changes.hasOwnProperty('element')) {
				count--;
			}
			return count > 0;
		}

		/**
   * Renders the component's whole content (including its main element).
   */

	}, {
		key: 'render',
		value: function render() {
			if (!this.component_.element) {
				this.component_.element = document.createElement('div');
			}
			this.emit('rendered', !this.isRendered_);
		}

		/**
   * Checks if the given changes object should cause a rerender.
   * @param {!Object} changes
   * @return {boolean}
   * @protected
   */

	}, {
		key: 'shouldRerender_',
		value: function shouldRerender_(changes) {
			return this.isRendered_ && !this.skipUpdates_ && this.hasChangedBesidesElement_(changes.changes);
		}

		/**
   * Skips updates until `stopSkipUpdates` is called.
   */

	}, {
		key: 'startSkipUpdates',
		value: function startSkipUpdates() {
			this.skipUpdates_ = true;
		}

		/**
   * Stops skipping updates.
   */

	}, {
		key: 'stopSkipUpdates',
		value: function stopSkipUpdates() {
			this.skipUpdates_ = false;
		}

		/**
   * Updates the component's element html. This is automatically called when
   * the value of at least one of the component's state keys has changed.
   * @param {Object.<string, Object>} changes Object containing the names
   *     of all changed state keys, each mapped to an object with its new
   *     (newVal) and previous (prevVal) values.
   */

	}, {
		key: 'update',
		value: function update() {}
	}]);

	return ComponentRenderer;
}(_metalEvents.EventEmitter);

exports.default = ComponentRenderer;
},{"metal-events":20}],30:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ComponentRenderer = exports.ComponentRegistry = exports.Component = undefined;

var _Component = require('../Component');

var _Component2 = _interopRequireDefault(_Component);

var _ComponentRegistry = require('../ComponentRegistry');

var _ComponentRegistry2 = _interopRequireDefault(_ComponentRegistry);

var _ComponentRenderer = require('../ComponentRenderer');

var _ComponentRenderer2 = _interopRequireDefault(_ComponentRenderer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Component2.default;
exports.Component = _Component2.default;
exports.ComponentRegistry = _ComponentRegistry2.default;
exports.ComponentRenderer = _ComponentRenderer2.default;
},{"../Component":27,"../ComponentRegistry":28,"../ComponentRenderer":29}],31:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

require('./iDOMHelpers');

var _metalIncrementalDom = require('metal-incremental-dom');

var _metalIncrementalDom2 = _interopRequireDefault(_metalIncrementalDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Allows components to use JSX templates to render their contents. Usage
 * example:
 *
 * class MyComp extends Component {
 *   render() {
 *     return <div class="my-comp">Hello World</div>;
 *   }
 * }
 * MyComp.RENDERER = JSX;
 *
 * Note that this renderer is assuming that `babel-plugin-incremental-dom` is
 * being used, so it integrates well with it. If that's not the case, it's
 * possible to use just `IncrementalDomRenderer` directly with other build
 * tools, or create another renderer that integrates better with them.
 */

var JSX = function (_IncrementalDomRender) {
  _inherits(JSX, _IncrementalDomRender);

  function JSX() {
    _classCallCheck(this, JSX);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(JSX).apply(this, arguments));
  }

  return JSX;
}(_metalIncrementalDom2.default);

exports.default = JSX;
},{"./iDOMHelpers":33,"metal-incremental-dom":22}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.JSX = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _metalComponent = require('metal-component');

var _metalComponent2 = _interopRequireDefault(_metalComponent);

var _JSX = require('./JSX');

var _JSX2 = _interopRequireDefault(_JSX);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var JSXComponent = function (_Component) {
	_inherits(JSXComponent, _Component);

	function JSXComponent() {
		_classCallCheck(this, JSXComponent);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(JSXComponent).apply(this, arguments));
	}

	_createClass(JSXComponent, [{
		key: 'createRenderer',

		/**
   * Overrides the original method to create a JSX renderer.
   * @return {!JSX}
   */
		value: function createRenderer() {
			return new _JSX2.default(this);
		}
	}]);

	return JSXComponent;
}(_metalComponent2.default);

/**
 * State configuration.
 */


JSXComponent.STATE = {
	/**
  * Children elements to be rendered inside the component.
  * @type {!Array}
  */
	children: {
		validator: Array.isArray,
		valueFn: function valueFn() {
			return [];
		}
	}
};

exports.default = JSXComponent;
exports.JSX = _JSX2.default;
},{"./JSX":31,"metal-component":5}],33:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _metalIncrementalDom = require('metal-incremental-dom');

var _metalIncrementalDom2 = _interopRequireDefault(_metalIncrementalDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * These helpers are all from "babel-plugin-incremental-dom". See its README
 * file for more details:
 * https://github.com/jridgewell/babel-plugin-incremental-dom#runtime
 */

window.iDOMHelpers = window.iDOMHelpers || {};

window.iDOMHelpers.attr = function (value, attrName) {
  IncrementalDOM.attr(attrName, value);
};

window.iDOMHelpers.forOwn = function (object, iterator) {
  var hasOwn = Object.prototype.hasOwnProperty;
  for (var prop in object) {
    if (hasOwn.call(object, prop)) {
      iterator(object[prop], prop);
    }
  }
};

window.iDOMHelpers.jsxWrapper = function (elementClosure, args) {
  var wrapper = args ? function () {
    return elementClosure.apply(this, args);
  } : elementClosure;
  wrapper.__jsxDOMWrapper = true;
  return wrapper;
};

window.iDOMHelpers.renderArbitrary = function (child) {
  var type = typeof child === 'undefined' ? 'undefined' : _typeof(child);
  if (type === 'number' || type === 'string' || child && child instanceof String) {
    IncrementalDOM.text(child);
  } else if (type === 'function' && child.__jsxDOMWrapper) {
    child();
  } else if (Array.isArray(child)) {
    child.forEach(window.iDOMHelpers.renderArbitrary);
  } else if (String(child) === '[object Object]') {
    // Renders special incremental dom nodes in a special way :)
    if (_metalIncrementalDom2.default.isIncDomNode(child)) {
      _metalIncrementalDom2.default.renderChild(child);
    } else {
      window.iDOMHelpers.forOwn(child, window.iDOMHelpers.renderArbitrary);
    }
  }
};

exports.default = window.iDOMHelpers;
},{"metal-incremental-dom":22}],34:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _metal = require('metal');

var _metalEvents = require('metal-events');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * State adds support for having object properties that can be watched for
 * changes, as well as configured with validators, setters and other options.
 * See the `addToState` method for a complete list of available configuration
 * options for each state key.
 * @constructor
 * @extends {EventEmitter}
 */
var State = function (_EventEmitter) {
	_inherits(State, _EventEmitter);

	function State(opt_config) {
		_classCallCheck(this, State);

		/**
   * Object with information about the batch event that is currently
   * scheduled, or null if none is.
   * @type {Object}
   * @protected
   */
		var _this = _possibleConstructorReturn(this, (State.__proto__ || Object.getPrototypeOf(State)).call(this));

		_this.scheduledBatchData_ = null;

		/**
   * Object that contains information about all this instance's state keys.
   * @type {!Object<string, !Object>}
   * @protected
   */
		_this.stateInfo_ = {};

		_this.setShouldUseFacade(true);
		_this.mergeInvalidKeys_();
		_this.addToStateFromStaticHint_(opt_config);
		return _this;
	}

	/**
  * Adds the given key to the state.
  * @param {string} name The name of the new state key.
  * @param {Object.<string, *>=} config The configuration object for the new
  *     key. See `addToState` for supported settings.
  * @param {*} initialValue The initial value of the new key.
  */


	_createClass(State, [{
		key: 'addKeyToState',
		value: function addKeyToState(name, config, initialValue) {
			this.buildKeyInfo_(name, config, initialValue);
			Object.defineProperty(this, name, this.buildKeyPropertyDef_(name));
		}

		/**
   * Adds the given key(s) to the state, together with its(their) configs.
   * Config objects support the given settings:
   *     setter - Function for normalizing state key values. It receives the new
   *     value that was set, and returns the value that should be stored.
   *
   *     validator - Function that validates state key values. When it returns
   *     false, the new value is ignored. When it returns an instance of Error,
   *     it will emit the error to the console.
   *
   *     value - The default value for the state key. Note that setting this to
   *     an object will cause all class instances to use the same reference to
   *     the object. To have each instance use a different reference for objects,
   *     use the `valueFn` option instead.
   *
   *     valueFn - A function that returns the default value for a state key.
   *
   *     writeOnce - Ignores writes to the state key after it's been first
   *     written to. That is, allows writes only when setting the value for the
   *     first time.
   * @param {!Object.<string, !Object>|string} configsOrName An object that maps
   *     configuration options for keys to be added to the state or the name of
   *     a single key to be added.
   * @param {Object.<string, *>=} opt_initialValuesOrConfig An object that maps
   *     state keys to their initial values. These values have higher precedence
   *     than the default values specified in the configurations. If a single
   *     key name was passed as the first param instead though, then this should
   *     be the configuration object for that key.
   * @param {boolean|Object|*=} opt_contextOrInitialValue If the first
   *     param passed to this method was a config object, this should be the
   *     context where the added state keys will be defined (defaults to `this`),
   *     or false if they shouldn't be defined at all. If the first param was a
   *     single key name though, this should be its initial value.
   */

	}, {
		key: 'addToState',
		value: function addToState(configsOrName, opt_initialValuesOrConfig, opt_contextOrInitialValue) {
			if (_metal.core.isString(configsOrName)) {
				return this.addKeyToState(configsOrName, opt_initialValuesOrConfig, opt_contextOrInitialValue);
			}

			var initialValues = opt_initialValuesOrConfig || {};
			var names = Object.keys(configsOrName);

			var props = {};
			for (var i = 0; i < names.length; i++) {
				var name = names[i];
				this.buildKeyInfo_(name, configsOrName[name], initialValues[name]);
				props[name] = this.buildKeyPropertyDef_(name);
			}

			if (opt_contextOrInitialValue !== false) {
				Object.defineProperties(opt_contextOrInitialValue || this, props);
			}
		}

		/**
   * Adds state keys from super classes static hint `MyClass.STATE = {};`.
   * @param {Object.<string, !Object>=} opt_config An object that maps all the
   *     configurations for state keys.
   * @protected
   */

	}, {
		key: 'addToStateFromStaticHint_',
		value: function addToStateFromStaticHint_(opt_config) {
			var ctor = this.constructor;
			var defineContext = false;
			if (State.mergeStateStatic(ctor)) {
				defineContext = ctor.prototype;
			}
			this.addToState(ctor.STATE_MERGED, opt_config, defineContext);
		}

		/**
   * Checks that the given name is a valid state key name. If it's not, an error
   * will be thrown.
   * @param {string} name The name to be validated.
   * @throws {Error}
   * @protected
   */

	}, {
		key: 'assertValidStateKeyName_',
		value: function assertValidStateKeyName_(name) {
			if (this.constructor.INVALID_KEYS_MERGED[name]) {
				throw new Error('It\'s not allowed to create a state key with the name "' + name + '".');
			}
		}

		/**
   * Builds the info object for the specified state key.
   * @param {string} name The name of the key.
   * @param {Object} config The config object for the key.
   * @param {*} initialValue The initial value of the key.
   * @protected
   */

	}, {
		key: 'buildKeyInfo_',
		value: function buildKeyInfo_(name, config, initialValue) {
			this.assertValidStateKeyName_(name);

			this.stateInfo_[name] = {
				config: config || {},
				initialValue: initialValue,
				state: State.KeyStates.UNINITIALIZED
			};
		}

		/**
   * Builds the property definition object for the specified state key.
   * @param {string} name The name of the key.
   * @return {!Object}
   * @protected
   */

	}, {
		key: 'buildKeyPropertyDef_',
		value: function buildKeyPropertyDef_(name) {
			return {
				configurable: true,
				enumerable: true,
				get: function get() {
					return this.getStateKeyValue_(name);
				},
				set: function set(val) {
					this.setStateKeyValue_(name, val);
				}
			};
		}

		/**
   * Calls the requested function, running the appropriate code for when it's
   * passed as an actual function object or just the function's name.
   * @param {!Function|string} fn Function, or name of the function to run.
   * @param {!Array} An optional array of parameters to be passed to the
   *   function that will be called.
   * @return {*} The return value of the called function.
   * @protected
   */

	}, {
		key: 'callFunction_',
		value: function callFunction_(fn, args) {
			if (_metal.core.isString(fn)) {
				return this[fn].apply(this, args);
			} else if (_metal.core.isFunction(fn)) {
				return fn.apply(this, args);
			}
		}

		/**
   * Calls the state key's setter, if there is one.
   * @param {string} name The name of the key.
   * @param {*} value The value to be set.
   * @param {*} currentValue The current value.
   * @return {*} The final value to be set.
   * @protected
   */

	}, {
		key: 'callSetter_',
		value: function callSetter_(name, value, currentValue) {
			var info = this.stateInfo_[name];
			var config = info.config;
			if (config.setter) {
				value = this.callFunction_(config.setter, [value, currentValue]);
			}
			return value;
		}

		/**
   * Calls the state key's validator, if there is one. Emits console
   * warning if validator returns a string.
   * @param {string} name The name of the key.
   * @param {*} value The value to be validated.
   * @return {boolean} Flag indicating if value is valid or not.
   * @protected
   */

	}, {
		key: 'callValidator_',
		value: function callValidator_(name, value) {
			var info = this.stateInfo_[name];
			var config = info.config;
			if (config.validator) {
				var validatorReturn = this.callFunction_(config.validator, [value, name, this]);

				if (validatorReturn instanceof Error) {
					console.error('Warning: ' + validatorReturn);
				}
				return validatorReturn;
			}
			return true;
		}

		/**
   * Checks if the it's allowed to write on the requested state key.
   * @param {string} name The name of the key.
   * @return {boolean}
   */

	}, {
		key: 'canSetState',
		value: function canSetState(name) {
			var info = this.stateInfo_[name];
			return !info.config.writeOnce || !info.written;
		}

		/**
   * @inheritDoc
   */

	}, {
		key: 'disposeInternal',
		value: function disposeInternal() {
			_get(State.prototype.__proto__ || Object.getPrototypeOf(State.prototype), 'disposeInternal', this).call(this);
			this.stateInfo_ = null;
			this.scheduledBatchData_ = null;
		}

		/**
   * Emits the state change batch event.
   * @protected
   */

	}, {
		key: 'emitBatchEvent_',
		value: function emitBatchEvent_() {
			if (!this.isDisposed()) {
				var data = this.scheduledBatchData_;
				this.scheduledBatchData_ = null;
				this.emit('stateChanged', data);
			}
		}

		/**
   * Returns the value of the requested state key.
   * Note: this can and should be accomplished by accessing the value as a
   * regular property. This should only be used in cases where a function is
   * actually needed.
   * @param {string} name
   * @return {*}
   */

	}, {
		key: 'get',
		value: function get(name) {
			return this[name];
		}

		/**
   * Returns an object that maps state keys to their values.
   * @param {Array<string>=} opt_names A list of names of the keys that should
   *   be returned. If none is given, the whole state will be returned.
   * @return {Object.<string, *>}
   */

	}, {
		key: 'getState',
		value: function getState(opt_names) {
			var state = {};
			var names = opt_names || this.getStateKeys();

			for (var i = 0; i < names.length; i++) {
				state[names[i]] = this[names[i]];
			}

			return state;
		}

		/**
   * Gets the config object for the requested state key.
   * @param {string} name The key's name.
   * @return {Object}
   * @protected
   */

	}, {
		key: 'getStateKeyConfig',
		value: function getStateKeyConfig(name) {
			return (this.stateInfo_[name] || {}).config;
		}

		/**
   * Returns an array with all state keys.
   * @return {Array.<string>}
   */

	}, {
		key: 'getStateKeys',
		value: function getStateKeys() {
			return Object.keys(this.stateInfo_);
		}

		/**
   * Gets the value of the specified state key. This is passed as that key's
   * getter to the `Object.defineProperty` call inside the `addKeyToState` method.
   * @param {string} name The name of the key.
   * @return {*}
   * @protected
   */

	}, {
		key: 'getStateKeyValue_',
		value: function getStateKeyValue_(name) {
			this.initStateKey_(name);
			return this.stateInfo_[name].value;
		}

		/**
   * Checks if the value of the state key with the given name has already been
   * set. Note that this doesn't run the key's getter.
   * @param {string} name The name of the key.
   * @return {boolean}
   */

	}, {
		key: 'hasBeenSet',
		value: function hasBeenSet(name) {
			var info = this.stateInfo_[name];
			return info.state === State.KeyStates.INITIALIZED || info.initialValue;
		}

		/**
   * Checks if the given key is present in this instance's state.
   * @param {string} key
   * @return {boolean}
   */

	}, {
		key: 'hasStateKey',
		value: function hasStateKey(key) {
			return !!this.stateInfo_[key];
		}

		/**
   * Informs of changes to a state key's value through an event. Won't trigger
   * the event if the value hasn't changed or if it's being initialized.
   * @param {string} name The name of the key.
   * @param {*} prevVal The previous value of the key.
   * @protected
   */

	}, {
		key: 'informChange_',
		value: function informChange_(name, prevVal) {
			if (this.shouldInformChange_(name, prevVal)) {
				var data = {
					key: name,
					newVal: this[name],
					prevVal: prevVal
				};
				this.emit(name + 'Changed', data);
				this.emit('stateKeyChanged', data);
				this.scheduleBatchEvent_(data);
			}
		}

		/**
   * Initializes the specified state key, giving it a first value.
   * @param {string} name The name of the key.
   * @protected
   */

	}, {
		key: 'initStateKey_',
		value: function initStateKey_(name) {
			var info = this.stateInfo_[name];
			if (info.state !== State.KeyStates.UNINITIALIZED) {
				return;
			}

			info.state = State.KeyStates.INITIALIZING;
			this.setInitialValue_(name);
			if (!info.written) {
				info.state = State.KeyStates.INITIALIZING_DEFAULT;
				this.setDefaultValue_(name);
			}
			info.state = State.KeyStates.INITIALIZED;
		}

		/**
   * Merges an array of values for the STATE property into a single object.
   * @param {!Array} values The values to be merged.
   * @return {!Object} The merged value.
   * @static
   * @protected
   */

	}, {
		key: 'mergeInvalidKeys_',


		/**
   * Merges the values of the `INVALID_KEYS` static for the whole hierarchy of
   * the current instance.
   * @protected
   */
		value: function mergeInvalidKeys_() {
			_metal.core.mergeSuperClassesProperty(this.constructor, 'INVALID_KEYS', function (values) {
				return _metal.array.flatten(values).reduce(function (merged, val) {
					if (val) {
						merged[val] = true;
					}
					return merged;
				}, {});
			});
		}

		/**
   * Removes the requested state key.
   * @param {string} name The name of the key.
   */

	}, {
		key: 'removeStateKey',
		value: function removeStateKey(name) {
			this.stateInfo_[name] = null;
			delete this[name];
		}

		/**
   * Schedules a state change batch event to be emitted asynchronously.
   * @param {!Object} changeData Information about a state key's update.
   * @protected
   */

	}, {
		key: 'scheduleBatchEvent_',
		value: function scheduleBatchEvent_(changeData) {
			if (!this.scheduledBatchData_) {
				_metal.async.nextTick(this.emitBatchEvent_, this);
				this.scheduledBatchData_ = {
					changes: {}
				};
			}

			var name = changeData.key;
			var changes = this.scheduledBatchData_.changes;
			if (changes[name]) {
				changes[name].newVal = changeData.newVal;
			} else {
				changes[name] = changeData;
			}
		}

		/**
   * Sets the value of the requested state key.
   * Note: this can and should be accomplished by setting the state key as a
   * regular property. This should only be used in cases where a function is
   * actually needed.
   * @param {string} name
   * @param {*} value
   * @return {*}
   */

	}, {
		key: 'set',
		value: function set(name, value) {
			if (this.hasStateKey(name)) {
				this[name] = value;
			}
		}

		/**
   * Sets the default value of the requested state key.
   * @param {string} name The name of the key.
   * @return {*}
   * @protected
   */

	}, {
		key: 'setDefaultValue_',
		value: function setDefaultValue_(name) {
			var config = this.stateInfo_[name].config;

			if (config.value !== undefined) {
				this[name] = config.value;
			} else {
				this[name] = this.callFunction_(config.valueFn);
			}
		}

		/**
   * Sets the initial value of the requested state key.
   * @param {string} name The name of the key.
   * @return {*}
   * @protected
   */

	}, {
		key: 'setInitialValue_',
		value: function setInitialValue_(name) {
			var info = this.stateInfo_[name];
			if (info.initialValue !== undefined) {
				this[name] = info.initialValue;
				info.initialValue = undefined;
			}
		}

		/**
   * Sets the value of all the specified state keys.
   * @param {!Object.<string,*>} values A map of state keys to the values they
   *   should be set to.
   * @param {function()=} opt_callback An optional function that will be run
   *   after the next batched update is triggered.
   */

	}, {
		key: 'setState',
		value: function setState(values, opt_callback) {
			var _this2 = this;

			Object.keys(values).forEach(function (name) {
				return _this2.set(name, values[name]);
			});
			if (opt_callback && this.scheduledBatchData_) {
				this.once('stateChanged', opt_callback);
			}
		}

		/**
   * Sets the value of the specified state key. This is passed as that key's
   * setter to the `Object.defineProperty` call inside the `addKeyToState`
   * method.
   * @param {string} name The name of the key.
   * @param {*} value The new value of the key.
   * @protected
   */

	}, {
		key: 'setStateKeyValue_',
		value: function setStateKeyValue_(name, value) {
			if (!this.canSetState(name) || !this.validateKeyValue_(name, value)) {
				return;
			}

			var info = this.stateInfo_[name];
			if (info.initialValue === undefined && info.state === State.KeyStates.UNINITIALIZED) {
				info.state = State.KeyStates.INITIALIZED;
			}

			var prevVal = this[name];
			info.value = this.callSetter_(name, value, prevVal);
			info.written = true;
			this.informChange_(name, prevVal);
		}

		/**
   * Checks if we should inform about a state update. Updates are ignored during
   * state initialization. Otherwise, updates to primitive values are only
   * informed when the new value is different from the previous one. Updates to
   * objects (which includes functions and arrays) are always informed outside
   * initialization though, since we can't be sure if all of the internal data
   * has stayed the same.
   * @param {string} name The name of the key.
   * @param {*} prevVal The previous value of the key.
   * @return {boolean}
   * @protected
   */

	}, {
		key: 'shouldInformChange_',
		value: function shouldInformChange_(name, prevVal) {
			var info = this.stateInfo_[name];
			return info.state === State.KeyStates.INITIALIZED && (_metal.core.isObject(prevVal) || prevVal !== this[name]);
		}

		/**
   * Validates the state key's value, which includes calling the validator
   * defined in the key's configuration object, if there is one.
   * @param {string} name The name of the key.
   * @param {*} value The value to be validated.
   * @return {boolean} Flag indicating if value is valid or not.
   * @protected
   */

	}, {
		key: 'validateKeyValue_',
		value: function validateKeyValue_(name, value) {
			var info = this.stateInfo_[name];

			return info.state === State.KeyStates.INITIALIZING_DEFAULT || this.callValidator_(name, value);
		}
	}], [{
		key: 'mergeState_',
		value: function mergeState_(values) {
			return _metal.object.mixin.apply(null, [{}].concat(values.reverse()));
		}

		/**
   * Merges the STATE static variable for the given constructor function.
   * @param  {!Function} ctor Constructor function.
   * @return {boolean} Returns true if merge happens, false otherwise.
   * @static
   */

	}, {
		key: 'mergeStateStatic',
		value: function mergeStateStatic(ctor) {
			return _metal.core.mergeSuperClassesProperty(ctor, 'STATE', State.mergeState_);
		}
	}]);

	return State;
}(_metalEvents.EventEmitter);

/**
 * A list with state key names that will automatically be rejected as invalid.
 * Subclasses can define their own invalid keys by setting this static on their
 * constructors, which will be merged together and handled automatically.
 * @type {!Array<string>}
 */


State.INVALID_KEYS = ['state', 'stateKey'];

/**
 * Constants that represent the states that an a state key can be in.
 * @type {!Object}
 */
State.KeyStates = {
	UNINITIALIZED: 0,
	INITIALIZING: 1,
	INITIALIZING_DEFAULT: 2,
	INITIALIZED: 3
};

exports.default = State;
},{"metal":39,"metal-events":20}],35:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = require('../core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var array = function () {
	function array() {
		_classCallCheck(this, array);
	}

	_createClass(array, null, [{
		key: 'equal',

		/**
   * Checks if the given arrays have the same content.
   * @param {!Array<*>} arr1
   * @param {!Array<*>} arr2
   * @return {boolean}
   */
		value: function equal(arr1, arr2) {
			if (arr1.length !== arr2.length) {
				return false;
			}
			for (var i = 0; i < arr1.length; i++) {
				if (arr1[i] !== arr2[i]) {
					return false;
				}
			}
			return true;
		}

		/**
   * Returns the first value in the given array that isn't undefined.
   * @param {!Array} arr
   * @return {*}
   */

	}, {
		key: 'firstDefinedValue',
		value: function firstDefinedValue(arr) {
			for (var i = 0; i < arr.length; i++) {
				if (arr[i] !== undefined) {
					return arr[i];
				}
			}
		}

		/**
   * Transforms the input nested array to become flat.
   * @param {Array.<*|Array.<*>>} arr Nested array to flatten.
   * @param {Array.<*>} opt_output Optional output array.
   * @return {Array.<*>} Flat array.
   */

	}, {
		key: 'flatten',
		value: function flatten(arr, opt_output) {
			var output = opt_output || [];
			for (var i = 0; i < arr.length; i++) {
				if (Array.isArray(arr[i])) {
					array.flatten(arr[i], output);
				} else {
					output.push(arr[i]);
				}
			}
			return output;
		}

		/**
   * Removes the first occurrence of a particular value from an array.
   * @param {Array.<T>} arr Array from which to remove value.
   * @param {T} obj Object to remove.
   * @return {boolean} True if an element was removed.
   * @template T
   */

	}, {
		key: 'remove',
		value: function remove(arr, obj) {
			var i = arr.indexOf(obj);
			var rv;
			if (rv = i >= 0) {
				array.removeAt(arr, i);
			}
			return rv;
		}

		/**
   * Removes from an array the element at index i
   * @param {Array} arr Array or array like object from which to remove value.
   * @param {number} i The index to remove.
   * @return {boolean} True if an element was removed.
   */

	}, {
		key: 'removeAt',
		value: function removeAt(arr, i) {
			return Array.prototype.splice.call(arr, i, 1).length === 1;
		}

		/**
   * Slices the given array, just like Array.prototype.slice, but this
   * is faster and working on all array-like objects (like arguments).
   * @param {!Object} arr Array-like object to slice.
   * @param {number} start The index that should start the slice.
   * @param {number=} opt_end The index where the slice should end, not
   *   included in the final array. If not given, all elements after the
   *   start index will be included.
   * @return {!Array}
   */

	}, {
		key: 'slice',
		value: function slice(arr, start, opt_end) {
			var sliced = [];
			var end = _core2.default.isDef(opt_end) ? opt_end : arr.length;
			for (var i = start; i < end; i++) {
				sliced.push(arr[i]);
			}
			return sliced;
		}
	}]);

	return array;
}();

exports.default = array;
},{"../core":37}],36:[function(require,module,exports){
/*!
 * Polyfill from Google's Closure Library.
 * Copyright 2013 The Closure Library Authors. All Rights Reserved.
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var async = {};

/**
 * Throw an item without interrupting the current execution context.  For
 * example, if processing a group of items in a loop, sometimes it is useful
 * to report an error while still allowing the rest of the batch to be
 * processed.
 * @param {*} exception
 */
async.throwException = function (exception) {
	// Each throw needs to be in its own context.
	async.nextTick(function () {
		throw exception;
	});
};

/**
 * Fires the provided callback just before the current callstack unwinds, or as
 * soon as possible after the current JS execution context.
 * @param {function(this:THIS)} callback
 * @param {THIS=} opt_context Object to use as the "this value" when calling
 *     the provided function.
 * @template THIS
 */
async.run = function (callback, opt_context) {
	if (!async.run.workQueueScheduled_) {
		// Nothing is currently scheduled, schedule it now.
		async.nextTick(async.run.processWorkQueue);
		async.run.workQueueScheduled_ = true;
	}

	async.run.workQueue_.push(new async.run.WorkItem_(callback, opt_context));
};

/** @private {boolean} */
async.run.workQueueScheduled_ = false;

/** @private {!Array.<!async.run.WorkItem_>} */
async.run.workQueue_ = [];

/**
 * Run any pending async.run work items. This function is not intended
 * for general use, but for use by entry point handlers to run items ahead of
 * async.nextTick.
 */
async.run.processWorkQueue = function () {
	// NOTE: additional work queue items may be pushed while processing.
	while (async.run.workQueue_.length) {
		// Don't let the work queue grow indefinitely.
		var workItems = async.run.workQueue_;
		async.run.workQueue_ = [];
		for (var i = 0; i < workItems.length; i++) {
			var workItem = workItems[i];
			try {
				workItem.fn.call(workItem.scope);
			} catch (e) {
				async.throwException(e);
			}
		}
	}

	// There are no more work items, reset the work queue.
	async.run.workQueueScheduled_ = false;
};

/**
 * @constructor
 * @final
 * @struct
 * @private
 *
 * @param {function()} fn
 * @param {Object|null|undefined} scope
 */
async.run.WorkItem_ = function (fn, scope) {
	/** @const */
	this.fn = fn;
	/** @const */
	this.scope = scope;
};

/**
 * Fires the provided callbacks as soon as possible after the current JS
 * execution context. setTimeout(…, 0) always takes at least 5ms for legacy
 * reasons.
 * @param {function(this:SCOPE)} callback Callback function to fire as soon as
 *     possible.
 * @param {SCOPE=} opt_context Object in whose scope to call the listener.
 * @template SCOPE
 */
async.nextTick = function (callback, opt_context) {
	var cb = callback;
	if (opt_context) {
		cb = callback.bind(opt_context);
	}
	cb = async.nextTick.wrapCallback_(cb);
	// Introduced and currently only supported by IE10.
	// Verify if variable is defined on the current runtime (i.e., node, browser).
	// Can't use typeof enclosed in a function (such as core.isFunction) or an
	// exception will be thrown when the function is called on an environment
	// where the variable is undefined.
	if (typeof setImmediate === 'function') {
		setImmediate(cb);
		return;
	}
	// Look for and cache the custom fallback version of setImmediate.
	if (!async.nextTick.setImmediate_) {
		async.nextTick.setImmediate_ = async.nextTick.getSetImmediateEmulator_();
	}
	async.nextTick.setImmediate_(cb);
};

/**
 * Cache for the setImmediate implementation.
 * @type {function(function())}
 * @private
 */
async.nextTick.setImmediate_ = null;

/**
 * Determines the best possible implementation to run a function as soon as
 * the JS event loop is idle.
 * @return {function(function())} The "setImmediate" implementation.
 * @private
 */
async.nextTick.getSetImmediateEmulator_ = function () {
	// Create a private message channel and use it to postMessage empty messages
	// to ourselves.
	var Channel;

	// Verify if variable is defined on the current runtime (i.e., node, browser).
	// Can't use typeof enclosed in a function (such as core.isFunction) or an
	// exception will be thrown when the function is called on an environment
	// where the variable is undefined.
	if (typeof MessageChannel === 'function') {
		Channel = MessageChannel;
	}

	// If MessageChannel is not available and we are in a browser, implement
	// an iframe based polyfill in browsers that have postMessage and
	// document.addEventListener. The latter excludes IE8 because it has a
	// synchronous postMessage implementation.
	if (typeof Channel === 'undefined' && typeof window !== 'undefined' && window.postMessage && window.addEventListener) {
		/** @constructor */
		Channel = function Channel() {
			// Make an empty, invisible iframe.
			var iframe = document.createElement('iframe');
			iframe.style.display = 'none';
			iframe.src = '';
			document.documentElement.appendChild(iframe);
			var win = iframe.contentWindow;
			var doc = win.document;
			doc.open();
			doc.write('');
			doc.close();
			var message = 'callImmediate' + Math.random();
			var origin = win.location.protocol + '//' + win.location.host;
			var onmessage = function (e) {
				// Validate origin and message to make sure that this message was
				// intended for us.
				if (e.origin !== origin && e.data !== message) {
					return;
				}
				this.port1.onmessage();
			}.bind(this);
			win.addEventListener('message', onmessage, false);
			this.port1 = {};
			this.port2 = {
				postMessage: function postMessage() {
					win.postMessage(message, origin);
				}
			};
		};
	}
	if (typeof Channel !== 'undefined') {
		var channel = new Channel();
		// Use a fifo linked list to call callbacks in the right order.
		var head = {};
		var tail = head;
		channel.port1.onmessage = function () {
			head = head.next;
			var cb = head.cb;
			head.cb = null;
			cb();
		};
		return function (cb) {
			tail.next = {
				cb: cb
			};
			tail = tail.next;
			channel.port2.postMessage(0);
		};
	}
	// Implementation for IE6-8: Script elements fire an asynchronous
	// onreadystatechange event when inserted into the DOM.
	if (typeof document !== 'undefined' && 'onreadystatechange' in document.createElement('script')) {
		return function (cb) {
			var script = document.createElement('script');
			script.onreadystatechange = function () {
				// Clean up and call the callback.
				script.onreadystatechange = null;
				script.parentNode.removeChild(script);
				script = null;
				cb();
				cb = null;
			};
			document.documentElement.appendChild(script);
		};
	}
	// Fall back to setTimeout with 0. In browsers this creates a delay of 5ms
	// or more.
	return function (cb) {
		setTimeout(cb, 0);
	};
};

/**
 * Helper function that is overrided to protect callbacks with entry point
 * monitor if the application monitors entry points.
 * @param {function()} callback Callback function to fire as soon as possible.
 * @return {function()} The wrapped callback.
 * @private
 */
async.nextTick.wrapCallback_ = function (opt_returnValue) {
	return opt_returnValue;
};

exports.default = async;
},{}],37:[function(require,module,exports){
'use strict';

/**
 * A collection of core utility functions.
 * @const
 */

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var core = function () {
	function core() {
		_classCallCheck(this, core);
	}

	_createClass(core, null, [{
		key: 'abstractMethod',

		/**
   * When defining a class Foo with an abstract method bar(), you can do:
   * Foo.prototype.bar = core.abstractMethod
   *
   * Now if a subclass of Foo fails to override bar(), an error will be thrown
   * when bar() is invoked.
   *
   * @type {!Function}
   * @throws {Error} when invoked to indicate the method should be overridden.
   */
		value: function abstractMethod() {
			throw Error('Unimplemented abstract method');
		}

		/**
   * Loops constructor super classes collecting its properties values. If
   * property is not available on the super class `undefined` will be
   * collected as value for the class hierarchy position.
   * @param {!function()} constructor Class constructor.
   * @param {string} propertyName Property name to be collected.
   * @return {Array.<*>} Array of collected values.
   * TODO(*): Rethink superclass loop.
   */

	}, {
		key: 'collectSuperClassesProperty',
		value: function collectSuperClassesProperty(constructor, propertyName) {
			var propertyValues = [constructor[propertyName]];
			while (constructor.__proto__ && !constructor.__proto__.isPrototypeOf(Function)) {
				constructor = constructor.__proto__;
				propertyValues.push(constructor[propertyName]);
			}
			return propertyValues;
		}

		/**
   * Gets the name of the given function. If the current browser doesn't
   * support the `name` property, this will calculate it from the function's
   * content string.
   * @param {!function()} fn
   * @return {string}
   */

	}, {
		key: 'getFunctionName',
		value: function getFunctionName(fn) {
			if (!fn.name) {
				var str = fn.toString();
				fn.name = str.substring(9, str.indexOf('('));
			}
			return fn.name;
		}

		/**
   * Gets an unique id. If `opt_object` argument is passed, the object is
   * mutated with an unique id. Consecutive calls with the same object
   * reference won't mutate the object again, instead the current object uid
   * returns. See {@link core.UID_PROPERTY}.
   * @param {Object=} opt_object Optional object to be mutated with the uid. If
   *     not specified this method only returns the uid.
   * @param {boolean=} opt_noInheritance Optional flag indicating if this
   *     object's uid property can be inherited from parents or not.
   * @throws {Error} when invoked to indicate the method should be overridden.
   */

	}, {
		key: 'getUid',
		value: function getUid(opt_object, opt_noInheritance) {
			if (opt_object) {
				var id = opt_object[core.UID_PROPERTY];
				if (opt_noInheritance && !opt_object.hasOwnProperty(core.UID_PROPERTY)) {
					id = null;
				}
				return id || (opt_object[core.UID_PROPERTY] = core.uniqueIdCounter_++);
			}
			return core.uniqueIdCounter_++;
		}

		/**
   * The identity function. Returns its first argument.
   * @param {*=} opt_returnValue The single value that will be returned.
   * @return {?} The first argument.
   */

	}, {
		key: 'identityFunction',
		value: function identityFunction(opt_returnValue) {
			return opt_returnValue;
		}

		/**
   * Returns true if the specified value is a boolean.
   * @param {?} val Variable to test.
   * @return {boolean} Whether variable is boolean.
   */

	}, {
		key: 'isBoolean',
		value: function isBoolean(val) {
			return typeof val === 'boolean';
		}

		/**
   * Returns true if the specified value is not undefined.
   * @param {?} val Variable to test.
   * @return {boolean} Whether variable is defined.
   */

	}, {
		key: 'isDef',
		value: function isDef(val) {
			return val !== undefined;
		}

		/**
   * Returns true if value is not undefined or null.
   * @param {*} val
   * @return {Boolean}
   */

	}, {
		key: 'isDefAndNotNull',
		value: function isDefAndNotNull(val) {
			return core.isDef(val) && !core.isNull(val);
		}

		/**
   * Returns true if value is a document.
   * @param {*} val
   * @return {Boolean}
   */

	}, {
		key: 'isDocument',
		value: function isDocument(val) {
			return val && (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && val.nodeType === 9;
		}

		/**
   * Returns true if value is a dom element.
   * @param {*} val
   * @return {Boolean}
   */

	}, {
		key: 'isElement',
		value: function isElement(val) {
			return val && (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && val.nodeType === 1;
		}

		/**
   * Returns true if the specified value is a function.
   * @param {?} val Variable to test.
   * @return {boolean} Whether variable is a function.
   */

	}, {
		key: 'isFunction',
		value: function isFunction(val) {
			return typeof val === 'function';
		}

		/**
   * Returns true if value is null.
   * @param {*} val
   * @return {Boolean}
   */

	}, {
		key: 'isNull',
		value: function isNull(val) {
			return val === null;
		}

		/**
   * Returns true if the specified value is a number.
   * @param {?} val Variable to test.
   * @return {boolean} Whether variable is a number.
   */

	}, {
		key: 'isNumber',
		value: function isNumber(val) {
			return typeof val === 'number';
		}

		/**
   * Returns true if value is a window.
   * @param {*} val
   * @return {Boolean}
   */

	}, {
		key: 'isWindow',
		value: function isWindow(val) {
			return val !== null && val === val.window;
		}

		/**
   * Returns true if the specified value is an object. This includes arrays
   * and functions.
   * @param {?} val Variable to test.
   * @return {boolean} Whether variable is an object.
   */

	}, {
		key: 'isObject',
		value: function isObject(val) {
			var type = typeof val === 'undefined' ? 'undefined' : _typeof(val);
			return type === 'object' && val !== null || type === 'function';
		}

		/**
   * Returns true if value is a Promise.
   * @param {*} val
   * @return {Boolean}
   */

	}, {
		key: 'isPromise',
		value: function isPromise(val) {
			return val && (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && typeof val.then === 'function';
		}

		/**
   * Returns true if value is a string.
   * @param {*} val
   * @return {Boolean}
   */

	}, {
		key: 'isString',
		value: function isString(val) {
			return typeof val === 'string';
		}

		/**
   * Merges the values of a static property a class with the values of that
   * property for all its super classes, and stores it as a new static
   * property of that class. If the static property already existed, it won't
   * be recalculated.
   * @param {!function()} constructor Class constructor.
   * @param {string} propertyName Property name to be collected.
   * @param {function(*, *):*=} opt_mergeFn Function that receives an array filled
   *   with the values of the property for the current class and all its super classes.
   *   Should return the merged value to be stored on the current class.
   * @return {boolean} Returns true if merge happens, false otherwise.
   */

	}, {
		key: 'mergeSuperClassesProperty',
		value: function mergeSuperClassesProperty(constructor, propertyName, opt_mergeFn) {
			var mergedName = propertyName + '_MERGED';
			if (constructor.hasOwnProperty(mergedName)) {
				return false;
			}

			var merged = core.collectSuperClassesProperty(constructor, propertyName);
			if (opt_mergeFn) {
				merged = opt_mergeFn(merged);
			}
			constructor[mergedName] = merged;
			return true;
		}

		/**
   * Null function used for default values of callbacks, etc.
   * @return {void} Nothing.
   */

	}, {
		key: 'nullFunction',
		value: function nullFunction() {}
	}]);

	return core;
}();

/**
 * Unique id property prefix.
 * @type {String}
 * @protected
 */


core.UID_PROPERTY = 'core_' + (Math.random() * 1e9 >>> 0);

/**
 * Counter for unique id.
 * @type {Number}
 * @private
 */
core.uniqueIdCounter_ = 1;

exports.default = core;
},{}],38:[function(require,module,exports){
'use strict';

/**
 * Disposable utility. When inherited provides the `dispose` function to its
 * subclass, which is responsible for disposing of any object references
 * when an instance won't be used anymore. Subclasses should override
 * `disposeInternal` to implement any specific disposing logic.
 * @constructor
 */

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Disposable = function () {
	function Disposable() {
		_classCallCheck(this, Disposable);

		/**
   * Flag indicating if this instance has already been disposed.
   * @type {boolean}
   * @protected
   */
		this.disposed_ = false;
	}

	/**
  * Disposes of this instance's object references. Calls `disposeInternal`.
  */


	_createClass(Disposable, [{
		key: 'dispose',
		value: function dispose() {
			if (!this.disposed_) {
				this.disposeInternal();
				this.disposed_ = true;
			}
		}

		/**
   * Subclasses should override this method to implement any specific
   * disposing logic (like clearing references and calling `dispose` on other
   * disposables).
   */

	}, {
		key: 'disposeInternal',
		value: function disposeInternal() {}

		/**
   * Checks if this instance has already been disposed.
   * @return {boolean}
   */

	}, {
		key: 'isDisposed',
		value: function isDisposed() {
			return this.disposed_;
		}
	}]);

	return Disposable;
}();

exports.default = Disposable;
},{}],39:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.string = exports.object = exports.Disposable = exports.async = exports.array = exports.core = undefined;

var _core = require('./core');

var _core2 = _interopRequireDefault(_core);

var _array = require('./array/array');

var _array2 = _interopRequireDefault(_array);

var _async = require('./async/async');

var _async2 = _interopRequireDefault(_async);

var _Disposable = require('./disposable/Disposable');

var _Disposable2 = _interopRequireDefault(_Disposable);

var _object = require('./object/object');

var _object2 = _interopRequireDefault(_object);

var _string = require('./string/string');

var _string2 = _interopRequireDefault(_string);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _core2.default;
exports.core = _core2.default;
exports.array = _array2.default;
exports.async = _async2.default;
exports.Disposable = _Disposable2.default;
exports.object = _object2.default;
exports.string = _string2.default;
},{"./array/array":35,"./async/async":36,"./core":37,"./disposable/Disposable":38,"./object/object":40,"./string/string":41}],40:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var object = function () {
	function object() {
		_classCallCheck(this, object);
	}

	_createClass(object, null, [{
		key: 'mixin',

		/**
   * Copies all the members of a source object to a target object.
   * @param {Object} target Target object.
   * @param {...Object} var_args The objects from which values will be copied.
   * @return {Object} Returns the target object reference.
   */
		value: function mixin(target) {
			var key, source;
			for (var i = 1; i < arguments.length; i++) {
				source = arguments[i];
				for (key in source) {
					target[key] = source[key];
				}
			}
			return target;
		}

		/**
   * Returns an object based on its fully qualified external name.
   * @param {string} name The fully qualified name.
   * @param {object=} opt_obj The object within which to look; default is
   *     <code>window</code>.
   * @return {?} The value (object or primitive) or, if not found, undefined.
   */

	}, {
		key: 'getObjectByName',
		value: function getObjectByName(name, opt_obj) {
			var scope = opt_obj || window;
			var parts = name.split('.');
			return parts.reduce(function (part, key) {
				return part[key];
			}, scope);
		}

		/**
   * Returns a new object with the same keys as the given one, but with
   * their values set to the return values of the specified function.
   * @param {!Object} obj
   * @param {!function(string, *)} fn
   * @return {!Object}
   */

	}, {
		key: 'map',
		value: function map(obj, fn) {
			var mappedObj = {};
			var keys = Object.keys(obj);
			for (var i = 0; i < keys.length; i++) {
				mappedObj[keys[i]] = fn(keys[i], obj[keys[i]]);
			}
			return mappedObj;
		}

		/**
   * Checks if the two given objects are equal. This is done via a shallow
   * check, including only the keys directly contained by the 2 objects.
   * @return {boolean}
   */

	}, {
		key: 'shallowEqual',
		value: function shallowEqual(obj1, obj2) {
			if (obj1 === obj2) {
				return true;
			}

			var keys1 = Object.keys(obj1);
			var keys2 = Object.keys(obj2);
			if (keys1.length !== keys2.length) {
				return false;
			}

			for (var i = 0; i < keys1.length; i++) {
				if (obj1[keys1[i]] !== obj2[keys1[i]]) {
					return false;
				}
			}
			return true;
		}
	}]);

	return object;
}();

exports.default = object;
},{}],41:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var string = function () {
	function string() {
		_classCallCheck(this, string);
	}

	_createClass(string, null, [{
		key: 'caseInsensitiveCompare',

		/**
   * Compares the given strings without taking the case into account.
   * @param {string|number} str1
   * @param {string|number} str2
   * @return {number} Either -1, 0 or 1, according to if the first string is
   *     "smaller", equal or "bigger" than the second given string.
   */
		value: function caseInsensitiveCompare(str1, str2) {
			var test1 = String(str1).toLowerCase();
			var test2 = String(str2).toLowerCase();

			if (test1 < test2) {
				return -1;
			} else if (test1 === test2) {
				return 0;
			} else {
				return 1;
			}
		}

		/**
   * Removes the breaking spaces from the left and right of the string and
   * collapses the sequences of breaking spaces in the middle into single spaces.
   * The original and the result strings render the same way in HTML.
   * @param {string} str A string in which to collapse spaces.
   * @return {string} Copy of the string with normalized breaking spaces.
   */

	}, {
		key: 'collapseBreakingSpaces',
		value: function collapseBreakingSpaces(str) {
			return str.replace(/[\t\r\n ]+/g, ' ').replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, '');
		}

		/**
  * Escapes characters in the string that are not safe to use in a RegExp.
  * @param {*} str The string to escape. If not a string, it will be casted
  *     to one.
  * @return {string} A RegExp safe, escaped copy of {@code s}.
  */

	}, {
		key: 'escapeRegex',
		value: function escapeRegex(str) {
			return String(str).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').replace(/\x08/g, '\\x08');
		}

		/**
  * Returns a string with at least 64-bits of randomness.
  * @return {string} A random string, e.g. sn1s7vb4gcic.
  */

	}, {
		key: 'getRandomString',
		value: function getRandomString() {
			var x = 2147483648;
			return Math.floor(Math.random() * x).toString(36) + Math.abs(Math.floor(Math.random() * x) ^ Date.now()).toString(36);
		}

		/**
   * Calculates the hashcode for a string. The hashcode value is computed by
   * the sum algorithm: s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1]. A nice
   * property of using 31 prime is that the multiplication can be replaced by
   * a shift and a subtraction for better performance: 31*i == (i<<5)-i.
   * Modern VMs do this sort of optimization automatically.
   * @param {String} val Target string.
   * @return {Number} Returns the string hashcode.
   */

	}, {
		key: 'hashCode',
		value: function hashCode(val) {
			var hash = 0;
			for (var i = 0, len = val.length; i < len; i++) {
				hash = 31 * hash + val.charCodeAt(i);
				hash %= 0x100000000;
			}
			return hash;
		}

		/**
   * Replaces interval into the string with specified value, e.g.
   * `replaceInterval("abcde", 1, 4, "")` returns "ae".
   * @param {string} str The input string.
   * @param {Number} start Start interval position to be replaced.
   * @param {Number} end End interval position to be replaced.
   * @param {string} value The value that replaces the specified interval.
   * @return {string}
   */

	}, {
		key: 'replaceInterval',
		value: function replaceInterval(str, start, end, value) {
			return str.substring(0, start) + value + str.substring(end);
		}
	}]);

	return string;
}();

exports.default = string;
},{}],42:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _metalJsx = require("metal-jsx");

var _metalJsx2 = _interopRequireDefault(_metalJsx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// import Loader from './loader';
// import Result from './result';
// import Failure from './failure';
// import defaultBudget from '../data/budget';

var App = function (_JSXComponent) {
  _inherits(App, _JSXComponent);

  function App() {
    _classCallCheck(this, App);

    return _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).apply(this, arguments));
  }

  _createClass(App, [{
    key: "attached",
    value: function attached() {
      this.getTabCount();
      this.getTablist();
    }
  }, {
    key: "getTabCount",
    value: function getTabCount() {
      var _this2 = this;

      chrome.tabs.query({}, function (tabs) {
        _this2.setState({ tabCount: tabs.length });
      });
    }
  }, {
    key: "getTablist",
    value: function getTablist() {
      var _this3 = this;

      chrome.tabs.query({}, function (tabs) {
        _this3.setState({
          tabList: tabs
        });
      });
    }
  }, {
    key: "openTab",
    value: function openTab(tabID, windowID) {
      chrome.windows.update(windowID, { focused: true });
      chrome.tabs.update(tabID, { active: true });
    }
  }, {
    key: "closeTab",
    value: function closeTab(tabID) {
      chrome.tabs.remove(tabID);
      window.location.reload();
    }
  }, {
    key: "render",
    value: function render() {
      var _this4 = this;

      var tabs = this.tabList;

      if (tabs) {
        IncrementalDOM.elementOpen("div", null, null, "class", "tab-killer");
        IncrementalDOM.elementOpen("h4", null, null, "class", "tab-killer__title");
        IncrementalDOM.elementVoid("img", null, null, "src", "../images/icon-48.png", "alt", "");
        IncrementalDOM.text(" Number of tabs on this window: ");
        IncrementalDOM.elementOpen("strong");
        iDOMHelpers.renderArbitrary(this.tabCount);
        IncrementalDOM.elementClose("strong");
        IncrementalDOM.elementClose("h4");
        IncrementalDOM.elementOpen("ul", null, null, "class", "tab-killer__list");
        iDOMHelpers.renderArbitrary(tabs.map(function (tab, i) {
          return iDOMHelpers.jsxWrapper(function (_i, _ref, _tab$favIconUrl, _tab$title, _ref2) {
            IncrementalDOM.elementOpen("li", _i, ["key", _i, "class", "tab-killer__list-item"]);
            IncrementalDOM.elementOpen("a", null, null, "onClick", _ref, "class", "tab-killer__link", "href", "#");
            IncrementalDOM.elementVoid("img", null, null, "src", _tab$favIconUrl, "alt", "", "class", "tab-killer__favicon");
            IncrementalDOM.elementOpen("span");
            iDOMHelpers.renderArbitrary(_tab$title);
            IncrementalDOM.elementClose("span");
            IncrementalDOM.elementClose("a");
            IncrementalDOM.elementOpen("button", null, null, "onClick", _ref2, "class", "tab-killer__close");
            IncrementalDOM.text("\xD7");
            IncrementalDOM.elementClose("button");
            return IncrementalDOM.elementClose("li");
          }, [i, function () {
            return _this4.openTab(tab.id, tab.windowId);
          }, tab.favIconUrl, tab.title, function () {
            return _this4.closeTab(tab.id);
          }]);
        }));
        IncrementalDOM.elementClose("ul");
        return IncrementalDOM.elementClose("div");
      }
    }
  }]);

  return App;
}(_metalJsx2.default);

App.STATE = {
  tabCount: null,
  tabList: []
};

exports.default = App;

},{"metal-jsx":32}],43:[function(require,module,exports){
'use strict';

var _app = require('./app');

var _app2 = _interopRequireDefault(_app);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

new _app2.default({}, document.querySelector('#app'));

},{"./app":42}]},{},[43]);
