(function () {
    'use strict';

    angular
        .module('fc.merchandising')
        .controller('ReasonMasterCtrl', reasonMaster)
        .controller('ReasonDetailCtrl', reasonDetail);

    reasonMaster.$inject = ['lodash', "rx", '$modal', '$scope', '$stateParams', '$translate', 'reasonDataSvc', 'throttleValue'];

    /* @ngInject */
    function reasonMaster(_, Rx, $modal, $scope, $stateParams, $translate, reasonDataSvc, throttleValue) {
        /* jshint validthis: true */
        var vm = this,
            _reasonDetailModalOptions = null,
            _selectionEnum = {"none": 0, "some": 1, "all": 2},
            _currentPage = null,
            _pageSize = null,
            _pin = null,
            _totalServerItems = null,
            _reasonId = null;

        vm.activate = activate;
        vm.activateReasons = activateReasons;
        vm.cancelChanges = cancelChanges;
        vm.createReason = createReason;
        vm.edit = edit;
        vm.getFields = getFields;
        vm.getSelectionKey = getSelectionKey;
        vm.filter = null;
        vm.fields = [];
        vm.getStatusToggleKey = getStatusToggleKey;
        vm.hasNextPage = hasNextPage;
        vm.isFieldSelected = isFieldSelected;
        vm.loadNextPage = loadNextPage;
        vm.deactivateReasons = deactivateReasons;
        vm.saveChanges = saveChanges;
        vm.selectAll = selectAll;
        vm.selected = null;
        vm.showInactive = false;
        vm.reasons = [];
        vm.reason = null;
        vm.title = null;
        vm.titleKey = 'fc.merchandising.reason.DETAIL_PAGE_TITLE';
        vm.toggleFilterField = toggleFilterField;
        vm.toggleSelection = toggleSelection;
        vm.validationData = null;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            _reasonDetailModalOptions = {
                templateUrl: "fc/editModalTpl",
                controller: "ReasonDetailCtrl as vm"
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

        function activateReasons(reason) {
            // NOTE:...................................................
            // If we passed a hierarchy, assume the activation of the single said hierarchy.
            // else, assume the activation of all selected hierarchies.

            changeActivation(reason, true);
        }

        function cancelChanges() {
            vm.reason = null;
        }

        function changeActivation(reason, newStatus) {
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
                var pageTitle = translations["fc.merchandising.reason.MASTER_PAGE_TITLE"],
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

                var selectedReasons = [],
                    actionPast = newStatus ? restoreActionPast : deleteActionPast,
                    actionPresent = newStatus ? restoreActionPresent : deleteActionPresent;

                if (!reason) {
                    selectedReasons = _.filter(vm.reasons, function (ent) {
                        // Deselect items that won't be changed.
                        if (ent.active === newStatus) {
                            ent.isSelected = false;
                        }

                        return ent.isSelected;
                    });

                    // Can't change the state.
                    if (selectedReasons.length < 1) {
                        refreshSelection();
                        return;
                    }

                    refreshSelection();
                }

                var performChange = function (reason) {
                    // If we get an reason, change it else change all selected hierarchies.
                    var toChange = null;

                    if (reason) {
                        toChange = reason.id;
                    } else {
                        // Do nothing if there was no selection.
                        if (vm.selected === _selectionEnum.none) {
                            return;
                        }

                        // Fetch the selected hierarchies.
                        toChange = _.map(selectedReasons, function (reason) {
                            return reason.id;
                        });
                    }

                    if (newStatus === true) {
                        reasonDataSvc.activateReasonData(toChange).then(afterChangeCb);
                    } else {
                        reasonDataSvc.deactivateReasonData(toChange).then(afterChangeCb);
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
                        if (changedCount === 1 && reason) {
                            msgData.data = reason.code + " " + reason.description;
                        } else {
                            msgData.data = changedCount + " " + pageTitle.toLowerCase();
                        }

                        message = _.string.sprintf(successTemplate, msgData);

                        var updateItem = function (ent) {
                            // If we are not showing inactive items, add the newly activated item.
                            if (!vm.showInactive) {
                                updateReasons(ent, !newStatus);
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

                        if (changedCount === 1 && reason) {
                            updateItem(reason);
                        } else {
                            _(selectedReasons).filter(function (reason) {
                                return _.any(response, {id: reason.id});
                            }).forEach(function (reason) {
                                updateItem(reason);
                            });
                        }

                        if (!vm.showInactive) {
                            if (newStatus) {
                                // If we are not showing inactive, remove extra items.
                                var startIndex = vm.reasons.length - (1 + changedCount);
                                vm.reasons.splice(startIndex, changedCount);
                            } else {
                                // If we are not showing inactive, load extra items to fill up the remaining slots.
                                fetchReasons(_currentPage, _pageSize, changedCount);
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
                    if (reason) {
                        title += " <span class='" + textColor + "'><strong>" + reason.code;
                        title += "</strong> <span>"+ reason.description +"</span></span>?";

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            data: pageTitle
                        });
                    } else {
                        title += " <span class='" + textColor + "'><strong>";
                        title += selectedReasons.length;
                        title += "</strong> <span>"+ pageTitle.toLowerCase() +"</span></span>?";

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            data: selectedReasons.length + " " + pageTitle.toLowerCase()
                        });
                    }

                    $.SmartMessageBox({
                        title : title,
                        content : content,
                        buttons : '[' + noText + '][' + yesText + ']'
                    }, function(button) {
                        if (button === yesText) {
                            performChange(reason);
                        }
                    });
                } else {
                    content = _.string.sprintf(warningTemplate, {action: actionPresent});
                    if (confirm(content)) {
                        performChange(reason);
                    }
                }
            });
        }

        function createReason() {
            vm.reason = {};
        }

        function deactivateReasons(reason) {
            // NOTE:...................................................
            // If we passed an reasons, assume the deactivation of the single said hierarchy.
            // else, assume the deactivation of all selected hierarchies.

            changeActivation(reason, false);
        }

        function edit(item) {
            if (!item) {
                return;
            }

            // Use extend to prevent reference copying so we can edit the item in isolation.
            var reason = angular.extend({}, item);

            // Setup modal options.
            _reasonDetailModalOptions.resolve = {
                data: function () {
                    return {
                        reason: reason,
                        reasonsId: _reasonId
                    };
                }
            };

            // Open modal popup.
            var modalInstance = $modal.open(_reasonDetailModalOptions);

            modalInstance.result.then(function (editedEntity) {
                // We selected ok...
                angular.extend(item, editedEntity);
            }, function () {
                // We cancelled the search...
                // Do nothing...
            });
        }

        function fetchReasons(page, pageSize, replaceRemoved, refresh) {
            reasonDataSvc.getReasonData( page, pageSize, vm.filter, vm.showInactive, replaceRemoved, refresh)
                .then(function (data) {
                    _currentPage = data.page;
                    _pageSize = data.maxItems;
                    _pin = data.pin;
                    _totalServerItems = data.inlineCount;

                    if (data.description && vm.title !== data.description) {
                        vm.title = data.description;
                    }

                    if (refresh) {
                        vm.reasons = [];
                    }

                    updateReasons(data.results);
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
            var alreadyLoadedItems = ((_currentPage - 1) * _pageSize) + vm.reasons.length;

            return alreadyLoadedItems < _totalServerItems;
        }

        function isFieldSelected(field) {
            return _.contains(vm.fields, field);
        }

        function load() {
            _reasonId = _.string.toNumber($stateParams.id);
            var subject = new Rx.Subject();
            subject.throttle(throttleValue).distinctUntilChanged().subscribe(function () {
                fetchReasons(_currentPage, _pageSize, null, true);
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

                fetchReasons(_currentPage, _pageSize, null, true);
            });
        }

        function loadNextPage() {
            fetchReasons(_currentPage + 1, _pageSize);
        }

        function refreshSelection() {
            // Use _.pluck style callback shorthand...
            var someSelected = _.any(vm.reasons, "isSelected");

            // NOTE: lodash always returns true when all is an empty array. Bug or by design?
            var allSelected = someSelected && _.all(vm.reasons, "isSelected");
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
            reasonDataSvc.createReasonData(vm.reason).then(function (data) {
                updateReasons(data);
                vm.reason = null;
                vm.isSaving = false;

            });
        }

        function selectAll() {
            if (!vm.selected || vm.selected === _selectionEnum.none) {
                _.forEach(vm.reasons, function(reason) {
                    reason.isSelected = true;
                });
            } else {
                _.forEach(vm.reasons, function(reason) {
                    reason.isSelected = false;
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

        function updateReasons(data, remove) {
            if (!_.isArray(vm.reasons)) {
                vm.reasons = [];
            }

            var index = -1;

            var updateSingle = function (item) {
                if (remove) {
                    index = vm.reasons.indexOf(item);

                    if (index >= 0) {
                        vm.reasons.splice(index, 1);
                    }
                } else {
                    vm.reasons.push(item);
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

    reasonDetail.$inject = ["$modalInstance", "reasonDataSvc", "data"];

    function reasonDetail($modalInstance, reasonDataSvc, data) {
        var vm = this,
            _reasonId = data.Id;

        vm.cancelChanges = cancelChanges;
        vm.reason = data.reason;
        vm.saveChanges = saveChanges;
        vm.validationData = null;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            vm.validationData = {
                code: {
                    required: true
                },
                description: {
                    required: true
                }
            };
        }

        function cancelChanges() {
            $modalInstance.dismiss();
        }

        function saveChanges() {
            vm.isSaving = true;
            reasonDataSvc.updateReasonData(vm.reason.id, vm.reason).then(function (data) {
                $modalInstance.close(data);
                vm.reason = null;
                vm.isSaving = false;
            });
        }
    }
})();