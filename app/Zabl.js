import React from 'react';
import {Provider} from 'react-redux';

import configureStore from './store';
import App from './App';

const Zabl = () => (
    <Provider store={configureStore()}>
        <App />
    </Provider>
);

export {Zabl as default};
