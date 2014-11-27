(function () {
    'use strict';

    angular
        .module('fc.merchandising')
        .controller('VatMasterCtrl', vatMaster)
        .controller('VatDetailCtrl', vatDetail);

    vatMaster.$inject = ['lodash', "rx", '$modal', '$scope', '$stateParams', '$translate', 'vatDataSvc', 'throttleValue'];

    /* @ngInject */
    function vatMaster(_, Rx, $modal, $scope, $stateParams, $translate, vatDataSvc, throttleValue) {
        /* jshint validthis: true */
        var vm = this,
            _vatDetailModalOptions = null,
            _selectionEnum = {"none": 0, "some": 1, "all": 2},
            _currentPage = null,
            _pageSize = null,
            _pin = null,
            _totalServerItems = null,
            _vatId = null;

        vm.activate = activate;
        vm.activateVats = activateVats;
        vm.cancelChanges = cancelChanges;
        vm.createVat = createVat;
        vm.edit = edit;
        vm.getFields = getFields;
        vm.getSelectionKey = getSelectionKey;
        vm.filter = null;
        vm.fields = [];
        vm.getStatusToggleKey = getStatusToggleKey;
        vm.hasNextPage = hasNextPage;
        vm.isFieldSelected = isFieldSelected;
        vm.loadNextPage = loadNextPage;
        vm.deactivateVats = deactivateVats;
        vm.saveChanges = saveChanges;
        vm.selectAll = selectAll;
        vm.selected = null;
        vm.showInactive = false;
        vm.vats = [];
        vm.vat = null;
        vm.title = null;
        vm.titleKey = 'fc.merchandising.vat.DETAIL_PAGE_TITLE';
        vm.toggleFilterField = toggleFilterField;
        vm.toggleSelection = toggleSelection;
        vm.validationData = null;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            _vatDetailModalOptions = {
                templateUrl: "fc/editModalTpl",
                controller: "VatDetailCtrl as vm"
            };

            vm.validationData = {
                code: {
                    required: true
                },
                percentage: {
                    required: false
                },
                name: {
                    required: false
                }
            };

            load();
        }

        function activateVats(vat) {
            // NOTE:...................................................
            // If we passed a hierarchy, assume the activation of the single said hierarchy.
            // else, assume the activation of all selected hierarchies.

            changeActivation(vat, true);
        }

        function cancelChanges() {
            vm.vat = null;
        }

        function changeActivation(vat, newStatus) {
            // We need a status specified.
            if (newStatus !== true && newStatus !== false) {
                return;
            }

            var toTranslate = [
                "fc.merchandising.vat.MASTER_PAGE_TITLE",
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

                var selectedVats = [],
                    actionPast = newStatus ? restoreActionPast : deleteActionPast,
                    actionPresent = newStatus ? restoreActionPresent : deleteActionPresent;

                if (!vat) {
                    selectedVats = _.filter(vm.vats, function (ent) {
                        // Deselect items that won't be changed.
                        if (ent.active === newStatus) {
                            ent.isSelected = false;
                        }

                        return ent.isSelected;
                    });

                    // Can't change the state.
                    if (selectedVats.length < 1) {
                        refreshSelection();
                        return;
                    }

                    refreshSelection();
                }

                var performChange = function (vat) {
                    // If we get an reason, change it else change all selected hierarchies.
                    var toChange = null;

                    if (vat) {
                        toChange = vat.id;
                    } else {
                        // Do nothing if there was no selection.
                        if (vm.selected === _selectionEnum.none) {
                            return;
                        }

                        // Fetch the selected vat.
                        toChange = _.map(selectedVats, function (vat) {
                            return vat.id;
                        });
                    }

                    if (newStatus === true) {
                     vatDataSvc.activateVatData(toChange).then(afterChangeCb);
                    } else {
                        vatDataSvc.deactivateVatData(toChange).then(afterChangeCb);
                    }
                };

                var afterChangeCb = function(vat) {
                    var changedCount = vat.length;
                    var message = null;
                    var title = changedCount > 0 ? successAlertTitle : failAlertTitle;
                    var color = changedCount > 0 ? "#659265" : "#C46A69";
                    var icon = "fa fa-2x fadeInRight animated " + (changedCount > 0 ? "fa-check" : "fa-times");

                    if (changedCount > 0) {
                        var msgData = {action: actionPast};
                        if (changedCount === 1 && vat) {
                            msgData.data = vat.code + " " + vat.name;
                        } else {
                            msgData.data = changedCount + " " + pageTitle.toLowerCase();
                        }

                        message = _.string.sprintf(successTemplate, msgData);

                        var updateItem = function (ent) {
                            // If we are not showing inactive items, add the newly activated item.
                            if (!vm.showInactive) {
                                updateVats(ent, !newStatus);
                            } else {
                                var idx = vm.vats.indexOf(ent);

                                // Replace with new from data store.
                                if (idx >= 0) {
                                    var match = _(response).filter(function (resp) {
                                        return resp.id === ent.id;
                                    }).first();

                                    // Damn...we can't use splice here...
                                    angular.extend(vm.vats[idx], match);
                                }
                            }
                        };

                        if (changedCount === 1 && vat) {
                            updateItem(vat);
                        } else {
                            _(selectedVats).filter(function (vat) {
                                return _.any(vat, {id: vat.id});
                            }).forEach(function (vat) {
                                updateItem(vat);
                            });
                        }

                        if (!vm.showInactive) {
                            if (newStatus) {
                                // If we are not showing inactive, remove extra items.
                                var startIndex = vm.vats.length - (1 + changedCount);
                                vm.vats.splice(startIndex, changedCount);
                            } else {
                                // If we are not showing inactive, load extra items to fill up the remaining slots.
                                fetchVats(_currentPage, _pageSize, changedCount);
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
                    if (vat) {
                        title += " <span class='" + textColor + "'><strong>" + vat.code;
                        title += "</strong> <span>"+ vat.name +"</span></span>?";

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            data: pageTitle
                        });
                    } else {
                        title += " <span class='" + textColor + "'><strong>";
                        title += selectedVats.length;
                        title += "</strong> <span>"+ pageTitle.toLowerCase() +"</span></span>?";

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            data: selectedVats.length + " " + pageTitle.toLowerCase()
                        });
                    }

                    $.SmartMessageBox({
                        title : title,
                        content : content,
                        buttons : '[' + noText + '][' + yesText + ']'
                    }, function(button) {
                        if (button === yesText) {
                            performChange(vat);
                        }
                    });
                } else {
                    content = _.string.sprintf(warningTemplate, {action: actionPresent});
                    if (confirm(content)) {
                        performChange(vat);
                    }
                }
            });
        }

        function createVat() {
            vm.vat = {};
        }

        function deactivateVats(vat) {
            // NOTE:...................................................
            // If we passed an reasons, assume the deactivation of the single said hierarchy.
            // else, assume the deactivation of all selected hierarchies.

            changeActivation(vat, false);
        }

        function edit(item) {
            if (!item) {
                return;
            }

            // Use extend to prevent reference copying so we can edit the item in isolation.
            var vat = angular.extend({}, item);

            // Setup modal options.
            _vatDetailModalOptions.resolve = {
                data: function () {
                    return {
                        vat: vat,
                        vatsId: _vatId
                    };
                }
            };

            // Open modal popup.
            var modalInstance = $modal.open(_vatDetailModalOptions);

            modalInstance.result.then(function (editedEntity) {
                // We selected ok...
                angular.extend(item, editedEntity);
            }, function () {
                // We cancelled the search...
                // Do nothing...
            });
        }

        function fetchVats(page, pageSize, replaceRemoved, refresh) {
            vatDataSvc.getVatData( page, pageSize, vm.filter, vm.showInactive, replaceRemoved, refresh)
                .then(function (data) {
                    _currentPage = data.page;
                    _pageSize = data.maxItems;
                    _pin = data.pin;
                    _totalServerItems = data.inlineCount;

                    if (data.name && vm.title !== data.name) {
                        vm.title = data.name;
                    }

                    if (refresh) {
                        vm.vats = [];
                    }

                    updateVats(data.results);
                }, function (error) {

                });
        }

        function getFields() {
            return ["code", "name","percentage"];
        }

        function getSelectionKey() {
            return vm.selected ? "fc.CLEAR_SELECTION_TEXT" : "fc.SELECT_ALL_TEXT";
        }

        function getStatusToggleKey() {
            return vm.showInactive ? 'fc.HIDE_INACTIVE_TEXT' : 'fc.SHOW_INACTIVE_TEXT';
        }

        function hasNextPage() {
            var alreadyLoadedItems = ((_currentPage - 1) * _pageSize) + vm.vats.length;

            return alreadyLoadedItems < _totalServerItems;
        }

        function isFieldSelected(field) {
            return _.contains(vm.fields, field);
        }

        function load() {
            _vatId = _.string.toNumber($stateParams.id);
            var subject = new Rx.Subject();
            subject.throttle(throttleValue).distinctUntilChanged().subscribe(function () {
                fetchVats(_currentPage, _pageSize, null, true);
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

                fetchVats(_currentPage, _pageSize, null, true);
            });
        }

        function loadNextPage() {
            fetchVats(_currentPage + 1, _pageSize);
        }

        function refreshSelection() {
            // Use _.pluck style callback shorthand...
            var someSelected = _.any(vm.vats, "isSelected");

            // NOTE: lodash always returns true when all is an empty array. Bug or by design?
            var allSelected = someSelected && _.all(vm.vats, "isSelected");
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
            vatDataSvc.createVatData(vm.vat).then(function (data) {
                updateVats(data);
                vm.vat = null;
                vm.isSaving = false;

            });
        }

        function selectAll() {
            if (!vm.selected || vm.selected === _selectionEnum.none) {
                _.forEach(vm.vats, function(vat) {
                    vat.isSelected = true;
                });
            } else {
                _.forEach(vm.vats, function(vat) {
                    vat.isSelected = false;
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

        function updateVats(data, remove) {
            if (!_.isArray(vm.vats)) {
                vm.vats = [];
            }

            var index = -1;

            var updateSingle = function (item) {
                if (remove) {
                    index = vm.vats.indexOf(item);

                    if (index >= 0) {
                        vm.vats.splice(index, 1);
                    }
                } else {
                    vm.vats.push(item);
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

    vatDetail.$inject = ["$modalInstance", "vatDataSvc", "data"];

    function vatDetail($modalInstance, vatDataSvc, data) {
        var vm = this,
            _vatId = data.Id;

        vm.cancelChanges = cancelChanges;
        vm.vat = data.vat;
        vm.saveChanges = saveChanges;
        vm.validationData = null;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            vm.validationData = {
                code: {
                    required: true
                },
                percentage: {
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
            vatDataSvc.updateVatData(vm.vat.id, vm.vat).then(function (data) {
                $modalInstance.close(data);
                vm.vat = null;
                vm.isSaving = false;
            });
        }
    }
})();