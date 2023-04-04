import React from 'react';

function AsyncChild() {
    return (
        <div>
            async child
        </div>
    )
}

let cacheValue = false;

/**
 * Fake asynchronous call / in-memory cache for suspense testing purposes.
 */
const fakeLoader = () => {
    if (!cacheValue) {
        cacheValue = (
            new Promise((resolve) => {
                setTimeout(() => {
                    resolve(true)
                }, 1500);
            })
        );
    }

    return cacheValue;
};

export default function AsyncComponent() {
    const value = use(fakeLoader())

    return (
        <div>
            async parent
            {value && <AsyncChild />}
        </div>
    );
}

// use example for throwing promises to simulate async fetching
// Source - Facebook's codesandbox on React Suspense Docs:
//  https://react.dev/reference/react/Suspense
// @see https://codesandbox.io/s/s9zlw3
function use(promise) {
    if (promise.status === 'fulfilled') {
        return promise.value;
    } else if (promise.status === 'rejected') {
        throw promise.reason;
    } else if (promise.status === 'pending') {
        throw promise;
    } else {
        promise.status = 'pending';
        promise.then(
            result => {
                promise.status = 'fulfilled';
                promise.value = result;
            },
            reason => {
                promise.status = 'rejected';
                promise.reason = reason;
            },
        );
        throw promise;
    }
}
