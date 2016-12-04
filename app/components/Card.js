import React, {Component, PropTypes} from 'react';

import {
    Text,
    View,
    Animated,
    PanResponder,
    TouchableWithoutFeedback,
} from 'react-native';

const SWIPE_THRESHOLD = 100;

function clamp(value, min, max) {
    return min < max
        ? (value < min ? min : value > max ? max : value)
        : (value < max ? max : value > min ? min : value);
}

export default class Card extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pan: new Animated.ValueXY(),
            scale: new Animated.Value(1),
            rotation: new Animated.Value(0),
            translation: new Animated.ValueXY(),

            isFlipped: props.isFlipped,
            isFlipping: false,
            isTranslating: false,
        };
    }

    componentWillMount() {
        const {onSwipedOut, animateEntrance} = this.props;
        const {pan, scale, rotation} = this.state;

        this.panResponder = PanResponder.create({
            onMoveShouldSetResponderCapture: () => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => (
                gestureState.dx !== 0 && gestureState.dy !== 0
            ),

            onPanResponderGrant: (e, gestureState) => {
                this.setState({isTranslating: false});
                pan.setOffset({x: pan.x._value, y: pan.y._value});
                pan.setValue({x: 500, y: 500});
            },

            onPanResponderMove: Animated.event([
                null, {dx: pan.x, dy: pan.y},
            ]),

            onPanResponderRelease: (e, {vx, vy}) => {
                const swipeTreashold = pan.x._value;
                let velocity;

                pan.flattenOffset();

                if (vx >= 0) {
                    velocity = clamp(vx, 3, 5);
                } else if (vx < 0) {
                    velocity = clamp(vx * -1, 3, 5) * -1;
                }

                if (Math.abs(swipeTreashold) > SWIPE_THRESHOLD) {
                    Animated.decay(pan, {
                        velocity: {x: velocity, y: vy},
                        deceleration: 0.98,
                    }).start(() => {
                        this.setState({isFlipped: false});
                        rotation.setValue(0);

                        if (typeof onSwipedOut === 'function') {
                            onSwipedOut(swipeTreashold > 0);
                        }

                        if (typeof animateEntrance === 'function') {
                            animateEntrance(pan, scale);
                        } else {
                            pan.setValue({x: 0, y: 0});
                            scale.setValue(0.98);
                        }
                    });
                } else {
                    Animated.spring(pan, {
                        toValue: {x: 0, y: 0},
                        friction: 4,
                    }).start();
                }
            },
        });
    }

    flip(isFlipped) {
        const {beforeFlip, afterFlip, onFlipped} = this.props;
        const {scale, rotation, isFlipping} = this.state;
        const friction = 10;

        if (isFlipping) {
            return;
        }

        Animated.spring(scale, {toValue: 1.1, friction}).start(() => {
            if (typeof beforeFlip === 'function') {
                beforeFlip(isFlipped);
            }

            this.setState({isFlipping: true, isFlipped});

            Animated.spring(rotation, {toValue: 1, friction: 10, tension: 100}).start(() => {
                if (typeof beforeFlip === 'function') {
                    afterFlip(isFlipped);
                }

                this.setState({isFlipping: false});
                rotation.setValue(0);

                Animated.spring(scale, {toValue: 1, friction: 50, tension: 1000}).start(() => {
                    if (typeof onFlipped === 'function') {
                        onFlipped(this.state.isFlipped);
                    }
                });
            });
        });
    }

    render() {
        const {style, children} = this.props;
        const {pan, scale, translation, rotation, isFlipped, isFlipping, isTranslating} = this.state;
        const [translateX, translateY] = isTranslating ? [translation.x, translation.y] : [pan.x, pan.y];
        const rotateZ = pan.x.interpolate({inputRange: [-200, 0, 200], outputRange: ['-15deg', '0deg', '15deg']});
        const rotateY = rotation.interpolate({inputRange: [0, 1], outputRange: ['0deg', '180deg']});
        const opacity = pan.x.interpolate({inputRange: [-200, 0, 200], outputRange: [0.5, 1, 0.5]});
        const perspective = 1000;
        const side = isFlipped ? children[1] : children[0];

        // The order is important 
        const transform = [{perspective}, {translateX}, {translateY}, {rotateY}, {rotateZ}, {scale}];

        // Need to mirrow back side of the card while it is flipping
        if (isFlipping) {
            transform.push({skewY: '180deg'});
        }

        return (
            <Animated.View 
                style={[style, {flex: 1, backfaceVisibility: 'visible'}, {transform, opacity}]}
                {...this.panResponder.panHandlers}
            >
                <TouchableWithoutFeedback onPress={() => this.flip(!isFlipped)}>
                    {side}
                </TouchableWithoutFeedback>
            </Animated.View>
        );
    }
}

Card.propTypes = {
    isFlipped: PropTypes.bool,

    beforeFlip: PropTypes.func,
    afterFlip: PropTypes.func,

    onFlipped: PropTypes.func,
    onSwipedOut: PropTypes.func,
    animateEntrance: PropTypes.func,

    children: PropTypes.array,
    style: View.propTypes.style,
};
