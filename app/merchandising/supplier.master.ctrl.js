(function () {
    'use strict';

    angular
        .module('fc.merchandising')
        .controller('SupplierMasterCtrl', supplierMaster)
        .controller('SupplierDetailCtrl', supplierDetail);

    supplierMaster.$inject = ['lodash', "rx", '$modal', '$scope', '$stateParams', '$translate', 'supplierDataSvc', 'throttleValue'];

    /* @ngInject */
    function supplierMaster(_, Rx, $modal, $scope, $stateParams, $translate, supplierDataSvc, throttleValue) {
        /* jshint validthis: true */
        var vm = this,
            _supplierDetailModalOptions = null,
            _selectionEnum = {"none": 0, "some": 1, "all": 2},
            _currentPage = null,
            _pageSize = null,
            _pin = null,
            _totalServerItems = null,
            _supplierId = null;

        vm.activate = activate;
        vm.activateSuppliers = activateSuppliers;
        vm.cancelChanges = cancelChanges;
        vm.createSupplier = createSupplier;
        vm.edit = edit;
        vm.getFields = getFields;
        vm.getSelectionKey = getSelectionKey;
        vm.filter = null;
        vm.fields = [];
        vm.getStatusToggleKey = getStatusToggleKey;
        vm.hasNextPage = hasNextPage;
        vm.isSupplier = isSupplier;
        vm.isLocale = isLocale;
        vm.isFieldSelected = isFieldSelected;
        vm.loadNextPage = loadNextPage;
        vm.deactivateSuppliers = deactivateSuppliers;
        vm.saveChanges = saveChanges;
        vm.selectAll = selectAll;
        vm.selected = null;
        vm.showInactive = false;
        vm.suppliers = [];
        vm.supplier = null;
        vm.title = null;
        vm.titleKey = 'fc.merchandising.supplier.MASTER_PAGE_TITLE';
        vm.toggleFilterField = toggleFilterField;
        vm.toggleSelection = toggleSelection;
        vm.validationData = null;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            _supplierDetailModalOptions = {
                templateUrl: "fc/editModalTpl",
                controller: "SupplierDetailCtrl as vm"
            };

            vm.validationData = {
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
                }
            };

            load();
        }

        function activateSuppliers(supplier) {
            // NOTE:...................................................
            // If we passed a hierarchy, assume the activation of the single said hierarchy.
            // else, assume the activation of all selected hierarchies.

            changeActivation(supplier, true);
        }

        function cancelChanges() {
            vm.supplier = null;
        }

        function changeActivation(supplier, newStatus) {
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
                var pageTitle = translations["fc.merchandising.supplier.MASTER_PAGE_TITLE"],
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

                var selectedSuppliers = [],
                    actionPast = newStatus ? restoreActionPast : deleteActionPast,
                    actionPresent = newStatus ? restoreActionPresent : deleteActionPresent;

                if (!supplier) {
                    selectedSuppliers = _.filter(vm.suppliers, function (ent) {
                        // Deselect items that won't be changed.
                        if (ent.active === newStatus) {
                            ent.isSelected = false;
                        }

                        return ent.isSelected;
                    });

                    // Can't change the state.
                    if (selectedSuppliers.length < 1) {
                        refreshSelection();
                        return;
                    }

                    refreshSelection();
                }

                var performChange = function (supplier) {
                    // If we get an hierarchy, change it else change all selected hierarchies.
                    var toChange = null;

                    if (supplier) {
                        toChange = supplier.id;
                    } else {
                        // Do nothing if there was no selection.
                        if (vm.selected === _selectionEnum.none) {
                            return;
                        }

                        // Fetch the selected supplier.
                        toChange = _.map(selectedSuppliers, function (supplier) {
                            return supplier.id;
                        });
                    }

                    if (newStatus === true) {
                        supplierDataSvc.activateSuppliersData(toChange).then(afterChangeCb);
                    } else {
                        supplierDataSvc.deactivateSuppliersData(toChange).then(afterChangeCb);
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
                        if (changedCount === 1 && supplier) {
                            msgData.data = supplier.name + " " + supplier.location;
                        } else {
                            msgData.data = changedCount + " " + pageTitle.toLowerCase();
                        }

                        message = _.string.sprintf(successTemplate, msgData);

                        var updateItem = function (ent) {
                            // If we are not showing inactive items, add the newly activated item.
                            if (!vm.showInactive) {
                                updateSuppliers(ent, !newStatus);
                            } else {
                                var idx = vm.suppliers.indexOf(ent);

                                // Replace with new from data store.
                                if (idx >= 0) {
                                    var match = _(response).filter(function (resp) {
                                        return resp.id === ent.id;
                                    }).first();

                                    // Damn...we can't use splice here...
                                    angular.extend(vm.suppliers[idx], match);
                                }
                            }
                        };

                        if (changedCount === 1 && supplier) {
                            updateItem(supplier);
                        } else {
                            _(selectedSuppliers).filter(function (supplier) {
                                return _.any(response, {id: supplier.id});
                            }).forEach(function (supplier) {
                                updateItem(supplier);
                            });
                        }

                        if (!vm.showInactive) {
                            if (newStatus) {
                                // If we are not showing inactive, remove extra items.
                                var startIndex = vm.suppliers.length - (1 + changedCount);
                                vm.suppliers.splice(startIndex, changedCount);
                            } else {
                                // If we are not showing inactive, load extra items to fill up the remaining slots.
                                fetchSuppliers(_currentPage, _pageSize, changedCount);
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

                    // Set the messages depending on whether we're restoring a single hierarchy or a selection.
                    if (supplier) {
                        title += " <span class='" + textColor + "'><strong>" + supplier.name;
                        title += "</strong> <span>"+ supplier.location +"</span></span>?";

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            data: pageTitle
                        });
                    } else {
                        title += " <span class='" + textColor + "'><strong>";
                        title += selectedSuppliers.length;
                        title += "</strong> <span>"+ pageTitle.toLowerCase() +"</span></span>?";

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            data: selectedSuppliers.length + " " + pageTitle.toLowerCase()
                        });
                    }

                    $.SmartMessageBox({
                        title : title,
                        content : content,
                        buttons : '[' + noText + '][' + yesText + ']'
                    }, function(button) {
                        if (button === yesText) {
                            performChange(supplier);
                        }
                    });
                } else {
                    content = _.string.sprintf(warningTemplate, {action: actionPresent});
                    if (confirm(content)) {
                        performChange(supplier);
                    }
                }
            });
        }

        function createSupplier() {
            vm.supplier = {};
        }

        function deactivateSuppliers(supplier) {
            // NOTE:...................................................
            // If we passed an hierarchy, assume the deactivation of the single said hierarchy.
            // else, assume the deactivation of all selected hierarchies.

            changeActivation(supplier, false);
        }

        function edit(item) {
            if (!item) {
                return;
            }

            // Use extend to prevent reference copying so we can edit the item in isolation.
            var supplier = angular.extend({}, item);

            // Setup modal options.
            _supplierDetailModalOptions.resolve = {
                data: function () {
                    return {
                        supplier: supplier,
                        supplierId: _supplierId,
                        isLocale: isLocale,
                        isSupplier: isSupplier
                    };
                }
            };

            // Open modal popup.
            var modalInstance = $modal.open(_supplierDetailModalOptions);

            modalInstance.result.then(function (editedEntity) {
                // We selected ok...
                angular.extend(item, editedEntity);
            }, function () {
                // We cancelled the search...
                // Do nothing...
            });
        }

        function fetchSuppliers(page, pageSize, replaceRemoved, refresh) {
            supplierDataSvc.getSuppliersData( page, pageSize, vm.filter, vm.showInactive, replaceRemoved, refresh)
                .then(function (data) {
                    _currentPage = data.page;
                    _pageSize = data.maxItems;
                    _pin = data.pin;
                    _totalServerItems = data.inlineCount;

                    if (data.description && vm.title !== data.description) {
                        vm.title = data.description;
                    }
                   updateSuppliers(data.results);
                },
                function (error) {

                });
        }

        function getFields() {
            return ["code", "name", "location", "description"];
        }

        function getSelectionKey() {
            return vm.selected ? "fc.CLEAR_SELECTION_TEXT" : "fc.SELECT_ALL_TEXT";
        }

        function getStatusToggleKey() {
            return vm.showInactive ? 'fc.HIDE_INACTIVE_TEXT' : 'fc.SHOW_INACTIVE_TEXT';
        }

        function hasNextPage() {
            var alreadyLoadedItems = ((_currentPage - 1) * _pageSize) + vm.suppliers.length;

            return alreadyLoadedItems < _totalServerItems;
        }

        function isLocale() {
            return _pin && _pin === 2;
        }

        function isSupplier() {
            return _pin && _pin === 1;
        }

        function isFieldSelected(field) {
            return _.contains(vm.fields, field);
        }

        function load() {
              $scope.$watch(function() {
                return vm.showInactive;
            },
                  function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }
                fetchSuppliers(_currentPage, _pageSize, null, true);
            });
        }

        function loadNextPage() {
            fetchSuppliers(_currentPage + 1, _pageSize);
        }

        function refreshSelection() {
            // Use _.pluck style callback shorthand...
            var someSelected = _.any(vm.suppliers, "isSelected");

            // NOTE: lodash always returns true when all is an empty array. Bug or by design?
            var allSelected = someSelected && _.all(vm.suppliers, "isSelected");
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
            supplierDataSvc.createSupplierData(vm.supplier).then(function (data) {
                updateSuppliers(data);
                vm.supplier = null;
                vm.isSaving = false;

            });
        }

        function selectAll() {
            if (!vm.selected || vm.selected === _selectionEnum.none) {
                _.forEach(vm.suppliers, function(supplier) {
                    supplier.isSelected = true;
                });
            } else {
                _.forEach(vm.suppliers, function(supplier) {
                    supplier.isSelected = false;
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

        function updateSuppliers(data, remove) {
            if (!_.isArray(vm.suppliers)) {
                vm.suppliers = [];
            }

            var index = -1;

            var updateSingle = function (item) {
                if (remove) {
                    index = vm.suppliers.indexOf(item);

                    if (index >= 0) {
                        vm.suppliers.splice(index, 1);
                    }
                } else {
                    vm.suppliers.push(item);
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

    supplierDetail.$inject = ["$modalInstance", "supplierDataSvc", "data"];

    function supplierDetail($modalInstance, supplierDataSvc, data) {
        var vm = this,
            _supplierId = data.supplierId;

        vm.cancelChanges = cancelChanges;
        vm.supplier = data.supplier;
        vm.isLocale = data.isLocale;
        vm.isSupplier = data.isSupplier;
        vm.saveChanges = saveChanges;
        vm.validationData = null;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            vm.validationData = {
                code: {
                    required: true
                },
                name: {
                    required: true
                }
            };
        }

        function cancelChanges() {
            $modalInstance.dismiss();
        }

        function saveChanges() {
            vm.isSaving = true;
            supplierDataSvc.updateSupplierData(vm.supplier.id, vm.supplier).then(function (data) {
                $modalInstance.close(data);
                vm.supplier = null;
                vm.isSaving = false;
            });
        }
    }
})();