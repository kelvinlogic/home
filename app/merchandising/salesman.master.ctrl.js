(function () {
    'use strict';

    angular
        .module('fc.merchandising')
        .controller('SalesmanMasterCtrl', salesmanMaster)
        .controller('SalesmanDetailCtrl', salesmanDetail);

    salesmanMaster.$inject = ['lodash', "rx", '$modal', '$scope', '$stateParams', '$translate', 'salesmanDataSvc', 'throttleValue'];

    /* @ngInject */
    function salesmanMaster(_, Rx, $modal, $scope, $stateParams, $translate, salesmanDataSvc, throttleValue) {
        /* jshint validthis: true */
        var vm = this,
            _salesmanDetailModalOptions = null,
            _selectionEnum = {"none": 0, "some": 1, "all": 2},
            _currentPage = null,
            _pageSize = null,
            _pin = null,
            _totalServerItems = null,
            _salesmanId = null;

        vm.activate = activate;
        vm.activateSalesmen = activateSalesmen;
        vm.cancelChanges = cancelChanges;
        vm.createSalesmen = createSalesmen;
        vm.edit = edit;
        vm.getFields = getFields;
        vm.getSelectionKey = getSelectionKey;
        vm.filter = null;
        vm.fields = [];
        vm.getStatusToggleKey = getStatusToggleKey;
        vm.hasNextPage = hasNextPage;
        vm.isFieldSelected = isFieldSelected;
        vm.loadNextPage = loadNextPage;
        vm.deactivateSalesmen = deactivateSalesmen;
        vm.saveChanges = saveChanges;
        vm.selectAll = selectAll;
        vm.selected = null;
        vm.showInactive = false;
        vm.salesmen = [];
        vm.salesman = null;
        vm.title = null;
        vm.titleKey = 'fc.merchandising.salesman.DETAIL_PAGE_TITLE';
        vm.toggleFilterField = toggleFilterField;
        vm.toggleSelection = toggleSelection;
        vm.validationData = null;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            _salesmanDetailModalOptions = {
                templateUrl: "fc/editModalTpl",
                controller: "SalesmanDetailCtrl as vm"
            };

            vm.validationData = {
                code: {
                    required: true
                },
                description: {
                    required: false
                }
            };

            load();
        }

        function activateSalesmen(salesman) {
            // NOTE:...................................................
            // If we passed a hierarchy, assume the activation of the single said hierarchy.
            // else, assume the activation of all selected salesmen.

            changeActivation(salesman, true);
        }

        function cancelChanges() {
            vm.salesman = null;
        }

        function changeActivation(salesman, newStatus) {
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

                var selectedSalesmen = [],
                    actionPast = newStatus ? restoreActionPast : deleteActionPast,
                    actionPresent = newStatus ? restoreActionPresent : deleteActionPresent;

                if (!salesman) {
                    selectedSalesmen = _.filter(vm.salesmen, function (ent) {
                        // Deselect items that won't be changed.
                        if (ent.active === newStatus) {
                            ent.isSelected = false;
                        }

                        return ent.isSelected;
                    });

                    // Can't change the state.
                    if (selectedSalesmen.length < 1) {
                        refreshSelection();
                        return;
                    }

                    refreshSelection();
                }

                var performChange = function (salesman) {
                    // If we get an reason, change it else change all selected salesmen.
                    var toChange = null;

                    if (salesman) {
                        toChange = salesman.id;
                    } else {
                        // Do nothing if there was no selection.
                        if (vm.selected === _selectionEnum.none) {
                            return;
                        }

                        // Fetch the selected hierarchies.
                        toChange = _.map(selectedSalesmen, function (salesman) {
                            return salesman.id;
                        });
                    }

                    if (newStatus === true) {
                        salesmanDataSvc.activateSalesmanData(toChange).then(afterChangeCb);
                    } else {
                        salesmanDataSvc.deactivateSalesmanData(toChange).then(afterChangeCb);
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
                        if (changedCount === 1 && salesman) {
                            msgData.data = salesman.code + " " + salesman.name;
                        } else {
                            msgData.data = changedCount + " " + pageTitle.toLowerCase();
                        }

                        message = _.string.sprintf(successTemplate, msgData);

                        var updateItem = function (ent) {
                            // If we are not showing inactive items, add the newly activated item.
                            if (!vm.showInactive) {
                                updateSalesmen(ent, !newStatus);
                            } else {
                                var idx = vm.reasons.indexOf(ent);

                                // Replace with new from data store.
                                if (idx >= 0) {
                                    var match = _(response).filter(function (resp) {
                                        return resp.id === ent.id;
                                    }).first();

                                    // Damn...we can't use splice here...
                                    angular.extend(vm.reasons[idx], match);
                                }
                            }
                        };

                        if (changedCount === 1 && salesman) {
                            updateItem(salesman);
                        } else {
                            _(selectedSalesmen).filter(function (salesman) {
                                return _.any(response, {id: salesman.id});
                            }).forEach(function (salesman) {
                                updateItem(salesman);
                            });
                        }

                        if (!vm.showInactive) {
                            if (newStatus) {
                                // If we are not showing inactive, remove extra items.
                                var startIndex = vm.salesmen.length - (1 + changedCount);
                                vm.salesmen.splice(startIndex, changedCount);
                            } else {
                                // If we are not showing inactive, load extra items to fill up the remaining slots.
                                fetchSalesmen(_currentPage, _pageSize, changedCount);
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
                    if (salesman) {
                        title += " <span class='" + textColor + "'><strong>" + salesman.code;
                        title += "</strong> <span>"+ salesman.name +"</span></span>?";

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            data: pageTitle
                        });
                    } else {
                        title += " <span class='" + textColor + "'><strong>";
                        title += selectedSalesmen.length;
                        title += "</strong> <span>"+ pageTitle.toLowerCase() +"</span></span>?";

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            data: selectedSalesmen.length + " " + pageTitle.toLowerCase()
                        });
                    }

                    $.SmartMessageBox({
                        title : title,
                        content : content,
                        buttons : '[' + noText + '][' + yesText + ']'
                    }, function(button) {
                        if (button === yesText) {
                            performChange(salesman);
                        }
                    });
                } else {
                    content = _.string.sprintf(warningTemplate, {action: actionPresent});
                    if (confirm(content)) {
                        performChange(salesman);
                    }
                }
            });
        }
           function createSalesmen() {
            vm.salesman = {};
        }

        function deactivateSalesmen(salesman) {
            // NOTE:...................................................
            // If we passed an reasons, assume the deactivation of the single said hierarchy.
            // else, assume the deactivation of all selected hierarchies.

            changeActivation(salesman, false);
        }

        function edit(item) {
            if (!item) {
                return;
            }

            // Use extend to prevent reference copying so we can edit the item in isolation.
            var salesman = angular.extend({}, item);

            // Setup modal options.
            _salesmanDetailModalOptions.resolve = {
                data: function () {
                    return {
                        salesman: salesman,
                        salesmanId: _salesmanId
                    };
                }
            };

            // Open modal popup.
            var modalInstance = $modal.open(_salesmanDetailModalOptions);

            modalInstance.result.then(function (editedEntity) {
                // We selected ok...
                angular.extend(item, editedEntity);
            }, function () {
                // We cancelled the search...
                // Do nothing...
            });
        }

        function fetchSalesmen(page, pageSize, replaceRemoved, refresh) {
            salesmanDataSvc.getSalesmanData( page, pageSize, vm.filter, vm.showInactive, replaceRemoved, refresh)
                .then(function (data) {
                    _currentPage = data.page;
                    _pageSize = data.maxItems;
                    _pin = data.pin;
                    _totalServerItems = data.inlineCount;

                    if (data.name && vm.title !== data.name) {
                        vm.title = data.name;
                    }

                    if (refresh) {
                        vm.reasons = [];
                    }

                    updateSalesmen(data.results);
                }, function (error) {

                });
        }

        function getFields() {
            return ["code", "name","branch","fromdate","todate"];
        }

        function getSelectionKey() {
            return vm.selected ? "fc.CLEAR_SELECTION_TEXT" : "fc.SELECT_ALL_TEXT";
        }

        function getStatusToggleKey() {
            return vm.showInactive ? 'fc.HIDE_INACTIVE_TEXT' : 'fc.SHOW_INACTIVE_TEXT';
        }

        function hasNextPage() {
            var alreadyLoadedItems = ((_currentPage - 1) * _pageSize) + vm.salesmen.length;

            return alreadyLoadedItems < _totalServerItems;
        }

        function isFieldSelected(field) {
            return _.contains(vm.fields, field);
        }

        function load() {
            _salesmanId = _.string.toNumber($stateParams.id);
            var subject = new Rx.Subject();
            subject.throttle(throttleValue).distinctUntilChanged().subscribe(function () {
                fetchSalesmen(_currentPage, _pageSize, null, true);
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

                fetchSalesmen(_currentPage, _pageSize, null, true);
            });
        }

        function loadNextPage() {
            fetchSalesmen(_currentPage + 1, _pageSize);
        }

        function refreshSelection() {
            // Use _.pluck style callback shorthand...
            var someSelected = _.any(vm.salesmen, "isSelected");

            // NOTE: lodash always returns true when all is an empty array. Bug or by design?
            var allSelected = someSelected && _.all(vm.salesmen, "isSelected");
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
            salesmanDataSvc.createSalesmanData(vm.salesman).then(function (data) {
                updateSalesmen(data);
                vm.salesman = null;
                vm.isSaving = false;

            });
        }

        function selectAll() {
            if (!vm.selected || vm.selected === _selectionEnum.none) {
                _.forEach(vm.salesmen, function(salesman) {
                    salesman.isSelected = true;
                });
            } else {
                _.forEach(vm.salesmen, function(salesman) {
                    salesman.isSelected = false;
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

        function updateSalesmen(data, remove) {
            if (!_.isArray(vm.salesmen)) {
                vm.salesmen = [];
            }

            var index = -1;

            var updateSingle = function (item) {
                if (remove) {
                    index = vm.salesmen.indexOf(item);

                    if (index >= 0) {
                        vm.salesmen.splice(index, 1);
                    }
                } else {
                    vm.salesmen.push(item);
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

    salesmanDetail.$inject = ["$modalInstance", "salesmanDataSvc", "data"];

    function salesmanDetail($modalInstance, salesmanDataSvc, data) {
        var vm = this,
            _salesmanId = data.Id;

        vm.cancelChanges = cancelChanges;
        vm.salesman = data.salesman;
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
            salesmanDataSvc.updateSalesmanData(vm.salesman.id, vm.salesman).then(function (data) {
                $modalInstance.close(data);
                vm.salesman = null;
                vm.isSaving = false;
            });
        }
    }
})();