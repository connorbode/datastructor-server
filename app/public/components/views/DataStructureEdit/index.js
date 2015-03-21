var React           = require('react/addons');
var StructureStore  = require('../../../stores/StructureStore');
var CodeMirror      = require('codemirror');
var cx              = React.addons.classSet;
require('codemirror/mode/javascript/javascript');

var _editorElem;
var _containerElem;
var _newOperationElem;
var _codeMirrorObj;

module.exports = React.createClass({
  getInitialState: function () {
    return {
      structure:      {},    // the loaded data structure
      nameOperation:  false  // whether the user has initiated naming a new operation
    };
  },

  setCodeMirrorSize: function () {
    var offsetTop;
    var computedStyle;
    var containerHeight;
    var containerWidth;

    computedStyle   = window.getComputedStyle(_editorElem);
    offsetTop       = parseInt(computedStyle.getPropertyValue('top').replace(/px/, ''));
    containerHeight = _containerElem.scrollHeight;
    containerWidth  = _containerElem.scrollWidth;

    _codeMirrorObj.setSize(containerWidth, containerHeight - 2 * offsetTop);
  },

  getCodeMirrorValue: function () {
    var value = _codeMirrorObj.getDoc().getValue();
    var parsed = value ? JSON.parse(value) : {};
    var state = this.state;
    if (state.edit === 'initialization') {
      state.structure.initialization = parsed.initialization;
      state.structure.validation     = parsed.validation;
      this.setState(state);
    }
  },

  setCodeMirrorValue: function (val) {
    _codeMirrorObj.getDoc().setValue(JSON.stringify(val, null, 2));
  },

  handleSelectOperation: function (index) {
    var op = this.state.structure.operations[index];
    var state = this.state;
    var val = {
      validation: op.validation,
      operation:  op.operation
    };
    state.edit = index;
    this.setState(state);
    this.setCodeMirrorValue(val);
  },

  handleSelectInitialization: function () {
    var state = this.state;
    var val;
    this.getCodeMirrorValue();
    val = {
      validation: this.state.structure.validation,
      operation: this.state.structure.initialization
    };
    state.edit = "initialization";
    this.setState(state);
    this.setCodeMirrorValue(val);
  },

  handleAddOperationClick: function () {
    var state = this.state;
    state.nameOperation = true;
    this.setState(state);
    _newOperationElem.focus();
  },

  handleNewOperationBlur: function () {
    var opName = _newOperationElem.value;
    var state = this.state;
    if (opName) {
      state.structure.operations.push({
        name: opName,
        validation: {},
        operation: function (data) {}
      });
      _newOperationElem.value = '';
    }
    state.nameOperation = false;
    this.setState(state);
  },

  handleStructureChange: function () {
    var state = this.state;
    state.structure = StructureStore.getStructure();
    this.setState(state);
    this.handleSelectInitialization();
  },

  buildOperations: function () {
    if (!this.state.structure.operations) return null;
    return this.state.structure.operations.map(function (operation, index) {
      var arrowClass = cx({
        "fa":                     true,
        "fa-arrow-circle-right":  true,
        "hide":                   !operation.selected
      });
      return (
        <li className="clickable" onClick={this.handleSelectOperation.bind(this, index)}>
          <i className={arrowClass}></i>
          <span>{operation.name}</span>
        </li>
      );
    }.bind(this));
  },

  componentDidMount: function () {

    // build editor
    _editorElem       = document.getElementById('editor');
    _containerElem    = document.getElementById('editor-container');
    _newOperationElem = document.getElementById('new-operation');
    _codeMirrorObj = CodeMirror(_editorElem, {
      lineNumbers:  true,
      theme:        'monokai',
      extraKeys: {
        Tab: function (cm) {
          cm.replaceSelection("  ", "end");
        }
      }
    });
    this.setCodeMirrorSize(); 

    // watch for window resize
    window.addEventListener('resize', this.setCodeMirrorSize);

    // watch for structure to be loaded
    StructureStore.addChangeListener(this.handleStructureChange);
  },

  componentWillUnmount: function () {
    StructureStore.removeChangeListener(this.handleStructureChange);
  },

  render: function () {

    console.log(this.state.edit);

    var newOperationClass = cx({
      clickable:  true,
      hide:       !this.state.nameOperation
    });
    var initializationClass = cx({
      "clickable":  true,
      "bold":       this.state.edit === "initialization"
    });
    return (
      <div id="editor-container" className="structure-edit">
        <h1>{this.state.structure.name}</h1>
        <div id="editor" className="editor"></div>
        <div className="operations">
          <h2>
            <span>operations</span>
            <i className="fa fa-plus-circle" onClick={this.handleAddOperationClick}></i>
          </h2>
          <ul>
            <li className={initializationClass} onClick={this.handleSelectInitialization}>
              initialization
            </li>
            {this.buildOperations()}
            <li className={newOperationClass}>
              <input id="new-operation" type="text" placeholder="operation name" tabIndex="-1" onBlur={this.handleNewOperationBlur}/>
            </li>
          </ul>
        </div>
      </div>
    );
  }
});