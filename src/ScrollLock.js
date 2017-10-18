const React = require("react");
const PropTypes = require("prop-types");
const createClass = require("create-react-class");

/*
	NOTES

	1. Stop content jumping around when overflow is hidden on the body.
	2. Mobile Safari ignores { overflow: hidden } declaration on the body.
	3. Allow scroll on provided target.
*/

const listenerOptions = { capture: false, passive: false };
const ScrollLock = createClass({
  propTypes: {
    scrollTarget: PropTypes.object,
    preventContentJumping: PropTypes.bool
  },
  componentDidMount() {
    if (!canUseDom()) return;

    const scrollTarget = this.props.scrollTarget;
    const target = document.body;

    if (this.props.preventContentJumping) {
      const scrollbarWidth = window.innerWidth - document.body.clientWidth; // 1.

      target.style.paddingRight = `${scrollbarWidth}px`;
    }
    target.style.overflowY = "hidden";

    target.addEventListener(
      "touchmove",
      this.preventTouchMove,
      listenerOptions
    ); // 2.

    if (scrollTarget) {
      scrollTarget.addEventListener(
        "touchstart",
        preventInertiaScroll,
        listenerOptions
      ); // 3.
      scrollTarget.addEventListener(
        "touchmove",
        allowTouchMove,
        listenerOptions
      ); // 3.
    }
  },

  preventTouchMove(e) {
    if (this.props.except.classes.find(x => x === e.target.className)) {
      return;
    }
    e.preventDefault();
  },

  componentWillUnmount() {
    if (!canUseDom()) return;

    const scrollTarget = this.props.scrollTarget;
    const target = document.body;

    if (this.props.preventContentJumping) {
      target.style.paddingRight = "";
    }
    target.style.overflowY = "";

    target.removeEventListener(
      "touchmove",
      this.preventTouchMove,
      listenerOptions
    );

    if (scrollTarget) {
      scrollTarget.removeEventListener(
        "touchstart",
        preventInertiaScroll,
        listenerOptions
      );
      scrollTarget.removeEventListener(
        "touchmove",
        allowTouchMove,
        listenerOptions
      );
    }
  },
  render() {
    return null;
  }
});

ScrollLock.defaultProps = {
  preventContentJumping: true
};

function allowTouchMove(e) {
  e.stopPropagation();
}

function preventInertiaScroll() {
  const top = this.scrollTop;
  const totalScroll = this.scrollHeight;
  const currentScroll = top + this.offsetHeight;

  if (top === 0) {
    this.scrollTop = 1;
  } else if (currentScroll === totalScroll) {
    this.scrollTop = top - 1;
  }
}

function canUseDom() {
  return !!(
    typeof window !== "undefined" &&
    window.document &&
    window.document.createElement
  );
}

module.exports = ScrollLock;
