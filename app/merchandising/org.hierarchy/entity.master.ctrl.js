(function () {
    'use strict';

    angular
        .module('fc.merchandising')
        .controller('EntityMasterCtrl', entityMaster)
        .controller('EntityDetailCtrl', entityDetail);

    entityMaster.$inject = ['lodash', "rx", '$modal', '$translate', '$scope', 'entityDataSvc'];

    /* @ngInject */
    function entityMaster(_, Rx, $modal, $translate, $scope, entityDataSvc) {
        /* jshint validthis: true */
        var vm = this,
            _entityDetailModalOptions = null,
            _selectionEnum = {"none": 0, "some": 1, "all": 2},
            _currentPage = null,
            _pageSize = null,
            _totalServerItems = null;

        vm.activate = activate;
        vm.activateEntities = activateEntities;
        vm.cancelChanges = cancelChanges;
        vm.edit = edit;
        vm.getFields = getFields;
        vm.availableFields = ["id", "code", "name", "location", "description"];
        vm.getSelectionKey = getSelectionKey;
        vm.filter = null;
        vm.fields = [];
        vm.getStatusToggleKey = getStatusToggleKey;
        vm.hasNextPage = hasNextPage;
        vm.isFieldSelected = isFieldSelected;
        vm.loadNextPage = loadNextPage;
        vm.newEntity = newEntity;
        vm.pagination = {};
        vm.deactivate = deactivate;
        vm.saveChanges = saveChanges;
        vm.selectAll = selectAll;
        vm.selected = null;
        vm.selectedAll = false;
        vm.showInactive = false;
        vm.entities = [];
        vm.entity = null;
        vm.titleKey = 'fc.merchandising.entity.MASTER_PAGE_TITLE';
        vm.toggleFilterField = toggleFilterField;
        vm.toggleSelection = toggleSelection;
        vm.validationData = null;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            _entityDetailModalOptions = {
                templateUrl: "fc/editModalTpl",
                controller: "EntityDetailCtrl as vm"
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

            // TODO: Load user data here.
            load();
        }

        function activateEntities(entity) {
            // NOTE:...................................................
            // If we passed an entity, assume the activation of the single said entity.
            // else, assume the activation of all selected entities.

            changeActivation(entity, true);
        }

        function cancelChanges() {
            vm.entity = null;
        }

        function deactivate(entity) {
            // NOTE:...................................................
            // If we passed an entity, assume the deactivation of the single said entity.
            // else, assume the deactivation of all selected entities.

            changeActivation(entity, false);
        }

        function changeActivation(entity, newStatus) {
            // We need a status specified.
            if (newStatus !== true && newStatus !== false) {
                return;
            }

            var toTranslate = [
                "fc.merchandising.entity.MASTER_PAGE_TITLE",
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
                var pageTitle = translations["fc.merchandising.entity.MASTER_PAGE_TITLE"],
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

                var selectedEntities = [],
                    actionPast = newStatus ? restoreActionPast : deleteActionPast,
                    actionPresent = newStatus ? restoreActionPresent : deleteActionPresent;

                if (!entity) {
                    selectedEntities = _.filter(vm.entities, function (ent) {
                        // Deselect items that won't be changed.
                        if (ent.active === newStatus) {
                            ent.isSelected = false;
                        }

                        return ent.isSelected;
                    });

                    // Can't change the state.
                    if (selectedEntities.length < 1) {
                        return;
                    }
                }

                var performChange = function (entity) {
                    // If we get an entity, change it else change all selected entities.
                    var toChange = null;

                    if (entity) {
                        toChange = entity.id;
                    } else {
                        // Do nothing if there was no selection.
                        if (vm.selected === _selectionEnum.none) {
                            return;
                        }

                        // Fetch the selected entities.
                        toChange = _.map(selectedEntities, function (entity) {
                            return entity.id;
                        });
                    }

                    if (newStatus === true) {
                        entityDataSvc.activateEntities(toChange).then(afterChangeCb);
                    } else {
                        entityDataSvc.deactivateEntities(toChange).then(afterChangeCb);
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
                        if (changedCount === 1 && entity) {
                            msgData.data = entity.name + " " + entity.location;
                        } else {
                            msgData.data = changedCount + " " + pageTitle.toLowerCase();
                        }

                        message = _.string.sprintf(successTemplate, msgData);

                        var updateItem = function (ent) {
                            // If we are not showing inactive items, add the newly activated item.
                            if (!vm.showInactive) {
                                updateEntities(ent, !newStatus);
                            } else {
                                var idx = vm.entities.indexOf(ent);

                                // Replace with new from data store.
                                if (idx >= 0) {
                                    var match = _(response).filter(function (resp) {
                                        return resp.id === ent.id;
                                    }).first();

                                    // Damn...we can't use splice here...
                                    angular.extend(vm.entities[idx], match);
                                }
                            }
                        };

                        if (changedCount === 1 && entity) {
                            updateItem(entity);
                        } else {
                            _(selectedEntities).filter(function (entity) {
                                return _.any(response, {id: entity.id});
                            }).forEach(function (entity) {
                                updateItem(entity);
                            });
                        }

                        if (!vm.showInactive) {
                            if (newStatus) {
                                // If we are not showing inactive, remove extra items.
                                var startIndex = vm.entities.length - (1 + changedCount);
                                vm.entities.splice(startIndex, changedCount);
                            } else {
                                // If we are not showing inactive, load extra items to fill up the remaining slots.
                                fetchEntities(_currentPage, _pageSize, changedCount);
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

                    // Set the messages depending on whether we're restoring a single entity or a selection.
                    if (entity) {
                        title += " <span class='" + textColor + "'><strong>" + entity.name;
                        title += "</strong> <span>"+ entity.location +"</span></span>?";

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            data: pageTitle.toLowerCase()
                        });
                    } else {
                        title += " <span class='" + textColor + "'><strong>";
                        title += selectedEntities.length;
                        title += "</strong> <span>"+ pageTitle.toLowerCase() +"</span></span>?";

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            data: selectedEntities.length + " " + pageTitle.toLowerCase()
                        });
                    }

                    $.SmartMessageBox({
                        title : title,
                        content : content,
                        buttons : '[' + noText + '][' + yesText + ']'
                    }, function(button) {
                        if (button === yesText) {
                            performChange(entity);
                        }
                    });
                } else {
                    content = _.string.sprintf(warningTemplate, {action: actionPresent});
                    if (confirm(content)) {
                        performChange(entity);
                    }
                }
            });
        }

        function edit(item) {
            if (!item) {
                return;
            }

            // Use extend to prevent reference copying so we can edit the item in isolation.
            var entity = angular.extend({}, item);

            // Setup modal options.
            _entityDetailModalOptions.resolve = {
                data: function () {
                    return {
                        entity: entity
                    };
                }
            };

            // Open modal popup.
            var modalInstance = $modal.open(_entityDetailModalOptions);

            modalInstance.result.then(function (editedEntity) {
                // We selected ok...
                angular.extend(item, editedEntity);
            }, function () {
                // We cancelled the search...
                // Do nothing...
            });
        }

        function fetchEntities(page, pageSize, replaceRemoved, refresh) {
            if (refresh) {
                vm.entities = [];
            }

            entityDataSvc.getEntities(page, pageSize, vm.filter, vm.showInactive, replaceRemoved).then(function (data) {
                _currentPage = data.page;
                _pageSize = data.maxItems;
                _totalServerItems = data.inlineCount;

                updateEntities(data.results);
            }, function (error) {

            });
        }

        function getFields() {
            return ["id", "code", "name", "location", "description"];
        }

        function getSelectionKey() {
            return vm.selected ? "fc.CLEAR_SELECTION_TEXT" : "fc.SELECT_ALL_TEXT";
        }

        function getStatusToggleKey() {
            return vm.showInactive ? 'fc.HIDE_INACTIVE_TEXT' : 'fc.SHOW_INACTIVE_TEXT';
        }

        function hasNextPage() {
            var alreadyLoadedItems = ((_currentPage - 1) * _pageSize) + vm.entities.length;

            return alreadyLoadedItems < _totalServerItems;
        }

        function isFieldSelected(field) {
            return _.contains(vm.fields, field);
        }

        function load() {
            var subject = new Rx.Subject();
            subject.distinctUntilChanged().throttle(500).subscribe(function () {
                fetchEntities(_currentPage, _pageSize, null, true);
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
                fetchEntities(_currentPage, _pageSize, null, true);
            });
        }

        function loadNextPage() {
            fetchEntities(_currentPage + 1, _pageSize);
        }

        function newEntity() {
            vm.entity = {};
        }

        function refreshSelection() {
            // Use _.pluck style callback shorthand...
            var someSelected = _.any(vm.entities, "isSelected");

            // NOTE: lodash always returns true when all is an empty array. Bug or by design?
            var allSelected = someSelected && _.all(vm.entities, "isSelected");
            if (allSelected) {
                vm.selected = _selectionEnum.all;
            } else if (someSelected) {
                vm.selected = _selectionEnum.some;
            } else {
                vm.selected = _selectionEnum.none;
            }
        }

        function saveChanges() {
            // TODO: Enter save logic
            vm.isSaving = true;
            entityDataSvc.createEntity(vm.entity).then(function (data) {
                updateEntities(data);
                vm.entity = null;
                vm.isSaving = false;
            });
        }

        function selectAll() {
            if (!vm.selected || vm.selected === _selectionEnum.none) {
                _.forEach(vm.entities, function(entity) {
                    entity.isSelected = true;
                });
            } else {
                _.forEach(vm.entities, function(entity) {
                    entity.isSelected = false;
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

        function updateEntities(data, remove) {
            if (!_.isArray(vm.entities)) {
                vm.entities = [];
            }

            var index = -1;

            var updateSingle = function (item) {
                if (remove) {
                    index = vm.entities.indexOf(item);

                    if (index >= 0) {
                        vm.entities.splice(index, 1);
                    }
                } else {
                    vm.entities.push(item);
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

    entityDetail.$inject = ["$modalInstance", "entityDataSvc", "data"];

    function entityDetail($modalInstance, entityDataSvc, data) {
        var vm = this;

        vm.cancelChanges = cancelChanges;
        vm.entity = data.entity;
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
                    required: false
                },
                location: {
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
            // TODO: Enter save logic
            vm.isSaving = true;
            entityDataSvc.updateEntity(vm.entity.id, vm.entity).then(function (data) {
                $modalInstance.close(data);
                vm.entity = null;
                vm.isSaving = false;
            });
        }
    }
})();