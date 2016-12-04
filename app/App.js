/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';

import cards from './cards.json';

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    cardStack: {
        position: 'absolute',
        top: 100,
        left: 30,
    },
    card: {
        position: 'absolute',
        backgroundColor: '#fff',
        width: width - 60,
        height: height - 200,
        borderRadius: 5,
        shadowColor: '#000000',
        shadowOpacity: 0.2,
        shadowRadius: 1,
        shadowOffset: {
            height: 3,
            width: 0,
        },
    },
    cardFrontContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardBackContent: {
        flex: 1,
        paddingTop: 50,
        alignItems: 'center',
    },
    cardWord: {
        color: '#222',
        fontWeight: '700',
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    cardTranslation: {
        color: '#222',
        fontWeight: '700',
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    partOfSpeech: {
        color: '#777',
        fontSize: 20,
    },
    translations: {
        marginTop: 50,
        paddingHorizontal: 20,
        justifyContent: 'flex-start',
    },
    listBullet: {
        fontSize: 20,
        color: '#444',
    },
    translation: {
        marginTop: -25,
        marginLeft: 15,
        fontSize: 20,
        color: '#444',
    },
    yandexTranslator: {
        marginTop: height - 40,
        backgroundColor: 'transparent',
        color: '#eee',
        fontSize: 12,
    },
});


import LinearGradient from 'react-native-linear-gradient';
import CardStack from './components/CardStack';

export default class Zabl extends Component {
    render() {
        const wordFontSize = word => {
            let fontSize = 50;
            const WL = 8;

            if (word && word.length > WL) {
                fontSize -= (word.length - WL) * 4;
            }

            return fontSize < 14 ? 14 : fontSize;
        };

        return (
            <LinearGradient colors={['#24C6DC', '#514A9D']} style={styles.container}>

                <CardStack
                    style={styles.cardStack}
                    cardStyle={styles.card}
                    cards={cards.cards}
                    renderCardFront={card => (
                        <View style={styles.cardFrontContent}>
                            <Text style={[styles.cardWord, {fontSize: wordFontSize(card.word)}]}>
                                {card.word}
                            </Text>
                        </View>
                    )}
                    renderCardBack={card => (
                        <View style={styles.cardBackContent}>
                            <Text style={[styles.cardWord, {fontSize: wordFontSize(card.word)}]}>
                                {card.word}
                            </Text>
                            <Text style={styles.partOfSpeech}>
                                {card.partOfSpeech}
                            </Text>
                            <View style={styles.translations}>
                                {card.translation.map((translation, index) => (
                                    <View key={`translation_${index}`}>
                                        <Text style={styles.listBullet}>-</Text>
                                        <Text style={styles.translation}>
                                            {translation}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                    isLooped
                />
                <Text style={styles.yandexTranslator}>Переведено сервисом «Яндекс.Переводчик»</Text>

            </LinearGradient>
        );
    }
}
