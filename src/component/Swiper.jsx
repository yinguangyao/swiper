/* React Swiper
 * By gyyin
 */
import React from 'react'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import './Swiper.scss'

const { Component } = React
class Swiper extends React.Component {
    constructor(props) {
        super(props);
        this.browser = {
            addEventListener: !!window.addEventListener,
            touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
            transitions: (function (temp) {
                var props = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
                for (var i in props) if (temp.style[props[i]] !== undefined) return true;
                return false;
            })(document.createElement('swipe'))
        };
        this.state = {
            slidePos: [],
            isScrolling: undefined,
            index: 0
        }
        this.width = 0; // width
        this.element = null; // container元素
        this.slides = null; // children
        this.delay = 0;
        this.interval;
        this.start = {};
        this.delta = {};
        this.speed = 0;
        this.replay;
    }
    componentDidMount() {
        this.setup();
    }
    // remove all events
    componentWillUnmount() {
        window.removeEventListener("touchStart", this.touchStart);
        window.removeEventListener("touchMove", this.touchMove);
        window.removeEventListener("touchEnd", this.touchEnd);
    }
    offloadFn(fn) {
        const noop = () => { }
        setTimeout(fn || noop, 0)
    }
    setup() { // some options
        const { startSlide, speed, continuous, auto } = this.props
        // determine width of each slide
        let container = this.refs.swiper;
        this.element = container.children[0];
        this.width = container.getBoundingClientRect().width || container.offsetWidth;
        // init some data
        this.slides = this.element.children;
        this.speed = speed || 300;
        this.delay = auto || 0;
        // set width of element
        this.element.style.width = (this.slides.length * this.width) + 'px';
        // create an array to store current positions of each slide
        this.setState({
            slidePos: new Array(this.slides.length),
            index: parseInt(startSlide, 10) || 0
        }, () => {
            //special case if two slides
            if (this.browser.transitions && continuous && this.slides.length < 3) {
                this.element.appendChild(this.slides[0].cloneNode(true));
                this.element.appendChild(this.element.children[1].cloneNode(true));
                this.slides = this.element.children;
                this.element.style.width = (this.slides.length * this.width) + 'px';
            }

            // stack elements
            let pos = this.slides.length;
            let { index } = this.state
            while (pos--) {

                let slide = this.slides[pos];

                slide.style.width = this.width + 'px';
                slide.setAttribute('data-index', pos);

                if (this.browser.transitions) {
                    slide.style.left = (pos * -this.width) + 'px';
                    this.move(pos, index > pos ? -this.width : (index < pos ? this.width : 0), 0);
                }
            }

            // reposition elements before and after index
            if (continuous && this.browser.transitions) {
                this.move(this.circle(index - 1), -this.width, 0);
                this.move(this.circle(index + 1), this.width, 0);
            }

            if (!this.browser.transitions) this.element.style.left = (index * -this.width) + 'px';
            // start auto slideshow if applicable
            if (this.delay) this.begin();
            container.style.visibility = 'visible';
        })
    }
    prev() {
        const { continuous } = this.props
        const { index } = this.state
        if (continuous) this.slide(index - 1);
        else if (index) this.slide(index - 1);
    }
    next() {
        const { continuous } = this.props
        const { index } = this.state
        if (continuous) this.slide(index + 1);
        else if (index < this.slides.length - 1) this.slide(index + 1);
    }
    circle(index) {
        return (this.slides.length + (index % this.slides.length)) % this.slides.length;
    }
    slide(to, slideSpeed) {
        let {
            browser,
            props,
            state,
            slides,
            width
        } = this
        let { slidePos, index } = state
        let {
            continuous,
            speed,
            callback
        } = props
        // do nothing if already on requested slide
        if (index == to) return;

        if (browser.transitions) {

            var direction = Math.abs(index - to) / (index - to); // 1: backward, -1: forward

            // get the actual position of the slide
            if (continuous) {
                var natural_direction = direction;
                direction = -slidePos[this.circle(to)] / width;

                // if going forward but to < index, use to = slides.length + to
                // if going backward but to > index, use to = -slides.length + to
                if (direction !== natural_direction) to = -direction * slides.length + to;

            }

            var diff = Math.abs(index - to) - 1;

            // move all the slides between index and to in the right direction
            while (diff--) this.move(this.circle((to > index ? to : index) - diff - 1), width * direction, 0);

            to = this.circle(to);

            this.move(index, width * direction, slideSpeed || speed);
            this.move(to, 0, slideSpeed || speed);

            if (continuous) this.move(this.circle(to - direction), -(width * direction), 0); // we need to get the next in place

        } else {

            to = this.circle(to);
            this.animate(index * -width, to * -width, slideSpeed || speed);
            //no fallback for a circular continuous if the browser does not accept transitions
        }
        this.setState({
            index: to
        }, () => {
            this.offloadFn(callback && callback(index, slides[index]));
        })
    }
    move(index, dist, speed) {
        let slidePos = this.state.slidePos;
        slidePos[index] = dist
        this.translate(index, dist, speed);
        this.setState({
            slidePos: slidePos
        })
    }
    translate(index, dist, speed) {

        var slide = this.slides[index];
        var style = slide && slide.style;

        if (!style) return;

        style.webkitTransitionDuration =
            style.MozTransitionDuration =
            style.msTransitionDuration =
            style.OTransitionDuration =
            style.transitionDuration = speed + 'ms';

        style.webkitTransform = 'translate(' + dist + 'px, 0)' + 'translateZ(0)';
        style.msTransform =
            style.MozTransform =
            style.OTransform = 'translate(' + dist + 'px, 0)' + 'translateZ(0)';

    }
    animate(from, to, speed) {
        let {
            props,
            delay,
            slides
        } = this
        const { transitionEnd } = props
        const { index } = this.state
        // if not an animation, just reposition
        if (!speed) {

            this.element.style.left = to + 'px';
            return;

        }

        var start = +new Date;

        var timer = setInterval(() => {

            var timeElap = +new Date - start;

            if (timeElap > speed) {

                this.element.style.left = to + 'px';

                if (delay) this.begin();

                transitionEnd && transitionEnd.call(event, index, slides[index]);

                clearInterval(timer);
                return;

            }

            this.element.style.left = (((to - from) * (Math.floor((timeElap / speed) * 100) / 100)) + from) + 'px';

        }, 4);

    }
    begin() {

        this.interval = setTimeout(() => { this.next() }, this.delay);

    }
    stop() {
        this.delay = 0;
        clearTimeout(this.interval);
    }
    touchStart(event) {

        var touches = event.touches[0];

        // measure start values
        this.start = {

            // get initial touch coords
            x: touches.pageX,
            y: touches.pageY,

            // store time to determine touch duration
            time: +new Date

        };
        // used for testing first move event
        this.setState({
            isScrolling: undefined
        })
        // reset delta and end measurements
        this.delta = {};
    }
    touchMove(event) {
        let {
                props,
            start,
            state,
            slides,
            width
            } = this
        let { slidePos, isScrolling, index } = state
        // ensure swiping with one touch and not pinching
        if (event.touches.length > 1 || event.scale && event.scale !== 1) return

        if (props.disableScroll) event.preventDefault();

        var touches = event.touches[0];

        // measure change in x and y
        this.delta = {
            x: touches.pageX - start.x,
            y: touches.pageY - start.y
        }

        // determine if scrolling test has run - one time test
        if (typeof isScrolling == 'undefined') {
            this.setState({
                isScrolling: !!(isScrolling || Math.abs(this.delta.x) < Math.abs(this.delta.y))
            })
        }

        // if user is not trying to scroll vertically
        if (!isScrolling) {

            // prevent native scrolling
            event.preventDefault();

            // stop slideshow
            this.stop();

            // increase resistance if first or last slide
            if (props.continuous) { // we don't add resistance at the end

                this.translate(this.circle(index - 1), this.delta.x + slidePos[this.circle(index - 1)], 0);
                this.translate(index, this.delta.x + slidePos[index], 0);
                this.translate(this.circle(index + 1), this.delta.x + slidePos[this.circle(index + 1)], 0);

            } else {

                this.delta.x =
                    this.delta.x /
                    ((!index && this.delta.x > 0               // if first slide and sliding left
                        || index == slides.length - 1        // or if last slide and sliding right
                        && this.delta.x < 0                       // and if sliding at all
                    ) ?
                        (Math.abs(this.delta.x) / width + 1)      // determine resistance level
                        : 1);                                 // no resistance if false

                // translate 1:1
                this.translate(index - 1, this.delta.x + slidePos[index - 1], 0);
                this.translate(index, this.delta.x + slidePos[index], 0);
                this.translate(index + 1, this.delta.x + slidePos[index + 1], 0);
            }

        }

    }
    touchEnd(event) {
        let {
            props,
            start,
            width,
            slides,
            speed
            } = this
        let { slidePos, isScrolling, index } = this.state
        // measure duration
        var duration = +new Date - start.time;
        // determine if slide attempt triggers next/prev slide
        var isValidSlide =
            Number(duration) < 250               // if slide duration is less than 250ms
            && Math.abs(this.delta.x) > 20            // and if slide amt is greater than 20px
            || Math.abs(this.delta.x) > width / 2;      // or if slide amt is greater than half the width

        // determine if slide attempt is past start and end
        var isPastBounds =
            !index && this.delta.x > 0                            // if first slide and slide amt is greater than 0
            || index == slides.length - 1 && this.delta.x < 0;    // or if last slide and slide amt is less than 0

        if (props.continuous) isPastBounds = false;

        // determine direction of swipe (true:right, false:left)
        var direction = this.delta.x < 0;
        this.delay = props.auto;
        // if not scrolling vertically
        if (!isScrolling) {

            if (isValidSlide && !isPastBounds) {

                if (direction) {

                    if (props.continuous) { // we need to get the next in this direction in place

                        this.move(this.circle(index - 1), -width, 0);
                        this.move(this.circle(index + 2), width, 0);

                    } else {
                        this.move(index - 1, -width, 0);
                    }

                    this.move(index, slidePos[index] - width, speed);
                    this.move(this.circle(index + 1), slidePos[this.circle(index + 1)] - width, speed);
                    this.setState({
                        index: this.circle(index + 1)
                    }, () => {
                        props.callback && props.callback(this.state.index, slides[this.state.index]);
                    })

                } else {
                    if (props.continuous) { // we need to get the next in this direction in place

                        this.move(this.circle(index + 1), width, 0);
                        this.move(this.circle(index - 2), -width, 0);

                    } else {
                        this.move(index + 1, width, 0);
                    }

                    this.move(index, slidePos[index] + width, speed);
                    this.move(this.circle(index - 1), slidePos[this.circle(index - 1)] + width, speed);
                    this.setState({
                        index: this.circle(index - 1)
                    }, () => {
                        props.callback && props.callback(this.state.index, slides[this.state.index]);
                    })

                }

            } else {

                if (props.continuous) {

                    this.move(this.circle(index - 1), -width, speed);
                    this.move(index, 0, speed);
                    this.move(this.circle(index + 1), width, speed);

                } else {

                    this.move(index - 1, -width, speed);
                    this.move(index, 0, speed);
                    this.move(index + 1, width, speed);
                }

            }

        }

    }
    transitionEnd(event) {
        const { index } = this.state
        if (parseInt(event.target.getAttribute('data-index'), 10) == index) {

            if (this.delay) this.begin();

            this.props.transitionEnd && this.props.transitionEnd.call(event, index, this.slides[index]);

        }

    }
    renderDots() {
        const { slidePos, index } = this.state
        return (
            <div className="swiper-dot">
                {
                    slidePos.map((item, i) => {
                        return <span key={i} className={classnames({ "cur": index == i })}></span>
                    })
                }
            </div>
        )
    }
    render() {
        const { children } = this.props
        return (
            <div className="swiper" ref="swiper">
                <div
                    className="swiper-wrap"
                    onTouchStart={(e) => this.touchStart(e)}
                    onTouchMove={(e) => this.touchMove(e)}
                    onTouchEnd={(e) => this.touchEnd(e)}
                    onTransitionEnd={(e) => this.offloadFn(this.transitionEnd(e))}
                >
                    {children}
                </div>
                {children && children.length > 1 ? this.renderDots() : null}
            </div>
        )
    }
}
Swiper.defaultProps = {
    startSlide: 0,
    continuous: true,
    speed: 1000,
    auto: 300,
    disableScroll: false,
    transitionEnd: function () { },
    callback: function () { }
}
Swiper.propTypes = {
    startSlide: PropTypes.number,
    continuous: PropTypes.bool,
    speed: PropTypes.number,
    auto: PropTypes.number,
    disableScroll: PropTypes.bool,
    transitionEnd: PropTypes.func,
    callback: PropTypes.func
}
export default Swiper
