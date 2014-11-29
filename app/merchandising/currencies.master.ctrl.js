(function () {
    'use strict';

    angular
        .module('fc.merchandising')
        .controller('CurrencyMasterCtrl', currencyMaster)
        .controller('CurrencyDetailCtrl', currencyDetail);

    currencyMaster.$inject = [
        'lodash',
        "rx",
        '$modal',
        '$scope',
        '$stateParams',
        '$translate',
        'currencyDataSvc',
        'throttleValue'
    ];
    /* @ngInject */
    function currencyMaster(_, Rx, $modal, $scope, $stateParams, $translate, currencyDataSvc, throttleValue) {
        /* jshint valid this: true */
        var vm = this,
            _currencyDetailModalOptions = null,
            _selectionEnum = {"none": 0, "some": 1, "all": 2},
            _currentPage = null,
            _pageSize = null,
            _pin = null,
            _totalServerItems = null,
            _currencyId = null;

        vm.activate = activate;
        vm.activateCurrencies = activateCurrencies;
        vm.cancelChanges = cancelChanges;
        vm.createCurrency = createCurrency;
        vm.edit = edit;
        vm.getFields = getFields;
        vm.getSelectionKey = getSelectionKey;

        vm.newCurrency = newCurrency;
        vm.saveChanges = saveChanges;
        vm.fetchCurrencies  = fetchCurrencies ;

        vm.filter = null;
        vm.fields = [];
        vm.getStatusToggleKey = getStatusToggleKey;
        vm.hasNextPage = hasNextPage;
        vm.isBranch = isBranch;
        vm.isEntity = isEntity;
        vm.isFieldSelected = isFieldSelected;
        vm.loadNextPage = loadNextPage;
        vm.deactivateCurrencies = deactivateCurrencies;

        vm.selectAll = selectAll;
        vm.selected = null;
        vm.showInactive = false;
        vm.currencies = [];
        vm.currency = null;
        vm.title = null;
        vm.titleKey = 'fc.merchandising.currency.MASTER_PAGE_TITLE';
        vm.toggleFilterField = toggleFilterField;
        vm.toggleSelection = toggleSelection;
        vm.validationData = null;

        activate();

        /*
        *   functions to perform crud functionality
        */

        function activate() {
            _currencyDetailModalOptions = {
                templateUrl: "fc/editModalTpl",
                controller: "CurrencyDetailCtrl as vm"
            };
            vm.validationData = {
                //validation for the local fields
                abbreviation: {
                    required: true
                },
                name: {
                    required: true
                },
                unit: {
                    required: true
                },
                sub_unit: {
                    required: true
                },

                //validations for the currency master fields
                symbol: {
                    required: false
                },
                precision: {
                    required: true
                },
                scale: {
                    required: true
                },
                symbol_before_amount: {
                    required: true
                },
                display_symbol: {
                    required: true
                },
                order: {
                    required: true
                }
            };
            load();
        }

        function activateCurrencies(currency) {
            // NOTE:...................................................
            // If we passed a currency, assume the activation of the single said currency.
            // else, assume the activation of all selected currencies.

            changeActivation(currency, true);
        }

        function cancelChanges() {
            vm.currency = null;
        }

        function newCurrency() {
            vm.currency = {};
        }

        function changeActivation(currency, newStatus) {
            // We need a status specified.
            if (newStatus !== true && newStatus !== false) {
                return;
            }

            var toTranslate = [
                "fc.merchandising.currency.MASTER_PAGE_TITLE",
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
                var pageTitle = translations["fc.merchandising.currency.MASTER_PAGE_TITLE"],
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

                var selectedCurrencies = [],
                    actionPast = newStatus ? restoreActionPast : deleteActionPast,
                    actionPresent = newStatus ? restoreActionPresent : deleteActionPresent;

                if (!currency) {
                    selectedCurrencies = _.filter(vm.currencies, function (ent) {
                        // Deselect items that won't be changed.
                        if (ent.active === newStatus) {
                            ent.isSelected = false;
                        }

                        return ent.isSelected;
                    });

                    // Can't change the state.
                    if (selectedCurrencies.length < 1) {
                        refreshSelection();
                        return;
                    }

                    refreshSelection();
                }

                var performChange = function (currency) {
                    // If we get an currency, change it else change all selected currencies.
                    var toChange = null;

                    if (currency) {
                        toChange = currency.id;
                    } else {
                        // Do nothing if there was no selection.
                        if (vm.selected === _selectionEnum.none) {
                            return;
                        }

                        // Fetch the selected currencies.
                        toChange = _.map(selectedCurrencies, function (currency) {
                            return currency.id;
                        });
                    }

                    if (newStatus === true) {
                        currencyDataSvc.activateCurrencies(toChange).then(afterChangeCb);
                    } else {
                        currencyDataSvc.deactivateCurrencies(toChange).then(afterChangeCb);
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
                                updateCurrencies(ent, !newStatus);
                            } else {
                                var idx = vm.currencies.indexOf(ent);

                                // Replace with new from data store.
                                if (idx >= 0) {
                                    var match = _(response).filter(function (resp) {
                                        return resp.id === ent.id;
                                    }).first();

                                    // Damn...we can't use splice here...
                                    angular.extend(vm.currencies[idx], match);
                                }
                            }
                        };

                        if (changedCount === 1 && currency) {
                            updateItem(currency);
                        } else {
                            _(selectedCurrencies).filter(function (currency) {
                                return _.any(response, {id: currency.id});
                            }).forEach(function (currency) {
                                updateItem(currency);
                            });
                        }

                        if (!vm.showInactive) {
                            if (newStatus) {
                                // If we are not showing inactive, remove extra items.
                                var startIndex = vm.currencies.length - (1 + changedCount);
                                vm.currencies.splice(startIndex, changedCount);
                            } else {
                                // If we are not showing inactive, load extra items to fill up the remaining slots.
                                fetchCurrencies(_currentPage, _pageSize, changedCount);
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

                    // Set the messages depending on whether we're restoring a single currency or a selection.
                    if (currency) {
                        title += " <span class='" + textColor + "'><strong>" + currency.name;
                        title += "</strong> <span>"+ currency.abbreviation +"</span></span>?";

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            count: 1
                        });
                    } else {
                        title += " <span class='" + textColor + "'><strong>";
                        title += selectedCurrencies.length;
                        title += "</strong> <span>"+ pageTitle.toLowerCase() +"</span></span>?";

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            count: selectedCurrencies.length
                        });
                    }

                    $.SmartMessageBox({
                        title : title,
                        content : content,
                        buttons : '[' + noText + '][' + yesText + ']'
                    }, function(button) {
                        if (button === yesText) {
                            performChange(currency);
                        }
                    });
                } else {
                    content = _.string.sprintf(warningTemplate, {action: actionPresent, count: selectedCurrencies.length || 1});
                    if (confirm(content)) {
                        performChange(currency);
                    }
                }
            });
        }

        function createCurrency() {
            vm.currency = {};
        }

        function deactivateCurrencies(currency) {
            // NOTE:...................................................
            // If we passed an currency, assume the deactivation of the single said currency.
            // else, assume the deactivation of all selected currencies.

            changeActivation(currency, false);
        }

        function edit(item) {
            if (!item) {
                return;
            }

            // Use extend to prevent reference copying so we can edit the item in isolation.
            var currency = angular.extend({}, item);

            // Setup modal options.
            _currencyDetailModalOptions.resolve = {
                data: function () {
                    return {
                          currency: currency,
                        currencyId: _currencyId,
                        isBranch: isBranch,
                        isEntity: isEntity
                    };
                }
            };

            // Open modal popup.
            var modalInstance = $modal.open(_currencyDetailModalOptions);

            modalInstance.result.then(function (editedEntity) {
                // We selected ok...
                angular.extend(item, editedEntity);
            }, function () {
                // We cancelled the search...
                // Do nothing...
            });
        }

        function fetchCurrencies(page, pageSize, replaceRemoved, refresh) {
            currencyDataSvc.getCurrencies(page, pageSize, vm.filter, vm.showInactive, replaceRemoved).then(function (data) {
                _currentPage = data.page;
                _pageSize = data.maxItems;
                _totalServerItems = data.inlineCount;

                if (refresh) {
                    vm.currencies = [];
                }
                updateCurrencies(data.results);
            }, function (error) {

            });
        }

        function getFields() {
            return ["name", "abbreviation"];

        }

        function getSelectionKey() {
            return vm.selected ? "fc.CLEAR_SELECTION_TEXT" : "fc.SELECT_ALL_TEXT";
        }

        function getStatusToggleKey() {
            return vm.showInactive ? 'fc.HIDE_INACTIVE_TEXT' : 'fc.SHOW_INACTIVE_TEXT';
        }

        function hasNextPage() {
            var alreadyLoadedItems = ((_currentPage - 1) * _pageSize) + vm.currencies.length;

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
                fetchCurrencies(_currentPage, _pageSize, null, true);
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
                fetchCurrencies(_currentPage, _pageSize, null, true);
            });
        }

        function loadNextPage() {
            fetchCurrencies(_currentPage + 1, _pageSize);
        }

        function refreshSelection() {
            // Use _.pluck style callback shorthand...
            var someSelected = _.any(vm.currencies, "isSelected");

            // NOTE: lodash always returns true when all is an empty array. Bug or by design?
            var allSelected = someSelected && _.all(vm.currencies, "isSelected");
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
            currencyDataSvc.createCurrency(vm.currency).then(function (data) {
                updateCurrencies(data);
                vm.currency = null;
                vm.isSaving = false;

            });

        }

        function selectAll() {
            if (!vm.selected || vm.selected === _selectionEnum.none) {
                _.forEach(vm.currencies, function(currency) {
                    currency.isSelected = true;
                });
            } else {
                _.forEach(vm.currencies, function(currency) {
                    currency.isSelected = false;
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

        function updateCurrencies(data, remove) {
            if (!_.isArray(vm.currencies)) {
                vm.currencies = [];
            }

            var index = -1;

            var updateSingle = function (item) {
                if (remove) {
                    index = vm.currencies.indexOf(item);

                    if (index >= 0) {
                        vm.currencies.splice(index, 1);
                    }
                } else {
                    vm.currencies.push(item);
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

    currencyDetail.$inject = ["$modalInstance", "currencyDataSvc", "data"];

    function currencyDetail($modalInstance, currencyDataSvc, data){
        var vm = this;

        vm.cancelChanges = cancelChanges;
        vm.currency = data.currency;
        vm.saveChanges = saveChanges;
        vm.validationData = null;

        activate();

        function activate() {
            vm.validationData = {
                //validation for the local fields
                abbreviation: {
                    required: true
                },
                name: {
                    required: true
                },
                unit: {
                    required: true
                },
                sub_unit: {
                    required: true
                },

                //validations for the currency master fields
                symbol: {
                    required: false
                },
                precision: {
                    required: true
                },
                scale: {
                    required: true
                },
                symbol_before_amount: {
                    required: true
                },
                display_symbol: {
                    required: true
                },
                order: {
                    required: true
                }
            };
        }

        function cancelChanges() {
            $modalInstance.dismiss();
        }

        function saveChanges() {
            // TODO: Enter save logic
            vm.isSaving = true;
            currencyDataSvc.updateCurrency(vm.currency.id, vm.currency).then(function (data) {
                $modalInstance.close(data);
                vm.currency = null;
                vm.isSaving = false;
            });
        }
    }
})();