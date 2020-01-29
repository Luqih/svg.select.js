/*!
* svg.select.js - An extension of svg.js which allows to select elements with mouse
* @version 4.0.0
* https://github.com/svgdotjs/svg.select.js
*
* @copyright undefined
* @license MIT
*
* BUILT: Wed Jan 29 2020 14:26:34 GMT-0300 (Argentina Standard Time)
*/;
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function getMoseDownFunc(eventName, el) {
  return function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    var x = ev.pageX || ev.touches[0].pageX;
    var y = ev.pageY || ev.touches[0].pageY;
    console.log(eventName, {
      x: x,
      y: y,
      event: ev
    });
    el.fire(eventName, {
      x: x,
      y: y,
      event: ev
    });
  };
}

function allowSelection(svgJs) {
  var Element = svgJs.Element,
      extend = svgJs.extend,
      G = svgJs.G,
      Point = svgJs.Point;

  var SelectHandler =
  /*#__PURE__*/
  function () {
    function SelectHandler(el) {
      _classCallCheck(this, SelectHandler);

      console.log(el);
      this.el = el;
      el.remember('_selectHandler', this);
      this.selection = new G();
      this.order = this.getPointNames();
      this.orginalPoints = [];
      this.points = [];
      this.mutationHandler = this.mutationHandler.bind(this);
      this.observer = new window.MutationObserver(this.mutationHandler);
    }

    _createClass(SelectHandler, [{
      key: "init",
      value: function init() {
        this.mountSelection();
        this.updatePoints();
        this.createSelection();
        this.createResizeHandles();
        this.updateResizeHandles();
        this.createRotationHandle();
        this.updateRotationHandle();
        this.createShearHandle();
        this.updateShearHandle();
        this.observer.observe(this.el.node, {
          attributes: true
        });
      }
    }, {
      key: "getPointNames",
      value: function getPointNames() {
        return ['lt', 't', 'rt', 'r', 'rb', 'b', 'lb', 'l', 'rot', 'shear'];
      }
    }, {
      key: "active",
      value: function active(val) {
        // Disable selection
        if (!val) {
          this.selection.clear().remove();
          this.observer.disconnect();
          return;
        } // Enable selection


        this.init();
      }
    }, {
      key: "mountSelection",
      value: function mountSelection() {
        this.el.root().put(this.selection);
      }
    }, {
      key: "createSelection",
      value: function createSelection() {
        // First transform all points, then draw polygon out of it
        this.selection.polygon(this.points.slice(0, this.order.indexOf('rot')).map(function (el) {
          return [el.x, el.y];
        })).addClass('selection_border').fill('none');
      }
    }, {
      key: "updateSelection",
      value: function updateSelection() {
        this.selection.get(0).plot(this.points.slice(0, this.order.indexOf('rot')).map(function (el) {
          return [el.x, el.y];
        }));
      }
    }, {
      key: "createResizeHandles",
      value: function createResizeHandles() {
        var _this = this;

        this.points.slice(0, this.order.indexOf('rot')).forEach(function (p, index) {
          _this.selection.circle(10).addClass('selection_handle_' + _this.order[index]).on('mousedown.selection touchstart.selection', getMoseDownFunc(_this.order[index], _this.el));

          console.log(_this.order[index], _this.el);
        });
      }
    }, {
      key: "updateResizeHandles",
      value: function updateResizeHandles() {
        var _this2 = this;

        this.points.slice(0, this.order.indexOf('rot')).forEach(function (p, index) {
          _this2.selection.get(index + 1).center(p.x, p.y);
        });
      }
    }, {
      key: "createRotationHandle",
      value: function createRotationHandle() {
        var handle = this.selection.group().addClass('selection_handle_rot').on('mousedown.selection touchstart.selection', getMoseDownFunc('rot', this.el));
        handle.line();
        handle.circle(5);
      }
    }, {
      key: "updateRotationHandle",
      value: function updateRotationHandle() {
        var index = this.order.indexOf('rot');
        var topPoint = this.points[this.order.indexOf('t')];
        var rotPoint = this.points[index];
        var group = this.selection.get(index + 1);
        group.get(0).plot(topPoint.x, topPoint.y, rotPoint.x, rotPoint.y);
        group.get(1).center(rotPoint.x, rotPoint.y);
      }
    }, {
      key: "createShearHandle",
      value: function createShearHandle() {
        this.selection.rect(20, 5).addClass('selection_handle_shear').on('mousedown.selection touchstart.selection', getMoseDownFunc('shear', this.el));
      }
    }, {
      key: "updateShearHandle",
      value: function updateShearHandle() {
        var index = this.order.indexOf('shear');
        var shearPoint = this.points[index];
        var shearPoint2 = this.points[index + 1];
        this.selection.get(index + 1).move(shearPoint.x, shearPoint.y).untransform().rotate(this.el.transform('rotate'), shearPoint2.x, shearPoint2.y);
      }
    }, {
      key: "updatePoints",
      value: function updatePoints() {
        // Transform elements bounding box into correct space
        var parent = this.selection.parent(); // This is the matrix from the elements space to the space of the ui
        // const fromShapeToUiMatrix = this.el.screenCTM().multiplyO(parent.screenCTM().inverseO())

        var fromShapeToUiMatrix = parent.screenCTM().inverseO().multiplyO(this.el.screenCTM());
        this.orginalPoints = this.getPoints();
        this.points = this.orginalPoints.map(function (p) {
          return p.transform(fromShapeToUiMatrix);
        });
        this.points.map(function (p, i) {
          return console.log(i === 0 && p);
        });
      }
    }, {
      key: "getPoints",
      value: function getPoints() {
        var _this$el$bbox = this.el.bbox(),
            x = _this$el$bbox.x,
            x2 = _this$el$bbox.x2,
            y = _this$el$bbox.y,
            y2 = _this$el$bbox.y2,
            cx = _this$el$bbox.cx,
            cy = _this$el$bbox.cy; // A collection of all the points we need to draw our ui


        return [new Point(x, y), new Point(cx, y), new Point(x2, y), new Point(x2, cy), new Point(x2, y2), new Point(cx, y2), new Point(x, y2), new Point(x, cy), new Point(cx, y - 20), new Point(x2 - 20, y - 5), new Point(x2, y - 5)];
      }
    }, {
      key: "mutationHandler",
      value: function mutationHandler() {
        this.updatePoints();
        this.updateSelection();
        this.updateResizeHandles();
        this.updateRotationHandle();
        this.updateShearHandle();
      }
    }]);

    return SelectHandler;
  }();

  extend(Element, {
    // Select element with mouse
    selectize: function selectize() {
      var enabled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var selectHandler = this.remember('_selectHandler');

      if (!selectHandler) {
        if (enabled.prototype instanceof SelectHandler) {
          /* eslint new-cap: ["error", { "newIsCap": false }] */
          selectHandler = new enabled(this);
          enabled = true;
        } else {
          selectHandler = new SelectHandler(this);
        }

        this.remember('_selectHandler', selectHandler);
      }

      selectHandler.active(enabled);
      return this;
    }
  });
  return SelectHandler;
}

export default allowSelection;
//# sourceMappingURL=svg.select.js.map
