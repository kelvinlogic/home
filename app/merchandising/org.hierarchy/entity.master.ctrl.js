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
            // Set up grid.
            //setupGrid();
            // Set up pagination.
            //setupPagination();

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

        function activateEntities() {
            // TODO: Enter activation logic.
        }

        function cancelChanges() {
            vm.entity = null;
        }

        function deactivate(entity) {
            // NOTE:...................................................
            // If we passed an entity, assume the deactivation of the single said entity.
            // else, assume the deactivation of all selected entities.

            var toTranslate = [
                "fc.merchandising.entity.MASTER_PAGE_TITLE",
                "fc.DELETE_WARNING_TITLE",
                "fc.DELETE_WARNING_MESSAGE",
                "fc.DELETE_SELECTION_WARNING_MESSAGE",
                "fc.SUCCESS_ALERT_TITLE",
                "fc.DELETED_PREFIX",
                "fc.NO_TEXT",
                "fc.YES_TEXT"
            ];

            $translate(toTranslate).then(function (translations) {
                var pageTitle = translations["fc.merchandising.entity.MASTER_PAGE_TITLE"],
                    deleteTitle = translations["fc.DELETE_WARNING_TITLE"],
                    deleteWarning = translations["fc.DELETE_WARNING_MESSAGE"],
                    deleteSelectionWarning = translations["fc.DELETE_SELECTION_WARNING_MESSAGE"],
                    successTitle = translations["fc.SUCCESS_ALERT_TITLE"],
                    deletedPrefix = translations["fc.DELETED_PREFIX"],
                    noText = translations["fc.NO_TEXT"],
                    yesText = translations["fc.YES_TEXT"];

                var selectedEntities = [];

                if (!entity) {
                    selectedEntities = _.filter(vm.entities, "isSelected");
                }

                var performRemove = function (entity) {
                    // If we get an entity, deactivate it else deactivate all selected entities.
                    var toRemove = null;

                    if (entity) {
                        toRemove = entity.id;
                    } else {
                        // Do nothing if there was no selection.
                        if (vm.selected === _selectionEnum.none) {
                            return;
                        }

                        // Fetch the selected entities.
                        toRemove = _.map(selectedEntities, function (entity) {
                            return entity.id;
                        });
                    }

                    entityDataSvc.deactivateEntities(toRemove).then(afterRemoveCb);
                };

                var afterRemoveCb = function(response) {
                    var deactivatedCount = response.length;
                    if (deactivatedCount) {
                        var message = deletedPrefix;

                        if (deactivatedCount > 1) {
                            message += " " + deactivatedCount + " "+ pageTitle.toLowerCase() + ".";
                        } else {
                            message += " " + entity.name + " "+ entity.location + ".";
                        }
                        if ($.smallBox) {
                            $.smallBox({
                                title : successTitle,
                                content : "<i>" + message + "</i>",
                                color : "#659265",
                                iconSmall : "fa fa-check fa-2x fadeInRight animated",
                                timeout : 4000
                            });
                        } else {
                            alert(message);
                        }

                        var updateItem = function (ent) {
                            // If we are not showing inactive items, remove the item.
                            if (!vm.showInactive) {
                                updateEntities(ent, true);
                            } else {
                                var idx = vm.entities.indexOf(ent);

                                // Replace with new from data store.
                                if (idx >= 0) {
                                    vm.entities.splice(idx, 1, _.first(response, {id: ent.id}));
                                }
                            }
                        };

                        if (deactivatedCount && deactivatedCount <= 1) {
                            updateItem(entity);
                        } else {
                            _(selectedEntities).filter(function (entity) {
                                return _.any(response, {id: entity.id});
                            }).forEach(function (entity) {
                                updateItem(entity);
                            });
                        }

                        // If we are not showing inactive, load extra items to fill up the remaining slots.
                        if (!vm.showInactive) {
                            fetchEntities(_currentPage, _pageSize, deactivatedCount);
                        }
                    }
                };

                // Show message box.
                if ($.SmartMessageBox) {
                    var title = "<i class='fa fa-trash-o txt-color-red'></i> ";
                    title += deleteTitle;

                    var content = null;

                    // Set the messages depending on whether we're deleting a single entity or a selection.
                    if (entity) {
                        title += " <span class='txt-color-red'><strong>" + entity.name;
                        title += "</strong> <span>"+ entity.location +"</span></span>?";

                        content = deleteWarning;
                    } else {
                        title += " <span class='txt-color-red'><strong>";
                        title += selectedEntities.length;
                        title += "</strong> <span>"+ pageTitle.toLowerCase() +"</span></span>?";

                        content = _.string.sprintf(deleteSelectionWarning, selectedEntities.length);
                    }

                    $.SmartMessageBox({
                        title : title,
                        content : content,
                        buttons : '[' + noText + '][' + yesText + ']'
                    }, function(button) {
                        if (button === yesText) {
                            performRemove(entity);
                        }
                    });
                } else {
                    var dynamicTxt = entity ? entity.name + " " + entity.location : selectedEntities.length + " " + pageTitle.toLowerCase();
                    var msg = deleteTitle + " " + dynamicTxt + ".";
                    if (confirm(msg)) {
                        performRemove(entity);
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

        function fetchEntities(page, pageSize, replaceRemoved) {
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
                fetchEntities(_currentPage, _pageSize);
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
            }, function (newValue) {
                vm.entities = [];
                fetchEntities(_currentPage, _pageSize);
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

        //function removeSelection() {
        //    $translate(toTranslate).then(function (translations) {
        //
        //        var afterCompleteCb = function (count) {
        //            var message = deletedPrefix + " " + count + " "+ pageTitle.toLowerCase() + ".";
        //            if ($.smallBox) {
        //                $.smallBox({
        //                    title : successTitle,
        //                    content : "<i>" + message + "</i>",
        //                    color : "#659265",
        //                    iconSmall : "fa fa-check fa-2x fadeInRight animated",
        //                    timeout : 4000
        //                });
        //            } else {
        //                alert(message);
        //            }
        //
        //            entityDataSvc.getEntities(_currentPage, count, vm.filter).then(function (data) {
        //                _currentPage = data.page;
        //                _totalServerItems = data.inlineCount;
        //                updateEntities(data.results);
        //            }, function (error) {
        //
        //            });
        //        };
        //
        //        var performRemove = function (entities) {
        //            var combinedStream = null;
        //            var deleted = 0;
        //            _.forEach(entities, function (entity) {
        //                var stream = Rx.Observable.fromPromise(entityDataSvc.deactivateEntities(entity.id));
        //
        //                if (combinedStream) {
        //                    combinedStream.concat(stream);
        //                } else {
        //                    combinedStream = stream;
        //                    combinedStream.subscribe(function(response) {
        //                        if (response) {
        //                            deleted++;
        //                            updateEntities(entity, true);
        //                        }
        //                    }, function () {}, afterCompleteCb(deleted));
        //                }
        //            });
        //        };
        //
        //        if ($.SmartMessageBox) {
        //            var title = "<i class='fa fa-trash-o txt-color-orangeDark'></i> ";
        //            title += deleteTitle;
        //            $.SmartMessageBox({
        //                title : title,
        //                content : _.string.sprintf(deleteWarning, selectedEntities.length),
        //                buttons : '[' + noText + '][' + yesText + ']'
        //            }, function(button) {
        //                if (button === yesText) {
        //                    performRemove(selectedEntities);
        //                }
        //            });
        //        } else {
        //            if (confirm(deleteTitle + " " + selectedEntities.length + " " + pageTitle.toLowerCase())) {
        //                performRemove(selectedEntities);
        //            }
        //        }
        //    });
        //}

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