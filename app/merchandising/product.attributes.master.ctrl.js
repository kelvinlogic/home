(function () {
    'use strict';

    angular
        .module('fc.merchandising')
        .controller('ProductAttrMasterCtrl', productAttrMaster)
        .controller('ProductAttrDetailCtrl', productAttrDetail);

    productAttrMaster.$inject = ['lodash', "rx", '$modal', '$scope', '$stateParams', '$translate', 'productAttrDataSvc', 'throttleValue'];

    /* @ngInject */
    function productAttrMaster(_, Rx, $modal, $scope, $stateParams, $translate, productAttrDataSvc, throttleValue) {
        /* jshint validthis: true */
        var vm = this,
            _productAttrDetailModalOptions = null,
            _selectionEnum = {"none": 0, "some": 1, "all": 2},
            _currentPage = null,
            _pageSize = null,
            _pin = null,
            _totalServerItems = null,
            _productattrId = null;

        vm.activate = activate;
        vm.activateProductAttr = activateProductAttr;
        vm.cancelChanges = cancelChanges;
        vm.createProductAttr = createProductAttr;
        vm.edit = edit;
        vm.getFields = getFields;
        vm.getSelectionKey = getSelectionKey;
        vm.filter = null;
        vm.fields = [];
        vm.getStatusToggleKey = getStatusToggleKey;
        vm.hasNextPage = hasNextPage;
        vm.isFieldSelected = isFieldSelected;
        vm.loadNextPage = loadNextPage;
        vm.deactivateProductAttr = deactivateProductAttr;
        vm.saveChanges = saveChanges;
        vm.selectAll = selectAll;
        vm.selected = null;
        vm.showInactive = false;
        vm.productsattr = [];
        vm.productattr = null;
        vm.title = null;
        vm.titleKey = 'fc.merchandising.productAttribute.DETAIL_PAGE_TITLE';
        vm.toggleFilterField = toggleFilterField;
        vm.toggleSelection = toggleSelection;
        vm.validationData = null;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            _productAttrDetailModalOptions = {
                templateUrl: "fc/editModalTpl",
                controller: "ProductAttrDetailCtrl as vm"
            };

            vm.validationData = {
                code: {
                    required: true
                },
                product: {
                    required: true
                },
                attribute:{
                    required:true
                }
                ,
                attrValue:{
                    required:true
                }
            };

            load();
        }

        function activateProductAttr(productattr) {
            // NOTE:...................................................
            // If we passed a Product Attribute, assume the activation of the single said Product Attribute.
            // else, assume the activation of all selected Product Attribute.

            changeActivation(productattr, true);
        }

        function cancelChanges() {
            vm.productattr = null;
        }

        function changeActivation(productattr, newStatus) {
            // We need a status specified.
            if (newStatus !== true && newStatus !== false) {
                return;
            }

            var toTranslate = [
                "fc.merchandising.hierarchy.MASTER_PAGE_TITLE",
                "fc.ACTION_WARNING_MESSAGE_TEMPLATE",
                "fc.SUCCESS_ALERT_TITLE",
                "fc.ACTION_SUCCESS_MESSAGE_TEMPLATE",
                "fc.FAIL_ALERT_TITLE",
                "fc.ACTION_FAIL_MESSAGE_TEMPLATE",
                "fc.DELETE_ACTION_PRESENT",
                "fc.DELETE_ACTION_PAST",
                "fc.RESTORE_ACTION_PRESENT",
                "fc.RESTORE_ACTION_PAST",
                "fc.NO_TEXT",
                "fc.YES_TEXT"
            ];

            $translate(toTranslate).then(function (translations) {
                var pageTitle = translations["fc.merchandising.salesman.DETAIL_PAGE_TITLE"],
                    warningTemplate = translations["fc.ACTION_WARNING_MESSAGE_TEMPLATE"],
                    successAlertTitle = translations["fc.SUCCESS_ALERT_TITLE"],
                    successTemplate = translations["fc.ACTION_SUCCESS_MESSAGE_TEMPLATE"],
                    failAlertTitle = translations["fc.FAIL_ALERT_TITLE"],
                    failTemplate = translations["fc.ACTION_FAIL_MESSAGE_TEMPLATE"],
                    deleteActionPresent = translations["fc.DELETE_ACTION_PRESENT"],
                    deleteActionPast = translations["fc.DELETE_ACTION_PAST"],
                    restoreActionPresent = translations["fc.RESTORE_ACTION_PRESENT"],
                    restoreActionPast = translations["fc.RESTORE_ACTION_PAST"],
                    noText = translations["fc.NO_TEXT"],
                    yesText = translations["fc.YES_TEXT"];

                var selectedProductAttr = [],
                    actionPast = newStatus ? restoreActionPast : deleteActionPast,
                    actionPresent = newStatus ? restoreActionPresent : deleteActionPresent;

                if (!productattr) {
                    selectedProductAttr = _.filter(vm.productattr, function (ent) {
                        // Deselect items that won't be changed.
                        if (ent.active === newStatus) {
                            ent.isSelected = false;
                        }

                        return ent.isSelected;
                    });

                    // Can't change the state.
                    if (selectedProductAttr.length < 1) {
                        refreshSelection();
                        return;
                    }

                    refreshSelection();
                }

                var performChange = function (productattr) {
                    // If we get an reason, change it else change all selected productsattr.
                    var toChange = null;

                    if (productattr) {
                        toChange = productattr.id;
                    } else {
                        // Do nothing if there was no selection.
                        if (vm.selected === _selectionEnum.none) {
                            return;
                        }

                        // Fetch the selected hierarchies.
                        toChange = _.map(selectedProductAttr, function (salesman) {
                            return salesman.id;
                        });
                    }

                    if (newStatus === true) {
                        productAttrDataSvc.activateProductAttrData(toChange).then(afterChangeCb);
                    } else {
                        productAttrDataSvc.deactivateProductAttrData(toChange).then(afterChangeCb);
                    }
                };

                var afterChangeCb = function(response) {
                    var changedCount = response.length;
                    var message = null;
                    var title = changedCount > 0 ? successAlertTitle : failAlertTitle;
                    var color = changedCount > 0 ? "#659265" : "#C46A69";
                    var icon = "fa fa-2x fadeInRight animated " + (changedCount > 0 ? "fa-check" : "fa-times");

                    if (changedCount > 0) {
                        var msgData = {action: actionPast};
                        if (changedCount === 1 && productattr) {
                            msgData.data = productattr.code + " " + productattr.attrValue;
                        } else {
                            msgData.data = changedCount + " " + pageTitle.toLowerCase();
                        }

                        message = _.string.sprintf(successTemplate, msgData);

                        var updateItem = function (ent) {
                            // If we are not showing inactive items, add the newly activated item.
                            if (!vm.showInactive) {
                                updateProductAttr(ent, !newStatus);
                            } else {
                                var idx = vm.productsattr.indexOf(ent);

                                // Replace with new from data store.
                                if (idx >= 0) {
                                    var match = _(response).filter(function (resp) {
                                        return resp.id === ent.id;
                                    }).first();

                                    // Damn...we can't use splice here...
                                    angular.extend(vm.productsattr[idx], match);
                                }
                            }
                        };

                        if (changedCount === 1 && productattr) {
                            updateItem(productattr);
                        } else {
                            _(selectedProductAttr).filter(function (productattr) {
                                return _.any(response, {id: productattr.id});
                            }).forEach(function (productattr) {
                                updateItem(productattr);
                            });
                        }

                        if (!vm.showInactive) {
                            if (newStatus) {
                                // If we are not showing inactive, remove extra items.
                                var startIndex = vm.productattr.length - (1 + changedCount);
                                vm.productattr.splice(startIndex, changedCount);
                            } else {
                                // If we are not showing inactive, load extra items to fill up the remaining slots.
                                fetchProductAttr(_currentPage, _pageSize, changedCount);
                            }
                        }
                    } else {
                        message = _.string.sprintf(failTemplate, {action: actionPresent, data: pageTitle.toLowerCase()});
                    }


                    if ($.smallBox) {
                        $.smallBox({
                            title : title,
                            content : "<i>" + message + "</i>",
                            color : color,
                            iconSmall : icon,
                            timeout : 4000
                        });
                    } else {
                        alert(message);
                    }
                };

                var content = null;

                // Show message box.
                if ($.SmartMessageBox) {
                    var textColor = newStatus ? "txt-color-green" : "txt-color-red";
                    var title = "<i class='fa fa-trash-o " + textColor + "'></i> ";
                    title += _.string.humanize(actionPresent);

                    // Set the messages depending on whether we're restoring a single reason or a selection.
                    if (productattr) {
                        title += " <span class='" + textColor + "'><strong>" + productattr.code;
                        title += "</strong> <span>"+ productattr.attrValue +"</span></span>?";

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            data: pageTitle
                        });
                    } else {
                        title += " <span class='" + textColor + "'><strong>";
                        title += selectedProductAttr.length;
                        title += "</strong> <span>"+ pageTitle.toLowerCase() +"</span></span>?";

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            data: selectedProductAttr.length + " " + pageTitle.toLowerCase()
                        });
                    }

                    $.SmartMessageBox({
                        title : title,
                        content : content,
                        buttons : '[' + noText + '][' + yesText + ']'
                    }, function(button) {
                        if (button === yesText) {
                            performChange(productattr);
                        }
                    });
                } else {
                    content = _.string.sprintf(warningTemplate, {action: actionPresent});
                    if (confirm(content)) {
                        performChange(productattr);
                    }
                }
            });
        }
        function createProductAttr() {
            vm.productattr = {};
        }

        function deactivateProductAttr(productattr) {
            // NOTE:...................................................
            // If we passed an reasons, assume the deactivation of the single said hierarchy.
            // else, assume the deactivation of all selected hierarchies.

            changeActivation(productattr, false);
        }

        function edit(item) {
            if (!item) {
                return;
            }

            // Use extend to prevent reference copying so we can edit the item in isolation.
            var productattr = angular.extend({}, item);

            // Setup modal options.
            _productAttrDetailModalOptions.resolve = {
                data: function () {
                    return {
                        productattr: productattr,
                        salesmanId: _productattrId
                    };
                }
            };

            // Open modal popup.
            var modalInstance = $modal.open(_productAttrDetailModalOptions);

            modalInstance.result.then(function (editedEntity) {
                // We selected ok...
                angular.extend(item, editedEntity);
            }, function () {
                // We cancelled the search...
                // Do nothing...
            });
        }

        function fetchProductAttr(page, pageSize, replaceRemoved, refresh) {
            productAttrDataSvc.getProductAttrData( page, pageSize, vm.filter, vm.showInactive, replaceRemoved, refresh)
                .then(function (data) {
                    _currentPage = data.page;
                    _pageSize = data.maxItems;
                    _totalServerItems = data.inlineCount;
                    if (data.name && vm.title !== data.name) {
                        vm.title = data.name;
                    }

                    if (refresh) {
                        vm.productsattr = [];
                    }

                    updateProductAttr(data.results);
                }, function (error) {

                });
        }

        function getFields() {
            return ["code", "product","attribute","attrValue"];
        }

        function getSelectionKey() {
            return vm.selected ? "fc.CLEAR_SELECTION_TEXT" : "fc.SELECT_ALL_TEXT";
        }

        function getStatusToggleKey() {
            return vm.showInactive ? 'fc.HIDE_INACTIVE_TEXT' : 'fc.SHOW_INACTIVE_TEXT';
        }

        function hasNextPage() {
            var alreadyLoadedItems = ((_currentPage - 1) * _pageSize) + vm.productsattr.length;

            return alreadyLoadedItems < _totalServerItems;
        }

        function isFieldSelected(field) {
            return _.contains(vm.fields, field);
        }

        function load() {
            _productattrId = _.string.toNumber($stateParams.id);
            var subject = new Rx.Subject();
            subject.throttle(throttleValue).distinctUntilChanged().subscribe(function () {
                fetchProductAttr(_currentPage, _pageSize, null, true);
            });

            $scope.$watch(function () {
                return vm.filter;
            }, function (newValues) {
                /* If no field is selected, search on all fields. */

                subject.onNext(newValues);
            });

            $scope.$watch(function() {
                return vm.showInactive;
            }, function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }

                fetchProductAttr(_currentPage, _pageSize, null, true);
            });
        }

        function loadNextPage() {
            fetchProductAttr(_currentPage + 1, _pageSize);
        }

        function refreshSelection() {
            // Use _.pluck style callback shorthand...
            var someSelected = _.any(vm.productattr, "isSelected");

            // NOTE: lodash always returns true when all is an empty array. Bug or by design?
            var allSelected = someSelected && _.all(vm.productattr, "isSelected");
            if (allSelected) {
                vm.selected = _selectionEnum.all;
            } else if (someSelected) {
                vm.selected = _selectionEnum.some;
            } else {
                vm.selected = _selectionEnum.none;
            }
        }

        function saveChanges() {

            vm.isSaving = true;
            productAttrDataSvc.createProductAttrData(vm.productattr).then(function (data) {
                updateProductAttr(data);
                vm.productattr = null;
                vm.isSaving = false;

            });
        }

        function selectAll() {
            if (!vm.selected || vm.selected === _selectionEnum.none) {
                _.forEach(vm.productsattr, function(productattr) {
                    productattr.isSelected = true;
                });
            } else {
                _.forEach(vm.productsattr, function(productattr) {
                    productattr.isSelected = false;
                });
            }

            refreshSelection();
        }

        function toggleFilterField(field) {
            var index = vm.fields.indexOf(field);

            if (index >= 0) {
                vm.fields.splice(index, 1)
            } else {
                vm.fields.push(field);
            }
        }

        function toggleSelection(item) {
            item.isSelected = !item.isSelected;

            refreshSelection();
        }

        function updateProductAttr(data, remove) {
            if (!_.isArray(vm.productsattr)) {
                vm.productsattr = [];
            }

            var index = -1;

            var updateSingle = function (item) {
                if (remove) {
                    index = vm.productsattr.indexOf(item);

                    if (index >= 0) {
                        vm.productsattr.splice(index, 1);
                    }
                } else {
                    vm.productsattr.push(item);
                }
            };


            if (_.isArray(data)) {
                _.forEach(data, function (item) {
                    updateSingle(item);
                });
            } else {
                updateSingle(data);
            }

            refreshSelection();
        }
    }

    productAttrDetail.$inject = ["$modalInstance", "productAttrDataSvc", "data"];

    function productAttrDetail($modalInstance, productAttrDataSvc, data) {
        var vm = this,
            _productAttrId = data.Id;
        vm.cancelChanges = cancelChanges;
        vm.productattr = data.productattr;
        vm.saveChanges = saveChanges;
        vm.validationData = null;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            vm.validationData = {
                code: {
                    required: true
                },
                attribute: {
                    required: true
                }
                /*,
                 branch: {
                 required: true
                 },
                 startdate: {
                 required: true
                 },
                 enddate: {
                 required: true
                 }*/
            };
        }

        function cancelChanges() {
            $modalInstance.dismiss();
        }

        function saveChanges() {
            vm.isSaving = true;
            productAttrDataSvc.updateProductAttrData(vm.productattr.id, vm.productattr).then(function (data) {
                $modalInstance.close(data);
                vm.productattr = null;
                vm.isSaving = false;
            });
        }
    }
})();