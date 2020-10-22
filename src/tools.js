const Apify = require('apify');
const HttpsProxyAgent = require('https-proxy-agent');
const URL = require('url');
const routes = require('./routes');

const {
    utils: { log },
} = Apify;

// Create router
exports.createRouter = (globalContext) => {
    return async function (routeName, requestContext) {
        const route = routes[routeName];
        if (!route) throw new Error(`No route for name: ${routeName}`);
        log.debug(`Invoking route: ${routeName}`);
        return route(requestContext, globalContext);
    };
};

// Detects url and map them to routes
exports.mapStartUrls = (startUrls) => {
    return startUrls.map((startUrl) => {
        const parsedURL = URL.parse(startUrl.url);
        const link = `https://www.aliexpress.com${parsedURL.pathname}`;
        let routeType = '';
        let userData = {};

        if (link.includes('/item/')) {
            routeType = 'PRODUCT';
            userData = {
                baseUrl: link,
                productId: link.split('/item/')[1].split('.htm')[0],
            };
        } else if (link.includes('/category/')) {
            routeType = 'CATEGORY';
            userData = {
                baseUrl: link,
            };
        } else {
            throw new Error('Wrong URL provided to Start URLS!');
        }

        userData.label = routeType;

        return {
            uniqueKey: link,
            url: link,
            userData,
        };
    });
};
