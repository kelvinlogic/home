(function () {
    'use strict';

    angular
        .module('fc.merchandising')
        .controller('ProductMasterCtrl', productMaster)
        .controller('ProductDetailCtrl', productDetail);

    productMaster.$inject = [
        "lodash",
        "rx",
        "$modal",
        "$scope",
        "$stateParams",
        "$translate",
        "productDataSvc",
        "throttleValue",
        "merchandisingConstants"
    ];

    function productMaster(_, Rx, $modal, $scope, $stateParams, $translate, productDataSvc, throttleValue, constants) {
        /* jshint validthis: true */
        var vm = this,
            _productDetailModalOptions = null,
            _selectionEnum = {"none": 0, "some": 1, "all": 2},
            _currentPage = null,
            _pageSize = null,
            _pin = null,
            _totalServerItems = null,
            _productId = null;

        vm.activate = activate;
        vm.activateItems = activateItems;
        vm.allFields = [];
        vm.cancelChanges = cancelChanges;
        vm.createProduct = createProduct;
        vm.customFields = [];
        vm.edit = edit;
        vm.getSelectionKey = getSelectionKey;
        vm.filter = null;
        vm.fields = [];
        vm.formFields = {};
        vm.getStatusToggleKey = getStatusToggleKey;
        vm.hasNextPage = hasNextPage;
        vm.isFieldSelected = isFieldSelected;
        vm.loadNextPage = loadNextPage;
        vm.deactivateItems = deactivateItems;
        vm.saveChanges = saveChanges;
        vm.selectAll = selectAll;
        vm.selected = null;
        vm.showInactive = false;
        vm.products = [];
        vm.product = null;
        vm.title = null;
        vm.toggleFilterField = toggleFilterField;
        vm.toggleSelection = toggleSelection;
        vm.validationData = null;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            _productDetailModalOptions = {
                templateUrl: "merchandising/templates/modal.tpl.html",
                controller: "ProductDetailCtrl as vm",
                size: 'lg'
            };

            vm.validationData = {
                parent:{
                    required: true
                },
                code: {
                    required: true
                },
                description: {
                    required: false
                },
                location: {
                    required: true
                },
                name: {
                    required: true
                },
                address1: {
                    required: true
                },
                phone1: {
                    required: true
                },
                fax1: {
                    required: true
                },
                email1: {
                    required: true
                },
                pin: {
                    required: true
                },
                registration: {
                    required: true
                }
            };

            load();
        }

        function activateItems(item) {
            // NOTE:...................................................
            // If we passed a product, assume the activation of the single said product.
            // else, assume the activation of all selected products.

            changeActivation(item, true);
        }

        function cancelChanges() {
            vm.product = null;
        }

        function changeActivation(product, newStatus) {
            // We need a status specified.
            if (newStatus !== true && newStatus !== false) {
                return;
            }

            var toTranslate = [
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
                var warningTemplate = translations["fc.ACTION_WARNING_MESSAGE_TEMPLATE"],
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

                var pageTitle = vm.title;

                var selectedProducts = [],
                    actionPast = newStatus ? restoreActionPast : deleteActionPast,
                    actionPresent = newStatus ? restoreActionPresent : deleteActionPresent;

                if (!product) {
                    selectedProducts = _.filter(vm.products, function (ent) {
                        // Deselect items that won't be changed.
                        if (ent.active === newStatus) {
                            ent.isSelected = false;
                        }

                        return ent.isSelected;
                    });

                    // Can't change the state.
                    if (selectedProducts.length < 1) {
                        refreshSelection();
                        return;
                    }

                    refreshSelection();
                }

                var performChange = function (product) {
                    // If we get an product, change it else change all selected products.
                    var toChange = null;

                    if (product) {
                        toChange = product.id;
                    } else {
                        // Do nothing if there was no selection.
                        if (vm.selected === _selectionEnum.none) {
                            return;
                        }

                        // Fetch the selected products.
                        toChange = _.map(selectedProducts, function (product) {
                            return product.id;
                        });
                    }

                    if (newStatus === true) {
                        productDataSvc.activateProductsData(_productId, toChange).then(afterChangeCb);
                    } else {
                        productDataSvc.deactivateProductsData(_productId, toChange).then(afterChangeCb);
                    }
                };

                var afterChangeCb = function(response) {
                    var changedCount = response.length;
                    var message = null;
                    var title = changedCount > 0 ? successAlertTitle : failAlertTitle;
                    var color = changedCount > 0 ? "#659265" : "#C46A69";
                    var icon = "fa fa-2x fadeInRight animated " + (changedCount > 0 ? "fa-check" : "fa-times");

                    if (changedCount > 0) {
                        var msgData = {action: _.string.humanize(actionPast), count: changedCount};

                        message = _.string.sprintf(successTemplate, msgData);

                        var updateItem = function (ent) {
                            // If we are not showing inactive items, add the newly activated item.
                            if (!vm.showInactive) {
                                updateProducts(ent, !newStatus);
                            } else {
                                var idx = vm.products.indexOf(ent);

                                // Replace with new from data store.
                                if (idx >= 0) {
                                    var match = _(response).filter(function (resp) {
                                        return resp.id === ent.id;
                                    }).first();

                                    // Damn...we can't use splice here...
                                    angular.extend(vm.products[idx], match);
                                }
                            }
                        };

                        if (changedCount === 1 && product) {
                            updateItem(product);
                        } else {
                            _(selectedProducts).filter(function (product) {
                                return _.any(response, {id: product.id});
                            }).forEach(function (product) {
                                updateItem(product);
                            });
                        }

                        if (!vm.showInactive) {
                            if (newStatus) {
                                // If we are not showing inactive, remove extra items.
                                var startIndex = vm.products.length - (1 + changedCount);
                                vm.products.splice(startIndex, changedCount);
                            } else {
                                // If we are not showing inactive, load extra items to fill up the remaining slots.
                                fetchProducts(_currentPage, _pageSize, changedCount);
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

                    // Set the messages depending on whether we're restoring a single product or a selection.
                    if (product) {
                        title += " <span class='" + textColor + "'><strong>" + product.name;
                        if (product.location) {
                            title += "</strong> <span>"+ product.location +"</span></span>?";
                        }

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            count: 1
                        });
                    } else {
                        title += " <span class='" + textColor + "'><strong>";
                        title += selectedProducts.length;
                        title += "</strong> <span>"+ pageTitle.toLowerCase() +"</span></span>?";

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            count: selectedProducts.length
                        });
                    }

                    $.SmartMessageBox({
                        title : title,
                        content : content,
                        buttons : '[' + noText + '][' + yesText + ']'
                    }, function(button) {
                        if (button === yesText) {
                            performChange(product);
                        }
                    });
                } else {
                    content = _.string.sprintf(warningTemplate, {action: actionPresent, count: selectedProducts.length || 1});
                    if (confirm(content)) {
                        performChange(product);
                    }
                }
            });
        }

        function createProduct() {
            vm.product = {};
        }

        function deactivateItems(item) {
            // NOTE:...................................................
            // If we passed an product, assume the deactivation of the single said product.
            // else, assume the deactivation of all selected products.

            changeActivation(item, false);
        }

        function edit(item) {
            if (!item) {
                return;
            }

            // Use extend to prevent reference copying so we can edit the item in isolation.
            var product = angular.extend({}, item);

            // Setup modal options.
            _productDetailModalOptions.resolve = {
                data: function () {
                    return {
                        customFields: vm.customFields,
                        formFields: vm.formFields,
                        product: product,
                        productId: _productId,
                        validationData: vm.validationData
                    };
                }
            };

            // Open modal popup.
            var modalInstance = $modal.open(_productDetailModalOptions);

            modalInstance.result.then(function (editedEntity) {
                // We selected ok...
                angular.extend(item, editedEntity);
            }, function () {
                // We cancelled the search...
                // Do nothing...
            });
        }

        function fetchProducts(page, pageSize, replaceRemoved, refresh) {
            var filterOptions = {_search: vm.filter && vm.filter.length > 0, query: vm.filter, fields: vm.fields};

            productDataSvc.getProducts(page, pageSize, filterOptions, vm.showInactive, replaceRemoved, refresh)
                .then(function (data) {
                    _currentPage = data.page;
                    _pageSize = data.maxItems;
                    _pin = data.pin;
                    _totalServerItems = data.inlineCount;
                    vm.allFields = [];

                    vm.customFields = data.customFields;

                    if (data.name && vm.title !== data.name) {
                        vm.title = data.name;
                    }

                    if (refresh) {
                        vm.products = [];
                    }

                    // Setup dynamic form fields.
                    vm.formFields.code = true;
                    vm.formFields.name = true;
                    vm.allFields.push("code", "name");

                    // Entity fields.
                    if (_pin === 1) {
                        vm.formFields.description = true;
                        vm.formFields.location = true;
                        vm.allFields.push("location", "description");
                    }

                    // Middle product fields
                    if (!_pin) {
                        vm.formFields.customFields = data.customFields && data.customFields.length > 0;
                    }

                    // Branch fields
                    if (_pin === 2) {
                        vm.formFields.address1 = true;
                        vm.formFields.address2 = true;
                        vm.formFields.address3 = true;
                        vm.formFields.address4 = true;
                        vm.formFields.phone1 = true;
                        vm.formFields.phone2 = true;
                        vm.formFields.phone3 = true;
                        vm.formFields.phone4 = true;
                        vm.formFields.fax1 = true;
                        vm.formFields.fax2 = true;
                        vm.formFields.email1 = true;
                        vm.formFields.email2 = true;
                        vm.formFields.branchIsWarehouse = true;
                        vm.formFields.pin = true;
                        vm.formFields.registration = true;

                        vm.allFields.push("address1", "address2", "address3", "address4");
                        vm.allFields.push("phone1", "phone2", "phone3", "phone4");
                        vm.allFields.push("email1", "email2");
                        vm.allFields.push("fax1", "fax2");
                        vm.allFields.push("pin", "registration");
                    }

                    updateProducts(data.results);
                }, function (error) {

                });
        }

        function getSelectionKey() {
            return vm.selected ? "fc.CLEAR_SELECTION_TEXT" : "fc.SELECT_ALL_TEXT";
        }

        function getStatusToggleKey() {
            return vm.showInactive ? 'fc.HIDE_INACTIVE_TEXT' : 'fc.SHOW_INACTIVE_TEXT';
        }

        function hasNextPage() {
            var alreadyLoadedItems = (Math.max((_currentPage - 1), 0) * _pageSize) + vm.products.length;

            return alreadyLoadedItems < _totalServerItems;
        }

        function isFieldSelected(field) {
            return _.contains(vm.fields, field);
        }

        function load() {
            _productId = $stateParams.id;
            var subject = new Rx.Subject();
            subject.throttle(throttleValue).distinctUntilChanged().subscribe(function () {
                fetchProducts(_currentPage, _pageSize, null, true);
            });

            $scope.$watch(function () {
                return vm.filter;
            }, function (newValues) {
                subject.onNext(newValues);
            });

            $scope.$watchCollection(function () {
                return vm.fields;
            }, function (newValues) {
                subject.onNext(newValues);
            });

            $scope.$watch(function() {
                return vm.showInactive;
            }, function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }

                fetchProducts(_currentPage, _pageSize, null, true);
            });
        }

        function loadNextPage() {
            fetchProducts(_currentPage + 1, _pageSize);
        }

        function refreshSelection() {
            // Use _.pluck style callback shorthand...
            var someSelected = _.any(vm.products, "isSelected");

            // NOTE: lodash always returns true when all is an empty array. Bug or by design?
            var allSelected = someSelected && _.all(vm.products, "isSelected");
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
            productDataSvc.createProduct(vm.product).then(function (data) {
                updateProducts(data);
                vm.product = null;
                vm.isSaving = false;
            });
        }

        function selectAll() {
            if (!vm.selected || vm.selected === _selectionEnum.none) {
                _.forEach(vm.products, function(product) {
                    product.isSelected = true;
                });
            } else {
                _.forEach(vm.products, function(product) {
                    product.isSelected = false;
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

        function updateProducts(data, remove) {
            if (!_.isArray(vm.products)) {
                vm.products = [];
            }

            var index = -1;

            var updateSingle = function (item) {
                if (remove) {
                    index = vm.products.indexOf(item);

                    if (index >= 0) {
                        vm.products.splice(index, 1);
                    }
                } else {
                    vm.products.push(item);
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

    productDetail.$inject = ["$modalInstance", "productDataSvc", "data"];

    function productDetail($modalInstance, productDataSvc, data) {
        var vm = this;

        vm.cancelChanges = cancelChanges;
        vm.customFields = data.customFields;
        vm.product = data.product;
        vm.formFields = data.formFields;
        vm.saveChanges = saveChanges;
        vm.title = data.product.name;
        vm.validationData = data.validationData;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {}

        function cancelChanges() {
            $modalInstance.dismiss();
        }

        function saveChanges() {
            vm.isSaving = true;

            productDataSvc.updateProduct(vm.product.id, vm.product).then(function (data) {
                $modalInstance.close(data);
                vm.product = null;
                vm.isSaving = false;
            });
        }
    }
})();