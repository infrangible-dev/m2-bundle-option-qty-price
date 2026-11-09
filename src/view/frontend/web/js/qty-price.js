/**
 * @author      Andreas Knollmann
 * @copyright   2014-2025 Softwareentwicklung Andreas Knollmann
 * @license     http://www.opensource.org/licenses/mit-license.php MIT
 */

define([
    'jquery',
    'domReady',
    'priceUtils',
    'Infrangible_BundleOptionSelection/js/model/selection'
], function ($, domReady, utils, selection) {
    'use strict';

    const globalOptions = {
        config: {},
        optionsSelector: '.product-custom-option',
        productBundleTriggerSelector: '.bundle-options-container',
        productBundleOptionContainerSelector: null,
    };

    $.widget('infrangible.bundleOptionQtyPrice', {
        options: globalOptions,

        _create: function createBundle() {
        },

        _init: function initBundle() {
            const self = this;

            domReady(function() {
                $(self.options.optionsSelector).on('product_option_changes', function(event, optionId, optionHash, option, optionsConfig, changes) {
                    const optionChanges = changes[optionHash];

                    if (optionChanges && ! $.isEmptyObject(optionChanges)) {
                        const optionQtyPrice = self.options.config[optionId];

                        if (optionQtyPrice) {
                            const selectedProductIds = selection.collectSelectedProductIds(
                                self.options.productBundleOptionContainerSelector ?
                                    self.options.productBundleOptionContainerSelector : self.element);

                            let selectionQty = 0;

                            $.each(optionQtyPrice, function(bundleOptionId, bundleOptionData) {
                                $.each(selectedProductIds, function(selectedBundleOptionId, selectedBundleOptionProductIds) {
                                    if (bundleOptionId === selectedBundleOptionId) {
                                        $.each(selectedBundleOptionProductIds, function(i, selectedBundleOptionProductId) {
                                            const selectedBundleOptionProductQty = bundleOptionData[selectedBundleOptionProductId];

                                            if (selectedBundleOptionProductQty) {
                                                selectionQty += parseInt(selectedBundleOptionProductQty);
                                            }
                                        });
                                    }
                                });
                            });

                            if (selectionQty > 0) {
                                $.each(optionChanges, function(priceCode, priceData) {
                                    if (priceData.orgAmount) {
                                        priceData.amount = priceData.orgAmount * selectionQty;
                                    } else if (priceData.amount) {
                                        priceData.orgAmount = priceData.amount;
                                        priceData.amount = priceData.amount * selectionQty;
                                    }
                                });
                            }
                        }
                    }
                });

                $(self.options.productBundleTriggerSelector).on('bundle_option_changed', function(event, bundleOptionId) {
                    $.each(self.options.config, function(optionId, optionQtyPrice) {
                        const bundleOptionQtyPrice = optionQtyPrice[bundleOptionId];

                        if (bundleOptionQtyPrice) {
                            $(self.options.optionsSelector).each(function() {
                                if (optionId === utils.findOptionId($(this)[0])) {
                                    $(this).trigger('change');
                                }
                            });
                        }
                    });
                });
            });
        },
    });

    return $.infrangible.bundleOptionQtyPrice;
});
