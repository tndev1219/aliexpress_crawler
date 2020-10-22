const flattenDeep = require('lodash/flattenDeep');

// Fetch every subcategory hidden pages (loaders)
const getAllSubCategories = async ($) => {
    const dataScript = $($('script').filter((i, script) => $(script).html().includes('runParams')).get()[0]).html();

    const data = flattenDeep(JSON.parse(
        dataScript.split('window.runParams = ')[2].split('window.runParams.csrfToken =')[0].replace(/;/g, ''),
    ).refineCategory
        .map(category => category.childCategories))
        .filter(el => el).map(item => ({ name: item.categoryName, link: `https:${item.categoryUrl}` }));

    return data;
};

// Fetch all products from a global object `runParams`
const getProductsOfPage = ($) => {
    const dataScript = $($('script').filter((i, script) => $(script).html().includes('runParams')).get()[0]).html();
    const data = JSON.parse(
        dataScript.split('window.runParams = ')[2].split('window.runParams.csrfToken =')[0].replace(/;/g, ''),
    );

    if (!data.success) {
        throw new Error('We got blocked when trying to fetch products!');
    }

    return data.items && data.items.length > 0 ? data.items.map(item => ({ id: item.productId, name: item.title, link: item.productDetailUrl })) : [];
};

module.exports = {
    getAllSubCategories,
    getProductsOfPage
};
