// routes.js
const Apify = require('apify');
const extractors = require('./extractors');
var db = require('./database');
var AliList = require('./query');

const {
    utils: { log },
} = Apify;

// Categoy page crawler
// Add next page on request queue
// Fetch products from list and add all links to request queue
exports.CATEGORY = async ({ $, request }, { requestQueue }) => {
    log.info(`CRAWLER -- Fetching category link: ${request.url}`);

    // Extract sub category links
    const subCategories = await extractors.getAllSubCategories($);

    // If sub categories are more than 0
    if (subCategories.length > 0) {
        // Add all sub categories to request queue
        for (const subCategory of subCategories) {
            await requestQueue.addRequest({
                uniqueKey: subCategory.link,
                url: subCategory.link,
                userData: {
                    label: 'CATEGORY',
                },
            });
        }
    } else {
        // Move to listing
        await requestQueue.addRequest({
            uniqueKey: `${request.url}-LIST`,
            url: request.url,
            userData: {
                label: 'LIST',
                pageNum: 1,
                baseUrl: request.url,
            },
        });
    }


    log.debug(`CRAWLER -- Fetched ${subCategories.length} subcategories and moving to each of them`);
};

// Categoy page crawler
// Add next page on request queue
// Fetch products from list and add all links to request queue
exports.LIST = async ({ $, userInput, request }, { requestQueue }) => {
    const { endPage = -1 } = userInput;
    const { pageNum = 1, baseUrl } = request.userData;

    log.info(`CRAWLER -- Fetching category: ${request.url} with page: ${pageNum}`);

    // Extract product links
    const productLinks = await extractors.getProductsOfPage($);

    // If products are more than 0
    if (productLinks.length > 0) {
        // Check user input
        if (endPage > 0 ? pageNum + 1 <= endPage : true) {
            // Add next page of same category to queue
            await requestQueue.addRequest({
                url: `${baseUrl}?page=${pageNum + 1}&SortType=total_tranpro_desc`,
                userData: {
                    label: 'LIST',
                    pageNum: pageNum + 1,
                    baseUrl,
                },
            });
        }


        const rows = [];

        productLinks.map(product => {
            rows.push({
                category_url: baseUrl,
                category_id: baseUrl.split('/')[4],
                product_url: `https:${product.link.split('.html')[0]}.html`
            });
        });

        db.query(AliList.insertUpdateAliListSQL(rows), [], (err, data) => {
            if (err) {
                console.log('------------------------------', err.message)
            } else {
                console.log('----------------success--------------')
            }
        });
    } else {
        // End of category with page
        log.debug(`CRAWLER -- Last page of category: ${request.url} with page: ${pageNum}.`);
    }


    log.debug(`CRAWLER -- Fetched product links from ${request.url} with page: ${pageNum}`);
};
