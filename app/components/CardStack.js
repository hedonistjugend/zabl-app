import React, {Component, PropTypes} from 'react';

import {
    View,
    Animated,
} from 'react-native';

import Card from './Card';

const FOURTH_CARD_SCALE = 0.92;
const FOURTH_CARD_Y = 35;

const THIRD_CARD_SCALE = 0.95;
const THIRD_CARD_Y = 22;

const SECOND_CARD_SCALE = 0.98;
const SECOND_CARD_Y = 10;

export default class CardStack extends Component {
    constructor(props) {
        super(props);

        this.state = {
            card: Array.isArray(props.cards) ? props.cards[0] : null,
            isStackShown: true,
            isCardFlipped: false,

            secondCard: {
                translateY: new Animated.Value(SECOND_CARD_Y),
                scale: new Animated.Value(SECOND_CARD_SCALE),
            },
            thirdCard: {
                translateY: new Animated.Value(THIRD_CARD_Y),
                scale: new Animated.Value(THIRD_CARD_SCALE),
                opacity: new Animated.Value(1),
            },
        };
    }

    componentWillReceiveProps(nextProps) {
        if (Array.isArray(nextProps.cards) && nextProps.cards.length > 0) {
            this.setState({
                card: nextProps.cards[0],
            });
        }
    }

    nextCard(index = 1) {
        const {cards, isLooped} = this.props;
        const {card} = this.state;

        const nextCardIndex = cards.indexOf(card) + index;

        // Checks to see if last card.
        // If isLooped, will start again from the first card.
        return nextCardIndex > cards.length - 1
            ? isLooped ? cards[0] : null
            : cards[nextCardIndex];
    }

    render() {
        const {style, cardStyle, renderCardFront, renderCardBack} = this.props;
        const {
            card,
            isStackShown,
            secondCard,
            thirdCard,
        } = this.state;
        const friction = 10;
        const nextCard = this.nextCard();
        const afterNextCard = this.nextCard(2);

        return (
            <View style={style}>
                {isStackShown && card && nextCard && afterNextCard && (
                    <Animated.View
                        style={[cardStyle, {transform: [
                            {translateY: thirdCard.translateY},
                            {scale: thirdCard.scale},
                        ], opacity: thirdCard.opacity}]}
                    />
                )}
                {isStackShown && card && nextCard && (
                    <Animated.View
                        style={[cardStyle, {transform: [
                            {translateY: secondCard.translateY},
                            {scale: secondCard.scale},
                        ]}]}
                    >
                        {renderCardFront(nextCard)}
                    </Animated.View>
                )}
                {card && (
                    <Card
                        style={cardStyle}
                        onSwipedOut={result => {
                            /**
                             * result === true => to right
                             * result === false => to left
                             */
                            console.log('Card is swiped out', result);
                            this.setState({card: this.nextCard(), isCardFlipped: false});
                        }}
                        beforeFlip={() => this.setState({isStackShown: false})}
                        afterFlip={() => this.setState({isStackShown: true})}
                        animateEntrance={(pan, scale) => {
                            // First card takes position of the second card without animation
                            scale.setValue(SECOND_CARD_SCALE);
                            pan.setValue({x: 0, y: SECOND_CARD_Y});

                            // Second card takes position of the third card without animation
                            secondCard.scale.setValue(THIRD_CARD_SCALE);
                            secondCard.translateY.setValue(THIRD_CARD_Y);
                            
                            // Third card dissapear without animatioin
                            thirdCard.opacity.setValue(0.3);
                            thirdCard.scale.setValue(FOURTH_CARD_SCALE);
                            thirdCard.translateY.setValue(FOURTH_CARD_Y);

                            // Third card animation
                            Animated.spring(thirdCard.opacity, {toValue: 1, friction}).start();
                            Animated.spring(thirdCard.scale, {toValue: THIRD_CARD_SCALE, friction}).start();
                            Animated.spring(thirdCard.translateY, {toValue: THIRD_CARD_Y, friction}).start();

                            // Second card animation
                            Animated.spring(secondCard.scale, {toValue: SECOND_CARD_SCALE, friction}).start();
                            Animated.spring(secondCard.translateY, {toValue: SECOND_CARD_Y, friction}).start();

                            // First card animation
                            Animated.spring(scale, {toValue: 1, friction}).start();
                            Animated.spring(pan, {toValue: {x: 0, y: 0}, friction: 10}).start();
                        }}
                    >
                        {renderCardFront(card)}
                        {renderCardBack(card)}
                    </Card>
                )}
            </View>
        );
    }
}

CardStack.propTypes = {
    isLooped: PropTypes.bool,
    cards: PropTypes.array,
    style: View.propTypes.style,
    cardStyle: View.propTypes.style,
    renderCardFront: PropTypes.func,
    renderCardBack: PropTypes.func,
};
