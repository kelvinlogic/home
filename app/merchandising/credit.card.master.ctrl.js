(function () {
    'use strict';

    angular
        .module('fc.merchandising')
        .controller('CreditCardMasterCtrl', creditCardMaster)
        .controller('CreditCardDetailCtrl', creditCardDetail);

    creditCardMaster.$inject = ['lodash', "rx", '$modal', '$scope', '$stateParams', '$translate', 'creditCardSvc', 'throttleValue'];
    /* @ngInject */
    function creditCardMaster(_, Rx, $modal, $scope, $stateParams, $translate, creditCardSvc, throttleValue) {
        /* jshint valid this: true */
        var vm = this,
            _creditCardDetailModalOptions = null,
            _selectionEnum = {"none": 0, "some": 1, "all": 2},
            _currentPage = null,
            _pageSize = null,
            _totalServerItems = null,
            _creditCardId = null;

        vm.activate = activate;
        vm.activateCreditCards = activateCreditCards;
        vm.cancelChanges = cancelChanges;
        vm.createCreditCard = createCreditCard;
        vm.edit = edit;
        vm.getFields = getFields;
        vm.getSelectionKey = getSelectionKey;

        vm.newCreditCard = newCreditCard;
        vm.saveChanges = saveChanges;
        vm.fetchCreditCards  = fetchCreditCards ;

        vm.filter = null;
        vm.fields = [];
        vm.getStatusToggleKey = getStatusToggleKey;
        vm.hasNextPage = hasNextPage;
        vm.isBranch = isBranch;
        vm.isEntity = isEntity;
        vm.isFieldSelected = isFieldSelected;
        vm.loadNextPage = loadNextPage;
        vm.deactivateCreditCards = deactivateCreditCards;

        vm.selectAll = selectAll;
        vm.selected = null;
        vm.showInactive = false;
        vm.creditCards = [];
        vm.creditCard = null;
        vm.title = null;
        vm.titleKey = 'fc.merchandising.creditCard.MASTER_PAGE_TITLE';
        vm.toggleFilterField = toggleFilterField;
        vm.toggleSelection = toggleSelection;
        vm.validationData = null;

        activate();

        /*
         *   functions to perform crud functionality
         */
        function activate() {
            _creditCardDetailModalOptions = {
                templateUrl: "fc/editModalTpl",
                controller: "CreditCardDetailCtrl as vm"
            };

            vm.validationData = {
                //validation for the local fields
                status: {
                    required: false
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

        function activateCreditCards(creditCard) {
            // NOTE:...................................................
            // If we passed a creditCard, assume the activation of the single said creditCard.
            // else, assume the activation of all selected creditCards.

            changeActivation(creditCard, true);
        }

        function cancelChanges() {
            vm.creditCard = null;
        }

        function newCreditCard() {
            vm.creditCard = {};
        }

        function changeActivation(creditCard, newStatus) {
            // We need a status specified.
            if (newStatus !== true && newStatus !== false) {
                return;
            }

            var toTranslate = [
                "fc.merchandising.creditCard.MASTER_PAGE_TITLE",
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
                var pageTitle = translations["fc.merchandising.creditCard.MASTER_PAGE_TITLE"],
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

                var selectedCreditCards = [],
                    actionPast = newStatus ? restoreActionPast : deleteActionPast,
                    actionPresent = newStatus ? restoreActionPresent : deleteActionPresent;

                if (!creditCard) {
                    selectedCreditCards = _.filter(vm.creditCards, function (ent) {
                        // Deselect items that won't be changed.
                        if (ent.active === newStatus) {
                            ent.isSelected = false;
                        }

                        return ent.isSelected;
                    });

                    // Can't change the state.
                    if (selectedCreditCards.length < 1) {
                        refreshSelection();
                        return;
                    }

                    refreshSelection();
                }

                var performChange = function (creditCard) {
                    // If we get an creditCard, change it else change all selected creditCards.
                    var toChange = null;

                    if (creditCard) {
                        toChange = creditCard.id;
                    } else {
                        // Do nothing if there was no selection.
                        if (vm.selected === _selectionEnum.none) {
                            return;
                        }

                        // Fetch the selected creditCards.
                        toChange = _.map(selectedCreditCards, function (creditCard) {
                            return creditCard.id;
                        });
                    }

                    if (newStatus === true) {
                        creditCardSvc.activateCreditCards(toChange).then(afterChangeCb);
                    } else {
                        creditCardSvc.deactivateCreditCards(toChange).then(afterChangeCb);
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
                                updateCreditCards(ent, !newStatus);
                            } else {
                                var idx = vm.creditCards.indexOf(ent);

                                // Replace with new from data store.
                                if (idx >= 0) {
                                    var match = _(response).filter(function (resp) {
                                        return resp.id === ent.id;
                                    }).first();

                                    // Damn...we can't use splice here...
                                    angular.extend(vm.creditCards[idx], match);
                                }
                            }
                        };

                        if (changedCount === 1 && creditCard) {
                            updateItem(creditCard);
                        } else {
                            _(selectedCreditCards).filter(function (creditCard) {
                                return _.any(response, {id: creditCard.id});
                            }).forEach(function (creditCard) {
                                updateItem(creditCard);
                            });
                        }

                        if (!vm.showInactive) {
                            if (newStatus) {
                                // If we are not showing inactive, remove extra items.
                                var startIndex = vm.creditCards.length - (1 + changedCount);
                                vm.creditCards.splice(startIndex, changedCount);
                            } else {
                                // If we are not showing inactive, load extra items to fill up the remaining slots.
                                fetchCreditCards(_currentPage, _pageSize, changedCount);
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

                    // Set the messages depending on whether we're restoring a single creditCard or a selection.
                    if (creditCard) {
                        title += " <span class='" + textColor + "'><strong>" + creditCard.code;
                        title += "</strong> <span>"+ creditCard.status +"</span></span>?";

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            count: 1
                        });
                    } else {
                        title += " <span class='" + textColor + "'><strong>";
                        title += selectedCreditCards.length;
                        title += "</strong> <span>"+ pageTitle.toLowerCase() +"</span></span>?";

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            data: selectedCreditCards.length + " " + pageTitle.toLowerCase()
                        });
                    }

                    $.SmartMessageBox({
                        title : title,
                        content : content,
                        buttons : '[' + noText + '][' + yesText + ']'
                    }, function(button) {
                        if (button === yesText) {
                            performChange(creditCard);
                        }
                    });
                } else {
                    content = _.string.sprintf(warningTemplate, {action: actionPresent,  count: selectedCreditCards.length || 1});
                    if (confirm(content)) {
                        performChange(creditCard);
                    }
                }
            });
        }

        function createCreditCard() {
            vm.creditCard = {};
        }

        function deactivateCreditCards(creditCard) {
            // NOTE:...................................................
            // If we passed an creditCard, assume the deactivation of the single said creditCard.
            // else, assume the deactivation of all selected creditCards.

            changeActivation(creditCard, false);
        }

        function edit(item) {
            if (!item) {
                return;
            }

            // Use extend to prevent reference copying so we can edit the item in isolation.
            var creditCard = angular.extend({}, item);

            // Setup modal options.
            _creditCardDetailModalOptions.resolve = {
                data: function () {
                    return {
                        creditCard: creditCard,
                        creditCardId: _creditCardId,
                        isBranch: isBranch,
                        isEntity: isEntity
                    };
                }
            };

            // Open modal popup.
            var modalInstance = $modal.open(_creditCardDetailModalOptions);

            modalInstance.result.then(function (editedEntity) {
                // We selected ok...
                angular.extend(item, editedEntity);
            }, function () {
                // We cancelled the search...
                // Do nothing...
            });
        }

        function fetchCreditCards(page, pageSize, replaceRemoved, refresh) {
            creditCardSvc.getCreditCards(page, pageSize, vm.filter, vm.showInactive, replaceRemoved).then(function (data) {
                _currentPage = data.page;
                _pageSize = data.maxItems;
                _totalServerItems = data.inlineCount;

                if (refresh) {
                    vm.creditCards = [];
                }
                updateCreditCards(data.results);
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
            var alreadyLoadedItems = ((_currentPage - 1) * _pageSize) + vm.creditCards.length;

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
                fetchCreditCards(_currentPage, _pageSize, null, true);
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
                fetchCreditCards(_currentPage, _pageSize, null, true);
            });
        }

        function loadNextPage() {
            fetchCreditCards(_currentPage + 1, _pageSize);
        }

        function refreshSelection() {
            // Use _.pluck style callback shorthand...
            var someSelected = _.any(vm.creditCards, "isSelected");

            // NOTE: lodash always returns true when all is an empty array. Bug or by design?
            var allSelected = someSelected && _.all(vm.creditCards, "isSelected");
            if (allSelected) {
                vm.selected = _selectionEnum.all;
            } else if (someSelected) {
                vm.selected = _selectionEnum.some;
            } else {
                vm.selected = _selectionEnum.none;
            }
        }

        function saveChanges() {
            console.log('saving data')
            vm.isSaving = true;
            creditCardSvc.createCreditCard(vm.creditCard).then(function (data) {
                updateCreditCards(data);
                vm.creditCard = null;
                vm.isSaving = false;

            });

        }

        function selectAll() {
            if (!vm.selected || vm.selected === _selectionEnum.none) {
                _.forEach(vm.creditCards, function(creditCard) {
                    creditCard.isSelected = true;
                });
            } else {
                _.forEach(vm.creditCards, function(creditCard) {
                    creditCard.isSelected = false;
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

        function updateCreditCards(data, remove) {
            if (!_.isArray(vm.creditCards)) {
                vm.creditCards = [];
            }

            var index = -1;

            var updateSingle = function (item) {
                if (remove) {
                    index = vm.creditCards.indexOf(item);

                    if (index >= 0) {
                        vm.creditCards.splice(index, 1);
                    }
                } else {
                    vm.creditCards.push(item);
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

    creditCardDetail.$inject = ["$modalInstance", "creditCardSvc", "data"];

    function creditCardDetail($modalInstance, creditCardSvc, data) {
        var vm = this;

        vm.cancelChanges = cancelChanges;
        vm.creditCard = data.creditCard;
        vm.saveChanges = saveChanges;
        vm.validationData = null;

        activate();

        function activate() {
            vm.validationData = {
                //validation for the local fields
                status: {
                    required: false
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
            console.log('saving data')
            vm.isSaving = true;
            creditCardSvc.updateCreditCard(vm.creditCard.id, vm.creditCard).then(function (data) {
                $modalInstance.close(data);
                vm.creditCard = null;
                vm.isSaving = false;
            });
        }
    }
})();