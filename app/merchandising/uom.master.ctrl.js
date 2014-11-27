(function () {
    'use strict';

    angular
        .module('fc.merchandising')
        .controller('UomMasterCtrl', uomMaster)
        .controller('UomDetailCtrl', uomDetail);

    uomMaster.$inject = ['lodash', "rx", '$modal', '$scope', '$stateParams', '$translate', 'uomDataSvc', 'throttleValue'];
    /* @ngInject */
    function uomMaster(_, Rx, $modal, $scope, $stateParams, $translate, uomDataSvc, throttleValue) {
        /* jshint valid this: true */
        var vm = this,
            _uomDetailModalOptions = null,
            _selectionEnum = {"none": 0, "some": 1, "all": 2},
            _currentPage = null,
            _pageSize = null,
            _totalServerItems = null,
            _uomId = null;

        vm.activate = activate;
        vm.activateUoms = activateUoms;
        vm.cancelChanges = cancelChanges;
        vm.createUom = createUom;
        vm.edit = edit;
        vm.getFields = getFields;
        vm.getSelectionKey = getSelectionKey;

        vm.newUom = newUom;
        vm.saveChanges = saveChanges;
        vm.fetchUoms  = fetchUoms ;

        vm.filter = null;
        vm.fields = [];
        vm.getStatusToggleKey = getStatusToggleKey;
        vm.hasNextPage = hasNextPage;
        vm.isBranch = isBranch;
        vm.isEntity = isEntity;
        vm.isFieldSelected = isFieldSelected;
        vm.loadNextPage = loadNextPage;
        vm.deactivateUoms = deactivateUoms;

        vm.selectAll = selectAll;
        vm.selected = null;
        vm.showInactive = false;
        vm.uoms = [];
        vm.uom = null;
        vm.title = null;
        vm.titleKey = 'fc.merchandising.uom.MASTER_PAGE_TITLE';
        vm.toggleFilterField = toggleFilterField;
        vm.toggleSelection = toggleSelection;
        vm.validationData = null;

        activate();

        /*
         *   functions to perform crud functionality
         */

        function activate() {
            _uomDetailModalOptions = {
                templateUrl: "fc/editModalTpl",
                controller: "UomDetailCtrl as vm"
            };

            vm.validationData = {
                //validation for the local fields
                status: {
                    required: true
                },
                packagable:{
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

        function activateUoms(uom) {
            // NOTE:...................................................
            // If we passed a uom, assume the activation of the single said uom.
            // else, assume the activation of all selected uoms.

            changeActivation(uom, true);
        }

        function cancelChanges() {
            vm.uom = null;
        }

        function newUom() {
            vm.uom = {};
        }

        function changeActivation(uom, newStatus) {
            // We need a status specified.
            if (newStatus !== true && newStatus !== false) {
                return;
            }

            var toTranslate = [
                "fc.merchandising.uom.MASTER_PAGE_TITLE",
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
                var pageTitle = translations["fc.merchandising.uom.MASTER_PAGE_TITLE"],
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

                var selectedUoms = [],
                    actionPast = newStatus ? restoreActionPast : deleteActionPast,
                    actionPresent = newStatus ? restoreActionPresent : deleteActionPresent;

                if (!uom) {
                    selectedUoms = _.filter(vm.uoms, function (ent) {
                        // Deselect items that won't be changed.
                        if (ent.active === newStatus) {
                            ent.isSelected = false;
                        }

                        return ent.isSelected;
                    });

                    // Can't change the state.
                    if (selectedUoms.length < 1) {
                        refreshSelection();
                        return;
                    }

                    refreshSelection();
                }

                var performChange = function (uom) {
                    // If we get an uom, change it else change all selected uoms.
                    var toChange = null;

                    if (uom) {
                        toChange = uom.id;
                    } else {
                        // Do nothing if there was no selection.
                        if (vm.selected === _selectionEnum.none) {
                            return;
                        }

                        // Fetch the selected uoms.
                        toChange = _.map(selectedUoms, function (uom) {
                            return uom.id;
                        });
                    }

                    if (newStatus === true) {
                        uomDataSvc.activateUoms(toChange).then(afterChangeCb);
                    } else {
                        uomDataSvc.deactivateUoms(toChange).then(afterChangeCb);
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
                        if (changedCount === 1 && uom) {
                            msgData.data = uom.code + " " + uom.packagable;
                        } else {
                            msgData.data = changedCount + " " + pageTitle.toLowerCase();
                        }

                        message = _.string.sprintf(successTemplate, msgData);

                        var updateItem = function (ent) {
                            // If we are not showing inactive items, add the newly activated item.
                            if (!vm.showInactive) {
                                updateUoms(ent, !newStatus);
                            } else {
                                var idx = vm.uoms.indexOf(ent);

                                // Replace with new from data store.
                                if (idx >= 0) {
                                    var match = _(response).filter(function (resp) {
                                        return resp.id === ent.id;
                                    }).first();

                                    // Damn...we can't use splice here...
                                    angular.extend(vm.uoms[idx], match);
                                }
                            }
                        };

                        if (changedCount === 1 && uom) {
                            updateItem(uom);
                        } else {
                            _(selectedUoms).filter(function (uom) {
                                return _.any(response, {id: uom.id});
                            }).forEach(function (uom) {
                                updateItem(uom);
                            });
                        }

                        if (!vm.showInactive) {
                            if (newStatus) {
                                // If we are not showing inactive, remove extra items.
                                var startIndex = vm.uoms.length - (1 + changedCount);
                                vm.uoms.splice(startIndex, changedCount);
                            } else {
                                // If we are not showing inactive, load extra items to fill up the remaining slots.
                                fetchUoms(_currentPage, _pageSize, changedCount);
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

                    // Set the messages depending on whether we're restoring a single uom or a selection.
                    if (uom) {
                        title += " <span class='" + textColor + "'><strong>" + uom.code;
                        title += "</strong> <span>"+ uom.packagable +"</span></span>?";

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            data: pageTitle.toLowerCase()
                        });
                    } else {
                        title += " <span class='" + textColor + "'><strong>";
                        title += selectedUoms.length;
                        title += "</strong> <span>"+ pageTitle.toLowerCase() +"</span></span>?";

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            data: selectedUoms.length + " " + pageTitle.toLowerCase()
                        });
                    }

                    $.SmartMessageBox({
                        title : title,
                        content : content,
                        buttons : '[' + noText + '][' + yesText + ']'
                    }, function(button) {
                        if (button === yesText) {
                            performChange(uom);
                        }
                    });
                } else {
                    content = _.string.sprintf(warningTemplate, {action: actionPresent});
                    if (confirm(content)) {
                        performChange(uom);
                    }
                }
            });
        }

        function createUom() {
            vm.uom = {};
        }

        function deactivateUoms(uom) {
            // NOTE:...................................................
            // If we passed an uom, assume the deactivation of the single said uom.
            // else, assume the deactivation of all selected uoms.

            changeActivation(uom, false);
        }

        function edit(item) {
            if (!item) {
                return;
            }

            // Use extend to prevent reference copying so we can edit the item in isolation.
            var uom = angular.extend({}, item);

            // Setup modal options.
            _uomDetailModalOptions.resolve = {
                data: function () {
                    return {
                        uom: uom,
                        uomId: _uomId,
                        isBranch: isBranch,
                        isEntity: isEntity
                    };
                }
            };

            // Open modal popup.
            var modalInstance = $modal.open(_uomDetailModalOptions);

            modalInstance.result.then(function (editedEntity) {
                // We selected ok...
                angular.extend(item, editedEntity);
            }, function () {
                // We cancelled the search...
                // Do nothing...
            });
        }

        function fetchUoms(page, pageSize, replaceRemoved, refresh) {
            uomDataSvc.getUoms(page, pageSize, vm.filter, vm.showInactive, replaceRemoved).then(function (data) {
                _currentPage = data.page;
                _pageSize = data.maxItems;
                _totalServerItems = data.inlineCount;

                if (refresh) {
                    vm.uoms = [];
                }
                updateUoms(data.results);
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
            var alreadyLoadedItems = ((_currentPage - 1) * _pageSize) + vm.uoms.length;

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
                fetchUoms(_currentPage, _pageSize, null, true);
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
                fetchUoms(_currentPage, _pageSize, null, true);
            });
        }

        function loadNextPage() {
            fetchUoms(_currentPage + 1, _pageSize);
        }

        function refreshSelection() {
            // Use _.pluck style callback shorthand...
            var someSelected = _.any(vm.uoms, "isSelected");

            // NOTE: lodash always returns true when all is an empty array. Bug or by design?
            var allSelected = someSelected && _.all(vm.uoms, "isSelected");
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
            uomDataSvc.createUom(vm.uom).then(function (data) {
                updateUoms(data);
                vm.uom = null;
                vm.isSaving = false;

            });

        }

        function selectAll() {
            if (!vm.selected || vm.selected === _selectionEnum.none) {
                _.forEach(vm.uoms, function(uom) {
                    uom.isSelected = true;
                });
            } else {
                _.forEach(vm.uoms, function(uom) {
                    uom.isSelected = false;
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

        function updateUoms(data, remove) {
            if (!_.isArray(vm.uoms)) {
                vm.uoms = [];
            }

            var index = -1;

            var updateSingle = function (item) {
                if (remove) {
                    index = vm.uoms.indexOf(item);

                    if (index >= 0) {
                        vm.uoms.splice(index, 1);
                    }
                } else {
                    vm.uoms.push(item);
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

    uomDetail.$inject = ["$modalInstance", "uomDataSvc", "data"];

    function uomDetail($modalInstance, uomDataSvc, data) {
        var vm = this;

        vm.cancelChanges = cancelChanges;
        vm.uom = data.uom;
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
            uomDataSvc.updateUom(vm.uom.id, vm.uom).then(function (data) {
                $modalInstance.close(data);
                vm.uom = null;
                vm.isSaving = false;
            });
        }
    }
})();