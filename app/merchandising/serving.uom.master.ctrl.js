(function () {
    'use strict';

    angular
        .module('fc.merchandising')
        .controller('ServingMasterCtrl', servingMaster)
        .controller('ServingDetailCtrl', servingDetail);

    servingMaster.$inject = ['lodash', "rx", '$modal', '$scope', '$stateParams', '$translate', 'servingDataSvc', 'throttleValue'];

    /* @ngInject */
    function servingMaster(_, Rx, $modal, $scope, $stateParams, $translate, servingDataSvc, throttleValue) {
        /* jshint validthis: true */
        var vm = this,
            _servingDetailModalOptions = null,
            _selectionEnum = {"none": 0, "some": 1, "all": 2},
            _currentPage = null,
            _pageSize = null,
            _pin = null,
            _totalServerItems = null,
            _servingId = null;

        vm.activate = activate;
        vm.activateServings = activateServings;
        vm.cancelChanges = cancelChanges;
        vm.createServing = createServing;
        vm.edit = edit;
        vm.getFields = getFields;
        vm.getSelectionKey = getSelectionKey;
        vm.filter = null;
        vm.fields = [];
        vm.getStatusToggleKey = getStatusToggleKey;
        vm.hasNextPage = hasNextPage;
        vm.isFieldSelected = isFieldSelected;
        vm.loadNextPage = loadNextPage;
        vm.deactivateServings = deactivateServings;
        vm.saveChanges = saveChanges;
        vm.selectAll = selectAll;
        vm.selected = null;
        vm.showInactive = false;
        vm.servings = [];
        vm.serving = null;
        vm.title = null;
        vm.titleKey = 'fc.merchandising.servingUom.DETAIL_PAGE_TITLE';
        vm.toggleFilterField = toggleFilterField;
        vm.toggleSelection = toggleSelection;
        vm.validationData = null;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            _servingDetailModalOptions = {
                templateUrl: "fc/editModalTpl",
                controller: "ServingDetailCtrl as vm"
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

        function activateServings(serving) {
            // NOTE:...................................................
            // If we passed a hierarchy, assume the activation of the single said hierarchy.
            // else, assume the activation of all selected hierarchies.

            changeActivation(serving, true);
        }

        function cancelChanges() {
            vm.serving = null;
        }

        function changeActivation(serving, newStatus) {
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
                var pageTitle = translations["fc.merchandising.supplier.DETAIL_PAGE_TITLE"],
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

                var selectedServings = [],
                    actionPast = newStatus ? restoreActionPast : deleteActionPast,
                    actionPresent = newStatus ? restoreActionPresent : deleteActionPresent;

                if (!serving) {
                    selectedServings = _.filter(vm.servings, function (ent) {
                        // Deselect items that won't be changed.
                        if (ent.active === newStatus) {
                            ent.isSelected = false;
                        }

                        return ent.isSelected;
                    });

                    // Can't change the state.
                    if (selectedServings.length < 1) {
                        refreshSelection();
                        return;
                    }

                    refreshSelection();
                }

                var performChange = function (serving) {
                    // If we get an serving, change it else change all selected hierarchies.
                    var toChange = null;

                    if (serving) {
                        toChange = serving.id;
                    } else {
                        // Do nothing if there was no selection.
                        if (vm.selected === _selectionEnum.none) {
                            return;
                        }

                        // Fetch the selected hierarchies.
                        toChange = _.map(selectedServings, function (serving) {
                            return serving.id;
                        });
                    }

                    if (newStatus === true) {
                        servingDataSvc.activateServingData(toChange).then(afterChangeCb);
                    } else {
                        servingDataSvc.deactivateServingData(toChange).then(afterChangeCb);
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
                        if (changedCount === 1 && serving) {
                            msgData.data = serving.code + " " + serving.description;
                        } else {
                            msgData.data = changedCount + " " + pageTitle.toLowerCase();
                        }

                        message = _.string.sprintf(successTemplate, msgData);

                        var updateItem = function (ent) {
                            // If we are not showing inactive items, add the newly activated item.
                            if (!vm.showInactive) {
                                updateServings(ent, !newStatus);
                            } else {
                                var idx = vm.servings.indexOf(ent);

                                // Replace with new from data store.
                                if (idx >= 0) {
                                    var match = _(response).filter(function (resp) {
                                        return resp.id === ent.id;
                                    }).first();

                                    // Damn...we can't use splice here...
                                    angular.extend(vm.servings[idx], match);
                                }
                            }
                        };

                        if (changedCount === 1 && serving) {
                            updateItem(serving);
                        } else {
                            _(selectedServings).filter(function (serving) {
                                return _.any(response, {id: serving.id});
                            }).forEach(function (serving) {
                                updateItem(serving);
                            });
                        }

                        if (!vm.showInactive) {
                            if (newStatus) {
                                // If we are not showing inactive, remove extra items.
                                var startIndex = vm.servings.length - (1 + changedCount);
                                vm.servings.splice(startIndex, changedCount);
                            } else {
                                // If we are not showing inactive, load extra items to fill up the remaining slots.
                                fetchServings(_currentPage, _pageSize, changedCount);
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

                    // Set the messages depending on whether we're restoring a single serving or a selection.
                    if (serving) {
                        title += " <span class='" + textColor + "'><strong>" + serving.code;
                        title += "</strong> <span>"+ serving.description +"</span></span>?";

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            data: pageTitle
                        });
                    } else {
                        title += " <span class='" + textColor + "'><strong>";
                        title += selectedServings.length;
                        title += "</strong> <span>"+ pageTitle.toLowerCase() +"</span></span>?";

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            data: selectedServings.length + " " + pageTitle.toLowerCase()
                        });
                    }

                    $.SmartMessageBox({
                        title : title,
                        content : content,
                        buttons : '[' + noText + '][' + yesText + ']'
                    }, function(button) {
                        if (button === yesText) {
                            performChange(serving);
                        }
                    });
                } else {
                    content = _.string.sprintf(warningTemplate, {action: actionPresent});
                    if (confirm(content)) {
                        performChange(serving);
                    }
                }
            });
        }

        function createServing() {
            vm.serving = {};
        }

        function deactivateServings(serving) {
            // NOTE:...................................................
            // If we passed an hierarchy, assume the deactivation of the single said hierarchy.
            // else, assume the deactivation of all selected hierarchies.

            changeActivation(serving, false);
        }

        function edit(item) {
            if (!item) {
                return;
            }

            // Use extend to prevent reference copying so we can edit the item in isolation.
            var serving = angular.extend({}, item);

            // Setup modal options.
            _servingDetailModalOptions.resolve = {
                data: function () {
                    return {
                        serving: serving,
                        servingId: _servingId
                     };
                }
            };

            // Open modal popup.
            var modalInstance = $modal.open(_servingDetailModalOptions);

            modalInstance.result.then(function (editedEntity) {
                // We selected ok...
                angular.extend(item, editedEntity);
            }, function () {
                // We cancelled the search...
                // Do nothing...
            });
        }

        function fetchServings(page, pageSize, replaceRemoved, refresh) {
            servingDataSvc.getServingData( page, pageSize, vm.filter, vm.showInactive, replaceRemoved, refresh)
                .then(function (data) {
                    _currentPage = data.page;
                    _pageSize = data.maxItems;
                    _pin = data.pin;
                    _totalServerItems = data.inlineCount;

                    if (data.description && vm.title !== data.description) {
                        vm.title = data.description;
                    }

                    if (refresh) {
                        vm.servings = [];
                    }

                    updateServings(data.results);
                }, function (error) {

                });
        }

        function getFields() {
            return ["code","description"];
        }

        function getSelectionKey() {
            return vm.selected ? "fc.CLEAR_SELECTION_TEXT" : "fc.SELECT_ALL_TEXT";
        }

        function getStatusToggleKey() {
            return vm.showInactive ? 'fc.HIDE_INACTIVE_TEXT' : 'fc.SHOW_INACTIVE_TEXT';
        }

        function hasNextPage() {
            var alreadyLoadedItems = ((_currentPage - 1) * _pageSize) + vm.servings.length;

            return alreadyLoadedItems < _totalServerItems;
        }

        function isFieldSelected(field) {
            return _.contains(vm.fields, field);
        }

        function load() {
            _servingId = _.string.toNumber($stateParams.id);
            var subject = new Rx.Subject();
            subject.throttle(throttleValue).distinctUntilChanged().subscribe(function () {
                fetchServings(_currentPage, _pageSize, null, true);
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

                fetchServings(_currentPage, _pageSize, null, true);
            });
        }

        function loadNextPage() {
            fetchServings(_currentPage + 1, _pageSize);
        }

        function refreshSelection() {
            // Use _.pluck style callback shorthand...
            var someSelected = _.any(vm.servings, "isSelected");

            // NOTE: lodash always returns true when all is an empty array. Bug or by design?
            var allSelected = someSelected && _.all(vm.servings, "isSelected");
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
            servingDataSvc.createServingData(vm.serving).then(function (data) {
                updateServings(data);
                vm.serving = null;
                vm.isSaving = false;

            });
        }

        function selectAll() {
            if (!vm.selected || vm.selected === _selectionEnum.none) {
                _.forEach(vm.servings, function(serving) {
                    serving.isSelected = true;
                });
            } else {
                _.forEach(vm.servings, function(serving) {
                    serving.isSelected = false;
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

        function updateServings(data, remove) {
            if (!_.isArray(vm.servings)) {
                vm.servings = [];
            }

            var index = -1;

            var updateSingle = function (item) {
                if (remove) {
                    index = vm.servings.indexOf(item);

                    if (index >= 0) {
                        vm.servings.splice(index, 1);
                    }
                } else {
                    vm.servings.push(item);
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

    servingDetail.$inject = ["$modalInstance", "servingDataSvc", "data"];

    function servingDetail($modalInstance, servingDataSvc, data) {
        var vm = this,
            _servingId = data.servingId;

        vm.cancelChanges = cancelChanges;
        vm.serving = data.serving;
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
            servingDataSvc.updateServingData(vm.serving.id, vm.serving).then(function (data) {
                $modalInstance.close(data);
                vm.serving = null;
                vm.isSaving = false;
            });
        }
    }
})();