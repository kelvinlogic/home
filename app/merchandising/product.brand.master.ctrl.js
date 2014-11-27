(function () {
    'use strict';

    angular
        .module('fc.merchandising')
        .controller('BrandMasterCtrl', brandMaster)
        .controller('BrandDetailCtrl', brandDetail);

    brandMaster.$inject = ['lodash', "rx", '$modal', '$scope', '$stateParams', '$translate', 'brandDataSvc', 'throttleValue'];
    /* @ngInject */
    function brandMaster(_, Rx, $modal, $scope, $stateParams, $translate, brandDataSvc, throttleValue) {
        /* jshint valid this: true */
        var vm = this,
            _brandDetailModalOptions = null,
            _selectionEnum = {"none": 0, "some": 1, "all": 2},
            _currentPage = null,
            _pageSize = null,
            _totalServerItems = null,
            _brandId = null;

        vm.activate = activate;
        vm.activateBrands = activateBrands;
        vm.cancelChanges = cancelChanges;
        vm.createBrand = createBrand;
        vm.edit = edit;
        vm.getFields = getFields;
        vm.getSelectionKey = getSelectionKey;

        vm.newBrand = newBrand;
        vm.saveChanges = saveChanges;
        vm.fetchBrands  = fetchBrands ;

        vm.filter = null;
        vm.fields = [];
        vm.getStatusToggleKey = getStatusToggleKey;
        vm.hasNextPage = hasNextPage;
        vm.isBranch = isBranch;
        vm.isEntity = isEntity;
        vm.isFieldSelected = isFieldSelected;
        vm.loadNextPage = loadNextPage;
        vm.deactivateBrands = deactivateBrands;

        vm.selectAll = selectAll;
        vm.selected = null;
        vm.showInactive = false;
        vm.brands = [];
        vm.brand = null;
        vm.title = null;
        vm.titleKey = 'fc.merchandising.productBrand.MASTER_PAGE_TITLE';
        vm.toggleFilterField = toggleFilterField;
        vm.toggleSelection = toggleSelection;
        vm.validationData = null;

        activate();

        /*
         *   functions to perform crud functionality
         */

        function activate() {
            _brandDetailModalOptions = {
                templateUrl: "fc/editModalTpl",
                controller: "BrandDetailCtrl as vm"
            };

            vm.validationData = {
                //validation for the local fields
                status: {
                    required: true
                },
                code: {
                    required: true
                },
                description: {
                    required: false
                }
            };

            load();
        }

        function activateBrands(brand) {
            // NOTE:...................................................
            // If we passed a brand, assume the activation of the single said brand.
            // else, assume the activation of all selected brands.

            changeActivation(brand, true);
        }

        function cancelChanges() {
            vm.brand = null;
        }

        function newBrand() {
            vm.brand = {};
        }

        function changeActivation(brand, newStatus) {
            // We need a status specified.
            if (newStatus !== true && newStatus !== false) {
                return;
            }

            var toTranslate = [
                "fc.merchandising.productBrand.MASTER_PAGE_TITLE",
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
                var pageTitle = translations["fc.merchandising.productBrand.MASTER_PAGE_TITLE"],
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

                var selectedBrands = [],
                    actionPast = newStatus ? restoreActionPast : deleteActionPast,
                    actionPresent = newStatus ? restoreActionPresent : deleteActionPresent;

                if (!brand) {
                    selectedBrands = _.filter(vm.brands, function (ent) {
                        // Deselect items that won't be changed.
                        if (ent.active === newStatus) {
                            ent.isSelected = false;
                        }

                        return ent.isSelected;
                    });

                    // Can't change the state.
                    if (selectedBrands.length < 1) {
                        refreshSelection();
                        return;
                    }

                    refreshSelection();
                }

                var performChange = function (brand) {
                    // If we get an brand, change it else change all selected brands.
                    var toChange = null;

                    if (brand) {
                        toChange = brand.id;
                    } else {
                        // Do nothing if there was no selection.
                        if (vm.selected === _selectionEnum.none) {
                            return;
                        }

                        // Fetch the selected brands.
                        toChange = _.map(selectedBrands, function (brand) {
                            return brand.id;
                        });
                    }

                    if (newStatus === true) {
                        brandDataSvc.activateBrands(toChange).then(afterChangeCb);
                    } else {
                        brandDataSvc.deactivateBrands(toChange).then(afterChangeCb);
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
                        if (changedCount === 1 && brand) {
                            msgData.data = brand.code + " " + brand.status;
                        } else {
                            msgData.data = changedCount + " " + pageTitle.toLowerCase();
                        }

                        message = _.string.sprintf(successTemplate, msgData);

                        var updateItem = function (ent) {
                            // If we are not showing inactive items, add the newly activated item.
                            if (!vm.showInactive) {
                                updateBrands(ent, !newStatus);
                            } else {
                                var idx = vm.brands.indexOf(ent);

                                // Replace with new from data store.
                                if (idx >= 0) {
                                    var match = _(response).filter(function (resp) {
                                        return resp.id === ent.id;
                                    }).first();

                                    // Damn...we can't use splice here...
                                    angular.extend(vm.brands[idx], match);
                                }
                            }
                        };

                        if (changedCount === 1 && brand) {
                            updateItem(brand);
                        } else {
                            _(selectedBrands).filter(function (brand) {
                                return _.any(response, {id: brand.id});
                            }).forEach(function (brand) {
                                updateItem(brand);
                            });
                        }

                        if (!vm.showInactive) {
                            if (newStatus) {
                                // If we are not showing inactive, remove extra items.
                                var startIndex = vm.brands.length - (1 + changedCount);
                                vm.brands.splice(startIndex, changedCount);
                            } else {
                                // If we are not showing inactive, load extra items to fill up the remaining slots.
                                fetchBrands(_currentPage, _pageSize, changedCount);
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

                    // Set the messages depending on whether we're restoring a single brand or a selection.
                    if (brand) {
                        title += " <span class='" + textColor + "'><strong>" + brand.code;
                        title += "</strong> <span>"+ brand.status +"</span></span>?";

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            data: pageTitle.toLowerCase()
                        });
                    } else {
                        title += " <span class='" + textColor + "'><strong>";
                        title += selectedBrands.length;
                        title += "</strong> <span>"+ pageTitle.toLowerCase() +"</span></span>?";

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            data: selectedBrands.length + " " + pageTitle.toLowerCase()
                        });
                    }

                    $.SmartMessageBox({
                        title : title,
                        content : content,
                        buttons : '[' + noText + '][' + yesText + ']'
                    }, function(button) {
                        if (button === yesText) {
                            performChange(brand);
                        }
                    });
                } else {
                    content = _.string.sprintf(warningTemplate, {action: actionPresent});
                    if (confirm(content)) {
                        performChange(brand);
                    }
                }
            });
        }

        function createBrand() {
            vm.brand = {};
        }

        function deactivateBrands(brand) {
            // NOTE:...................................................
            // If we passed an brand, assume the deactivation of the single said brand.
            // else, assume the deactivation of all selected brands.

            changeActivation(brand, false);
        }

        function edit(item) {
            if (!item) {
                return;
            }

            // Use extend to prevent reference copying so we can edit the item in isolation.
            var brand = angular.extend({}, item);

            // Setup modal options.
            _brandDetailModalOptions.resolve = {
                data: function () {
                    return {
                        brand: brand,
                        brandId: _brandId,
                        isBranch: isBranch,
                        isEntity: isEntity
                    };
                }
            };

            // Open modal popup.
            var modalInstance = $modal.open(_brandDetailModalOptions);

            modalInstance.result.then(function (editedEntity) {
                // We selected ok...
                angular.extend(item, editedEntity);
            }, function () {
                // We cancelled the search...
                // Do nothing...
            });
        }

        function fetchBrands(page, pageSize, replaceRemoved, refresh) {
            brandDataSvc.getBrands(page, pageSize, vm.filter, vm.showInactive, replaceRemoved).then(function (data) {
                _currentPage = data.page;
                _pageSize = data.maxItems;
                _totalServerItems = data.inlineCount;

                if (refresh) {
                    vm.brands = [];
                }
                updateBrands(data.results);
            }, function (error) {

            });
        }

        function getFields() {
            return ["code", "description"];

        }

        function getSelectionKey() {
            return vm.selected ? "fc.CLEAR_SELECTION_TEXT" : "fc.SELECT_ALL_TEXT";
        }

        function getStatusToggleKey() {
            return vm.showInactive ? 'fc.HIDE_INACTIVE_TEXT' : 'fc.SHOW_INACTIVE_TEXT';
        }

        function hasNextPage() {
            var alreadyLoadedItems = ((_currentPage - 1) * _pageSize) + vm.brands.length;

            return alreadyLoadedItems < _totalServerItems;
        }

        function isBranch() {
            return _pin && _pin === 2;
        }

        function isEntity() {
            return _pin && _pin === 1;
        }

        function isFieldSelected(field) {
            return _.contains(vm.fields, field);
        }

        function load() {
            var subject = new Rx.Subject();
            subject.throttle(throttleValue).distinctUntilChanged().subscribe(function () {
                fetchBrands(_currentPage, _pageSize, null, true);
            });

            $scope.$watch(function () {
                return vm.filter;
            }, function (newValues) {
                /* TODO: Filter on all the properties in vm.fields.
                 ** If no field is selected, search on all fields.
                 */

                subject.onNext(newValues);

            });

            $scope.$watch(function() {
                return vm.showInactive;
            }, function () {
                fetchBrands(_currentPage, _pageSize, null, true);
            });
        }

        function loadNextPage() {
            fetchBrands(_currentPage + 1, _pageSize);
        }

        function refreshSelection() {
            // Use _.pluck style callback shorthand...
            var someSelected = _.any(vm.brands, "isSelected");

            // NOTE: lodash always returns true when all is an empty array. Bug or by design?
            var allSelected = someSelected && _.all(vm.brands, "isSelected");
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
            brandDataSvc.createBrand(vm.brand).then(function (data) {
                updateBrands(data);
                vm.brand = null;
                vm.isSaving = false;

            });

        }

        function selectAll() {
            if (!vm.selected || vm.selected === _selectionEnum.none) {
                _.forEach(vm.brands, function(brand) {
                    brand.isSelected = true;
                });
            } else {
                _.forEach(vm.brands, function(brand) {
                    brand.isSelected = false;
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

        function updateBrands(data, remove) {
            if (!_.isArray(vm.brands)) {
                vm.brands = [];
            }

            var index = -1;

            var updateSingle = function (item) {
                if (remove) {
                    index = vm.brands.indexOf(item);

                    if (index >= 0) {
                        vm.brands.splice(index, 1);
                    }
                } else {
                    vm.brands.push(item);
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

    brandDetail.$inject = ["$modalInstance", "brandDataSvc", "data"];

    function brandDetail($modalInstance, brandDataSvc, data) {
        var vm = this;

        vm.cancelChanges = cancelChanges;
        vm.brand = data.brand;
        vm.saveChanges = saveChanges;
        vm.validationData = null;

        activate();

        function activate() {
            vm.validationData = {
                //validation for the local fields
                status: {
                    required: true
                },
                code: {
                    required: true
                },
                description: {
                    required: false
                }
            };
        }

        function cancelChanges() {
            $modalInstance.dismiss();
        }

        function saveChanges() {
            // TODO: Enter save logic
            vm.isSaving = true;
            brandDataSvc.updateBrand(vm.brand.id, vm.brand).then(function (data) {
                $modalInstance.close(data);
                vm.brand = null;
                vm.isSaving = false;
            });
        }
    }
})();