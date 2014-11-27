(function () {
    'use strict';

    angular
        .module('fc.merchandising')
        .controller('InstructionMasterCtrl', instructionMaster)
        .controller('InstructionDetailCtrl', instructionDetail);

    instructionMaster.$inject = ['lodash', "rx", '$modal', '$scope', '$stateParams', '$translate', 'instructionDataSvc', 'throttleValue'];
    /* @ngInject */
    function instructionMaster(_, Rx, $modal, $scope, $stateParams, $translate, instructionDataSvc, throttleValue) {
        /* jshint valid this: true */
        var vm = this,
            _instructionDetailModalOptions = null,
            _selectionEnum = {"none": 0, "some": 1, "all": 2},
            _currentPage = null,
            _pageSize = null,
            _totalServerItems = null,
            _instructionId = null;

        vm.activate = activate;
        vm.activateInstructions = activateInstructions;
        vm.cancelChanges = cancelChanges;
        vm.createInstruction = createInstruction;
        vm.edit = edit;
        vm.getFields = getFields;
        vm.getSelectionKey = getSelectionKey;

        vm.newInstruction = newInstruction;
        vm.saveChanges = saveChanges;
        vm.fetchInstructions  = fetchInstructions ;

        vm.filter = null;
        vm.searchFilter = searchFilter;
        vm.fields = [];
        vm.getStatusToggleKey = getStatusToggleKey;
        vm.hasNextPage = hasNextPage;
        vm.isBranch = isBranch;
        vm.isEntity = isEntity;
        vm.isFieldSelected = isFieldSelected;
        vm.loadNextPage = loadNextPage;
        vm.deactivateInstructions = deactivateInstructions;

        vm.selectAll = selectAll;
        vm.selected = null;
        vm.showInactive = false;
        vm.instructions = [];
        vm.instruction = null;
        vm.title = null;
        vm.titleKey = 'fc.merchandising.instruction.MASTER_PAGE_TITLE';
        vm.toggleFilterField = toggleFilterField;
        vm.toggleSelection = toggleSelection;
        vm.validationData = null;

        activate();

        /*
         *   functions to perform crud functionality
         */
        function searchFilter(){
            var filter = vm.filter,
                fields = vm.fields;

            if(filter != null){
                var search = {
                    search:filter,
                    searchFields: fields
                };

                instructionDataSvc.searchFilter(search).then(function (data) {
                    updateInstructions(data);
                });
            }
        }

        function activate() {
            _instructionDetailModalOptions = {
                templateUrl: "fc/editModalTpl",
                controller: "InstructionDetailCtrl as vm"
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

        function activateInstructions(instruction) {
            // NOTE:...................................................
            // If we passed a instruction, assume the activation of the single said instruction.
            // else, assume the activation of all selected instructions.

            changeActivation(instruction, true);
        }

        function cancelChanges() {
            vm.instruction = null;
        }

        function newInstruction() {
            vm.instruction = {};
        }

        function changeActivation(instruction, newStatus) {
            // We need a status specified.
            if (newStatus !== true && newStatus !== false) {
                return;
            }

            var toTranslate = [
                "fc.merchandising.instruction.MASTER_PAGE_TITLE",
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
                var pageTitle = translations["fc.merchandising.instruction.MASTER_PAGE_TITLE"],
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

                var selectedInstructions = [],
                    actionPast = newStatus ? restoreActionPast : deleteActionPast,
                    actionPresent = newStatus ? restoreActionPresent : deleteActionPresent;

                if (!instruction) {
                    selectedInstructions = _.filter(vm.instructions, function (ent) {
                        // Deselect items that won't be changed.
                        if (ent.active === newStatus) {
                            ent.isSelected = false;
                        }

                        return ent.isSelected;
                    });

                    // Can't change the state.
                    if (selectedInstructions.length < 1) {
                        refreshSelection();
                        return;
                    }

                    refreshSelection();
                }

                var performChange = function (instruction) {
                    // If we get an instruction, change it else change all selected instructions.
                    var toChange = null;

                    if (instruction) {
                        toChange = instruction.id;
                    } else {
                        // Do nothing if there was no selection.
                        if (vm.selected === _selectionEnum.none) {
                            return;
                        }

                        // Fetch the selected instructions.
                        toChange = _.map(selectedInstructions, function (instruction) {
                            return instruction.id;
                        });
                    }

                    if (newStatus === true) {
                        instructionDataSvc.activateInstructions(toChange).then(afterChangeCb);
                    } else {
                        instructionDataSvc.deactivateInstructions(toChange).then(afterChangeCb);
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
                        if (changedCount === 1 && instruction) {
                            msgData.data = instruction.code + " " + instruction.status;
                        } else {
                            msgData.data = changedCount + " " + pageTitle.toLowerCase();
                        }

                        message = _.string.sprintf(successTemplate, msgData);

                        var updateItem = function (ent) {
                            // If we are not showing inactive items, add the newly activated item.
                            if (!vm.showInactive) {
                                updateInstructions(ent, !newStatus);
                            } else {
                                var idx = vm.instructions.indexOf(ent);

                                // Replace with new from data store.
                                if (idx >= 0) {
                                    var match = _(response).filter(function (resp) {
                                        return resp.id === ent.id;
                                    }).first();

                                    // Damn...we can't use splice here...
                                    angular.extend(vm.instructions[idx], match);
                                }
                            }
                        };

                        if (changedCount === 1 && instruction) {
                            updateItem(instruction);
                        } else {
                            _(selectedInstructions).filter(function (instruction) {
                                return _.any(response, {id: instruction.id});
                            }).forEach(function (instruction) {
                                updateItem(instruction);
                            });
                        }

                        if (!vm.showInactive) {
                            if (newStatus) {
                                // If we are not showing inactive, remove extra items.
                                var startIndex = vm.instructions.length - (1 + changedCount);
                                vm.instructions.splice(startIndex, changedCount);
                            } else {
                                // If we are not showing inactive, load extra items to fill up the remaining slots.
                                fetchInstructions(_currentPage, _pageSize, changedCount);
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

                    // Set the messages depending on whether we're restoring a single instruction or a selection.
                    if (instruction) {
                        title += " <span class='" + textColor + "'><strong>" + instruction.code;
                        title += "</strong> <span>"+ instruction.status +"</span></span>?";

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            data: pageTitle.toLowerCase()
                        });
                    } else {
                        title += " <span class='" + textColor + "'><strong>";
                        title += selectedInstructions.length;
                        title += "</strong> <span>"+ pageTitle.toLowerCase() +"</span></span>?";

                        content = _.string.sprintf(warningTemplate, {
                            action: actionPresent,
                            data: selectedInstructions.length + " " + pageTitle.toLowerCase()
                        });
                    }

                    $.SmartMessageBox({
                        title : title,
                        content : content,
                        buttons : '[' + noText + '][' + yesText + ']'
                    }, function(button) {
                        if (button === yesText) {
                            performChange(instruction);
                        }
                    });
                } else {
                    content = _.string.sprintf(warningTemplate, {action: actionPresent});
                    if (confirm(content)) {
                        performChange(instruction);
                    }
                }
            });
        }

        function createInstruction() {
            vm.instruction = {};
        }

        function deactivateInstructions(instruction) {
            // NOTE:...................................................
            // If we passed an instruction, assume the deactivation of the single said instruction.
            // else, assume the deactivation of all selected instructions.

            changeActivation(instruction, false);
        }

        function edit(item) {
            if (!item) {
                return;
            }

            // Use extend to prevent reference copying so we can edit the item in isolation.
            var instruction = angular.extend({}, item);

            // Setup modal options.
            _instructionDetailModalOptions.resolve = {
                data: function () {
                    return {
                        instruction: instruction,
                        instructionId: _instructionId,
                        isBranch: isBranch,
                        isEntity: isEntity
                    };
                }
            };

            // Open modal popup.
            var modalInstance = $modal.open(_instructionDetailModalOptions);

            modalInstance.result.then(function (editedEntity) {
                // We selected ok...
                angular.extend(item, editedEntity);
            }, function () {
                // We cancelled the search...
                // Do nothing...
            });
        }

        function fetchInstructions(page, pageSize, replaceRemoved, refresh) {
            instructionDataSvc.getInstructions(page, pageSize, vm.filter, vm.showInactive, replaceRemoved).then(function (data) {
                _currentPage = data.page;
                _pageSize = data.maxItems;
                _totalServerItems = data.inlineCount;

                if (refresh) {
                    vm.instructions = [];
                }
                updateInstructions(data.results);
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
            var alreadyLoadedItems = ((_currentPage - 1) * _pageSize) + vm.instructions.length;

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
                fetchInstructions(_currentPage, _pageSize, null, true);
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
                fetchInstructions(_currentPage, _pageSize, null, true);
            });
        }

        function loadNextPage() {
            fetchInstructions(_currentPage + 1, _pageSize);
        }

        function refreshSelection() {
            // Use _.pluck style callback shorthand...
            var someSelected = _.any(vm.instructions, "isSelected");

            // NOTE: lodash always returns true when all is an empty array. Bug or by design?
            var allSelected = someSelected && _.all(vm.instructions, "isSelected");
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
            instructionDataSvc.createInstruction(vm.instruction).then(function (data) {
                updateInstructions(data);
                vm.instruction = null;
                vm.isSaving = false;

            });

        }

        function selectAll() {
            if (!vm.selected || vm.selected === _selectionEnum.none) {
                _.forEach(vm.instructions, function(instruction) {
                    instruction.isSelected = true;
                });
            } else {
                _.forEach(vm.instructions, function(instruction) {
                    instruction.isSelected = false;
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

        function updateInstructions(data, remove) {
            if (!_.isArray(vm.instructions)) {
                vm.instructions = [];
            }

            var index = -1;

            var updateSingle = function (item) {
                if (remove) {
                    index = vm.instructions.indexOf(item);

                    if (index >= 0) {
                        vm.instructions.splice(index, 1);
                    }
                } else {
                    vm.instructions.push(item);
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

    instructionDetail.$inject = ["$modalInstance", "instructionDataSvc", "data"];

    function instructionDetail($modalInstance, instructionDataSvc, data) {
        var vm = this;

        vm.cancelChanges = cancelChanges;
        vm.instruction = data.instruction;
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
            vm.isSaving = true;
            instructionDataSvc.updateInstruction(vm.instruction.id, vm.instruction).then(function (data) {
                $modalInstance.close(data);
                vm.instruction = null;
                vm.isSaving = false;
            });
        }
    }
})();