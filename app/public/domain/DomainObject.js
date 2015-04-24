/**
 * All domain objects should implement
 * this class
 */
var DomainObject = function () {
  this.duration = 1000;     // the duration of animations
  this.group = null;        // the container d3 element for the object
  this.events = {};         // an object for tracking events
  this.eventIdCounter = 0;  // see addEventListener for more details
};

/**
 * Set the duration for d3 transitions
 */
DomainObject.prototype.setTransitionDuration = function (duration) {
  this.duration = 1000;
};

/**
 * Verifies that the domain object has set the
 * various required properties
 */
DomainObject.prototype.checkInterface = function () {
  if (!this._type)
    throw "All domain objects should set the `_type` property.  Otherwise, errors will be hard to trace.";

  var noComply = "The " + this._type + " class does not comply.";

  if (!this.group)
    throw "All domain objects must set the `group` property! " + noComply;

  if (!this.setXY)
    throw "All domain objects must set the `setXY` method! " + noComply;

  if (!this._addEvent)
    throw "All domain objects must set the `_addEvent` method! " + noComply;

  if (!this._removeEvent)
    throw "All domain objects must set the `_removeEvent` method! " + noComply;
};

/**
 * Hides the domain object
 */
DomainObject.prototype.hide = function () {

  this.checkInterface();
  this.group
    .transition('showhide')
    .duration(this.duration)
    .attr('opacity', '0');
};

/**
 * Shows the domain object
 */
DomainObject.prototype.show = function () {

  this.checkInterface();
  this.group
    .transition('showhide')
    .duration(this.duration)
    .attr('opacity', '1');
};

/**
 * Remove the domain object
 */
DomainObject.prototype.remove = function () {
  return this.group.remove();
};

/**
 * Sets the coordinates of the object
 */
DomainObject.prototype.setXY = function (x, y) {
  this.checkInterface();
};

/**
 * Adds event listener to the object.  The odd method of storing
 * callback references is because d3 only allows one
 * callback per event, but you can namespace events.
 * For example, the events 'click', and 'click.a' 
 * will both fire when on a click.
 */
DomainObject.prototype.addEventListener = function (event, callback) {
  this.checkInterface();

  // store the reference to the event
  var eventStr = event + '.' + this.eventIdCounter;
  if (!this.events[event])
    this.events[event] = {};
  this.events[event][callback] = eventStr;
  this.eventIdCounter += 1;

  // add the listeners to the d3 elements
  this._addEvent(event, eventStr, callback);
};

/**
 * Remove event listener from the object. See the description for 
 * addEventListener to understand the oddities in adding the event.
 */
DomainObject.prototype.removeEventListener = function (event, callback) {
  this.checkInterface();

  // retrieve the reference to the event
  var eventStr = this.events[event][callback];

  // remove listeners from d3 elements
  this._removeEvent(event, eventStr, callback);
};

module.exports = DomainObject;