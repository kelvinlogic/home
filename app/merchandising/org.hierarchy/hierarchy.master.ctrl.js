(function () {
    'use strict';

    angular
        .module('fc.merchandising')
        .controller('HierarchyMasterCtrl', hierarchyMaster)
        .controller('HierarchyDetailCtrl', hierarchyDetail);

    hierarchyMaster.$inject = ['lodash', "rx", '$modal', '$scope', '$stateParams', '$translate', 'orgHierarchyDataSvc', 'throttleValue'];

    /* @ngInject */
    function hierarchyMaster(_, Rx, $modal, $scope, $stateParams, $translate, hierarchyDataSvc, throttleValue) {
        /* jshint validthis: true */
        var vm = this,
            _hierarchyDetailModalOptions = null,
            _selectionEnum = {"none": 0, "some": 1, "all": 2},
            _currentPage = null,
            _pageSize = null,
            _pin = null,
            _totalServerItems = null,
            _hierarchyId = null;

        vm.activate = activate;
        vm.activateHierarchies = activateHierarchies;
        vm.cancelChanges = cancelChanges;
        vm.createHierarchy = createHierarchy;
        vm.edit = edit;
        vm.getFields = getFields;
        vm.getSelectionKey = getSelectionKey;
        vm.filter = null;
        vm.fields = [];
        vm.getStatusToggleKey = getStatusToggleKey;
        vm.hasNextPage = hasNextPage;
        vm.isBranch = isBranch;
        vm.isEntity = isEntity;
        vm.isFieldSelected = isFieldSelected;
        vm.loadNextPage = loadNextPage;
        vm.deactivateHierarchies = deactivateHierarchies;
        vm.saveChanges = saveChanges;
        vm.selectAll = selectAll;
        vm.selected = null;
        vm.showInactive = false;
        vm.hierarchies = [];
        vm.hierarchy = null;
        vm.title = null;
        vm.titleKey = 'fc.merchandising.hierarchy.MASTER_PAGE_TITLE';
        vm.toggleFilterField = toggleFilterField;
        vm.toggleSelection = toggleSelection;
        vm.validationData = null;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            _hierarchyDetailModalOptions = {
                templateUrl: "fc/editModalTpl",
                controller: "HierarchyDetailCtrl as vm"
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

        function activateHierarchies(hierarchy) {
            // NOTE:...................................................
            // If we passed a hierarchy, assume the activation of the single said hierarchy.
            // else, assume the activation of all selected hierarchies.

            changeActivation(hierarchy, true);
        }

        function cancelChanges() {
            vm.hierarchy = null;
        }

        function changeActivation(hierarchy, newStatus) {
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
                var pageTitle = translations["fc.merchandising.hierarchy.MASTER_PAGE_TITLE"],
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

                var selectedHierarchies = [],
                    actionPast = newStatus ? restoreActionPast : deleteActionPast,
                    actionPresent = newStatus ? restoreActionPresent : deleteActionPresent;

                if (!hierarchy) {
                    selectedHierarchies = _.filter(vm.hierarchies, function (ent) {
                        // Deselect items that won't be changed.
                        if (ent.active === newStatus) {
                            ent.isSelected = false;
                        }

                        return ent.isSelected;
                    });

                    // Can't change the state.
                    if (selectedHierarchies.length < 1) {
                        refreshSelection();
                        return;
                    }

                    refreshSelection();
                }

                var performChange = function (hierarchy) {
                    // If we get an hierarchy, change it else change all selected hierarchies.
                    var toChange = null;

                    if (hierarchy) {
                        toChange = hierarchy.id;
                    } else {
                        // Do nothing if there was no selection.
                        if (vm.selected === _selectionEnum.none) {
                            return;
                        }

                        // Fetch the selected hierarchies.
                        toChange = _.map(selectedHierarchies, function (hierarchy) {
                            return hierarchy.id;
                        });
                    }

                    if (newStatus === true) {
                        hierarchyDataSvc.activateHierarchiesData(_hierarchyId, toChange).then(afterChangeCb);
                    } else {
                        hierarchyDataSvc.deactivateHierarchiesData(_hierarchyId, toChange).then(afterChangeCb);
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
                        if (changedCount === 1 && hierarchy) {
                            msgData.data = hierarchy.name + " " + hierarchy.location;
                        } else {
                            msgData.data = changedCount + " " + pageTitle.toLowerCase();
                        }

                        message = _.string.sprintf(successTemplate, msgData);

                        var updateItem = function (ent) {
                            // If we are not showing inactive items, add the newly activated item.
                            if (!vm.showInactive) {
                                updateHierarchies(ent, !newStatus);
                            } else {
                                var idx = vm.hierarchies.indexOf(ent);

                                // Replace with new from data store.
                                if (idx >= 0) {
                                    var match = _(response).filter(function (resp) {
                                        return resp.id === ent.id;
                                    }).first();

                                    // Damn...we can't use splice here...
                                    angular.extend(vm.hierarchies[idx], match);
                                }
                            }
                        };

                        if (changedCount === 1 && hierarchy) {
                            updateItem(hierarchy);
                        } else {
                            _(selectedHierarchies).filter(function (hierarchy) {
                                return _.any(response, {id: hierarchy.id});
                            }).forEach(function (hierarchy) {
                                updateItem(hierarchy);
                            });
                        }

                        if (!vm.showInactive) {
                            if (newStatus) {
                                // If we are not showing inactive, remove extra items.
                                var startIndex = vm.hierarchies.length - (1 + changedCount);
                                vm.hierarchies.splice(startIndex, changedCount);
                            } else {
                                // If we are not showing inactive, load extra items to fill up the remaining slots.
                                fetchHierarchies(_currentPage, _pageSize, changedCount);
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
                    if (hierarchy) {
                        title += " <span class='" + textColor + "'><strong>" + hierarchy.name;
                        title += "</strong> <span>"+ hierarchy.location +"</span></span>?";

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            data: pageTitle.toLowerCase()
                        });
                    } else {
                        title += " <span class='" + textColor + "'><strong>";
                        title += selectedHierarchies.length;
                        title += "</strong> <span>"+ pageTitle.toLowerCase() +"</span></span>?";

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            data: selectedHierarchies.length + " " + pageTitle.toLowerCase()
                        });
                    }

                    $.SmartMessageBox({
                        title : title,
                        content : content,
                        buttons : '[' + noText + '][' + yesText + ']'
                    }, function(button) {
                        if (button === yesText) {
                            performChange(hierarchy);
                        }
                    });
                } else {
                    content = _.string.sprintf(warningTemplate, {action: actionPresent});
                    if (confirm(content)) {
                        performChange(hierarchy);
                    }
                }
            });
        }

        function createHierarchy() {
            vm.hierarchy = {};
        }

        function deactivateHierarchies(hierarchy) {
            // NOTE:...................................................
            // If we passed an hierarchy, assume the deactivation of the single said hierarchy.
            // else, assume the deactivation of all selected hierarchies.

            changeActivation(hierarchy, false);
        }

        function edit(item) {
            if (!item) {
                return;
            }

            // Use extend to prevent reference copying so we can edit the item in isolation.
            var hierarchy = angular.extend({}, item);

            // Setup modal options.
            _hierarchyDetailModalOptions.resolve = {
                data: function () {
                    return {
                        hierarchy: hierarchy,
                        hierarchyId: _hierarchyId,
                        isBranch: isBranch,
                        isEntity: isEntity
                    };
                }
            };

            // Open modal popup.
            var modalInstance = $modal.open(_hierarchyDetailModalOptions);

            modalInstance.result.then(function (editedEntity) {
                // We selected ok...
                angular.extend(item, editedEntity);
            }, function () {
                // We cancelled the search...
                // Do nothing...
            });
        }

        function fetchHierarchies(page, pageSize, replaceRemoved, refresh) {
            hierarchyDataSvc.getHierarchiesData(_hierarchyId, page, pageSize, vm.filter, vm.showInactive, replaceRemoved, refresh)
                .then(function (data) {
                    _currentPage = data.page;
                    _pageSize = data.maxItems;
                    _pin = data.pin;
                    _totalServerItems = data.inlineCount;

                    if (data.description && vm.title !== data.description) {
                        vm.title = data.description;
                    }

                    if (refresh) {
                        vm.hierarchies = [];
                    }

                    updateHierarchies(data.results);
                }, function (error) {

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
            var alreadyLoadedItems = ((_currentPage - 1) * _pageSize) + vm.hierarchies.length;

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
            _hierarchyId = _.string.toNumber($stateParams.id);
            var subject = new Rx.Subject();
            subject.throttle(throttleValue).distinctUntilChanged().subscribe(function () {
                fetchHierarchies(_currentPage, _pageSize, null, true);
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

                fetchHierarchies(_currentPage, _pageSize, null, true);
            });
        }

        function loadNextPage() {
            fetchHierarchies(_currentPage + 1, _pageSize);
        }

        function refreshSelection() {
            // Use _.pluck style callback shorthand...
            var someSelected = _.any(vm.hierarchies, "isSelected");

            // NOTE: lodash always returns true when all is an empty array. Bug or by design?
            var allSelected = someSelected && _.all(vm.hierarchies, "isSelected");
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
            hierarchyDataSvc.createHierarchyData(_hierarchyId, vm.hierarchy).then(function (data) {
                updateHierarchies(data);
                vm.hierarchy = null;
                vm.isSaving = false;
            });
        }

        function selectAll() {
            if (!vm.selected || vm.selected === _selectionEnum.none) {
                _.forEach(vm.hierarchies, function(hierarchy) {
                    hierarchy.isSelected = true;
                });
            } else {
                _.forEach(vm.hierarchies, function(hierarchy) {
                    hierarchy.isSelected = false;
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

        function updateHierarchies(data, remove) {
            if (!_.isArray(vm.hierarchies)) {
                vm.hierarchies = [];
            }

            var index = -1;

            var updateSingle = function (item) {
                if (remove) {
                    index = vm.hierarchies.indexOf(item);

                    if (index >= 0) {
                        vm.hierarchies.splice(index, 1);
                    }
                } else {
                    vm.hierarchies.push(item);
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

    hierarchyDetail.$inject = ["$modalInstance", "orgHierarchyDataSvc", "data"];

    function hierarchyDetail($modalInstance, hierarchyDataSvc, data) {
        var vm = this,
            _hierarchyId = data.hierarchyId;

        vm.cancelChanges = cancelChanges;
        vm.hierarchy = data.hierarchy;
        vm.isBranch = data.isBranch;
        vm.isEntity = data.isEntity;
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
            hierarchyDataSvc.updateHierarchyData(_hierarchyId, vm.hierarchy.id, vm.hierarchy).then(function (data) {
                $modalInstance.close(data);
                vm.hierarchy = null;
                vm.isSaving = false;
            });
        }
    }
})();