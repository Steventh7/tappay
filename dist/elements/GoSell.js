"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _mobxReact = require("mobx-react");

var _paths = require("../../webpack/paths");

var _paths2 = _interopRequireDefault(_paths);

var _RootStore = require("../store/RootStore.js");

var _RootStore2 = _interopRequireDefault(_RootStore);

var _TapLoader = require("./TapLoader");

var _TapLoader2 = _interopRequireDefault(_TapLoader);

// require("../assets/css/style.css");

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called",
    );
  }
  return call && (typeof call === "object" || typeof call === "function")
    ? call
    : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError(
      "Super expression must either be null or a function, not " +
        typeof superClass,
    );
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true,
    },
  });
  if (superClass)
    Object.setPrototypeOf
      ? Object.setPrototypeOf(subClass, superClass)
      : (subClass.__proto__ = superClass);
}

var GoSell = (function (_Component) {
  _inherits(GoSell, _Component);

  _createClass(GoSell, null, [
    {
      key: "openLightBox",

      //open Tap gateway as a light box by JS library
      value: function openLightBox() {
        _RootStore2.default.uIStore.setMode("popup");
        _RootStore2.default.uIStore.setOpenModal(true);
        _RootStore2.default.uIStore.setLoader(true);

        var body = document.getElementsByTagName("BODY")[0];
        body.classList.add("gosell-payment-gateway-open");

        setTimeout(function () {
          var iframe = document.getElementById("gosell-gateway");

          iframe.addEventListener("load", function () {
            setTimeout(function () {
              _RootStore2.default.uIStore.setLoader(false);
            }, 500);
          });
        }, 100);
      },

      //redirect to Tap gateway from JS library without calling charge / authrorize API from merchant side
    },
    {
      key: "openPaymentPage",
      value: function openPaymentPage() {
        _RootStore2.default.uIStore.setMode("page");
        _RootStore2.default.uIStore.setOpenModal(true);
        _RootStore2.default.uIStore.setLoader(true);

        if (_RootStore2.default.configStore.token != null) {
          window.open(
            _paths2.default.framePath +
              "?mode=" +
              _RootStore2.default.uIStore.modalMode +
              "&token=" +
              _RootStore2.default.configStore.token,
            "_self",
          );
        }
      },
    },
    {
      key: "showResult",
      value: function showResult(props) {
        var URLSearchParams = require("@ungap/url-search-params/cjs");
        var urlParams = new URLSearchParams(window.location.search);

        if (urlParams.has("tap_id") && urlParams.has("token")) {
          var callback = null;

          if (props.gateway && props.gateway.callback) {
            callback = props.gateway.callback;
          } else if (props.callback) {
            callback = props.callback;
          }

          _RootStore2.default.configStore.callback = callback;

          _RootStore2.default.uIStore.setMode("popup");
          _RootStore2.default.uIStore.setOpenModal(true);
          _RootStore2.default.uIStore.setLoader(true);

          var body = document.getElementsByTagName("BODY")[0];
          body.classList.add("gosell-payment-gateway-open");

          _RootStore2.default.uIStore.tap_id = urlParams.get("tap_id");
          _RootStore2.default.configStore.token = urlParams.get("token");
          _RootStore2.default.uIStore.modalMode = urlParams.get("mode");

          setTimeout(function () {
            var iframe = document.getElementById("gosell-gateway");

            iframe.addEventListener("load", function () {
              // console.log("hey loaded!");
              setTimeout(function () {
                _RootStore2.default.uIStore.setLoader(false);
              }, 500);
            });
          }, 100);

          return true;
        } else {
          return false;
        }
      },
    },
  ]);

  function GoSell(props) {
    _classCallCheck(this, GoSell);

    var _this = _possibleConstructorReturn(
      this,
      (GoSell.__proto__ || Object.getPrototypeOf(GoSell)).call(this, props),
    );

    _this.state = {
      tap_id: null,
      config: {},
    };
    return _this;
  }

  _createClass(
    GoSell,
    [
      {
        key: "componentDidMount",
        value: function componentDidMount() {
          GoSell.showResult(this.props);

          setTimeout(function () {
            var iframe = document.getElementById("gosell-gateway");

            iframe &&
              iframe.addEventListener("load", function () {
                setTimeout(function () {
                  _RootStore2.default.uIStore.setLoader(false);
                }, 500);
              });
          }, 100);

          this.callbacks();
        },
      },
      {
        key: "callbacks",
        value: function callbacks() {
          var self = this;
          // Create IE + others compatible event handler
          var eventMethod = window.addEventListener
            ? "addEventListener"
            : "attachEvent";
          var eventer = window[eventMethod];
          var messageEvent =
            eventMethod == "attachEvent" ? "onmessage" : "message";

          // Listen to message from child window
          eventer(
            messageEvent,
            function (e) {
              // console.log("event", e.data);

              if (e.data.callback) {
                if (
                  self.props &&
                  self.props.callback &&
                  self.props.callback != null
                ) {
                  self.props.callback(e.data);
                } else {
                  _RootStore2.default.configStore.callbackFunc(e.data);
                }
              }

              if (e.data == "close" || e.data.close) {
                _RootStore2.default.uIStore.setOpenModal(false);
                self.setState({ config: {} });
                self.props = {};

                _RootStore2.default.configStore.gateway.onClose
                  ? _RootStore2.default.configStore.gateway.onClose()
                  : null;
                e.data == "close"
                  ? self.closeModal(
                      _RootStore2.default.configStore.redirect_url,
                    )
                  : self.closeModal(e.data.close);
              }
            },
            false,
          );
        },
      },
      {
        key: "closeModal",
        value: function closeModal(closeUrl) {
          var URLSearchParams = require("@ungap/url-search-params/cjs");

          var urlParams = new URLSearchParams(window.location.search);

          if (urlParams.has("tap_id")) {
            window.open(closeUrl, "_self");
          }

          var body = document.getElementsByTagName("BODY")[0];
          body.classList.remove("gosell-payment-gateway-open");

          // var iframe = document.getElementById("gosell-gateway");
          // iframe.setAttribute("src", iframe.getAttribute("src"));

          _RootStore2.default.uIStore.setOpenModal(false);
          _RootStore2.default.uIStore.setLoader(true);
        },
      },
      {
        key: "componentWillUnMount",
        value: function componentWillUnMount() {
          // Create IE + others compatible event handler
          this.callbacks();
        },
      },
      {
        key: "render",
        value: function render() {
          return _react2.default.createElement(
            _react2.default.Fragment,
            null,
            _RootStore2.default.uIStore.modalMode == "popup" &&
              _RootStore2.default.uIStore.openModal
              ? _react2.default.createElement("iframe", {
                  id: "gosell-gateway",
                  style: {
                    display: !_RootStore2.default.uIStore.isLoading
                      ? "block"
                      : "none",
                    position: "absolute",
                    top: "0",
                    bottom: "0",
                    left: "0",
                    right: "0",
                    margin: "auto",
                    border: "0px",
                    zIndex: "99999999999999999",
                  },
                  src:
                    _RootStore2.default.uIStore.tap_id != null &&
                    _RootStore2.default.configStore.token != null
                      ? _paths2.default.framePath +
                        "?mode=" +
                        _RootStore2.default.uIStore.modalMode +
                        "&token=" +
                        _RootStore2.default.configStore.token +
                        "&tap_id=" +
                        _RootStore2.default.uIStore.tap_id
                      : _paths2.default.framePath +
                        "?mode=" +
                        _RootStore2.default.uIStore.modalMode +
                        "&token=" +
                        _RootStore2.default.configStore.token,
                  width: "100%",
                  height: "100%",
                })
              : null,
            _RootStore2.default.uIStore.openModal
              ? _react2.default.createElement(_TapLoader2.default, {
                  type: "loader",
                  color: "white",
                  store: _RootStore2.default,
                  status: _RootStore2.default.uIStore.isLoading,
                  duration: 5,
                  title: null,
                  desc: null,
                })
              : null,
          );
        },
      },
    ],
    [
      {
        key: "getDerivedStateFromProps",
        value: function getDerivedStateFromProps(nextProps, prevState) {
          // console.log("new props: ", JSON.stringify(nextProps));
          // console.log("old props: ", JSON.stringify(prevState.config));
          // console.log(
          //   "compare props: ",
          //   JSON.stringify(nextProps) != JSON.stringify(prevState.config),
          // );

          if (JSON.stringify(nextProps) != JSON.stringify(prevState.config)) {
            GoSell.config(nextProps);
            prevState.config = nextProps;
          }

          return null;
        },
      },
      {
        key: "config",
        value: function config(props) {
          var URLSearchParams = require("@ungap/url-search-params/cjs");
          var urlParams = new URLSearchParams(window.location.search);

          if (!urlParams.has("tap_id")) {
            _RootStore2.default.configStore.setConfig(props, "GOSELL");
          }
        },
      },
    ],
  );

  return GoSell;
})(_react.Component);

exports.default = (0, _mobxReact.observer)(GoSell);
