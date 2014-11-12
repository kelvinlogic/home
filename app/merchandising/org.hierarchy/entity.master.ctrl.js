(function () {
    'use strict';

    angular
        .module('fc.merchandising')
        .controller('EntityMasterCtrl', entityMaster)
        .controller('EntityDetailCtrl', entityDetail);

    entityMaster.$inject = ['lodash', '$modal', '$scope', '$translate', 'DTOptionsBuilder'];

    /* @ngInject */
    function entityMaster(_, $modal, $scope, $translate, DTOptionsBuilder) {
        /* jshint validthis: true */
        var vm = this,
            _entityDetailModalOptions = null,
            _selectionEnum = {"none": 0, "some": 1, "all": 2 };

        vm.activate = activate;
        vm.cancelChanges = cancelChanges;
        vm.edit = edit;
        vm.getSelectionKey = getSelectionKey;
        vm.filters = {};
        vm.gridOptions = {};
        vm.newEntity = newEntity;
        vm.pageChanged = pageChanged;
        vm.pagination = {};
        vm.saveChanges = saveChanges;
        vm.selectAll = selectAll;
        vm.selected = null;
        vm.selectedAll = false;
        vm.selectedEntities = [];
        vm.selectedEntity = null;
        vm.entities = [];
        vm.entity = null;
        vm.titleKey = 'fc.merchandising.entity.MASTER_PAGE_TITLE';
        vm.toggleSelection = toggleSelection;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            // Set up grid.
            setupGrid();
            // Set up pagination.
            setupPagination();

            _entityDetailModalOptions = {
                templateUrl: "fc/editModalTpl",
                controller: "EntityDetailCtrl as vm"
            };

            // TODO: Load user data here.
            load();
        }

        function cancelChanges() {
            vm.entity = null;
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

            // Use extend to prevent reference copying.
            //vm.entity = angular.extend({}, vm.selectedEntity);
            //
            //// Clear table selection
            //delete vm.selectedEntity.isSelected;
            //vm.selectedEntities = [];
            //vm.selectedEntity = null;
        }

        function getSelectionKey() {
            return vm.selected ? "fc.CLEAR_SELECTION_TEXT" : "fc.SELECT_ALL_TEXT";
        }

        function load() {
            vm.entities = [
                {id: 1, code: "CLL", name: "Compulynx Limited"},
                {id: 2, code: "CLL", name: "Compulynx Limited"},
                {id: 3, code: "CLL", name: "Compulynx Limited"},
                {id: 4, code: "CLL", name: "Compulynx Limited"}
            ];

            $scope.$watchCollection(function () {
                return vm.filters;
            }, function (newCollection) {
                if (newCollection.all) {
                    // Search on all fields.
                }

                if (newCollection.id) {
                    // Search on id field.
                }

                if (newCollection.code) {
                    // Search on code field.
                }

                if (newCollection.name) {
                    // Search on name field.
                }

                if (newCollection.description) {
                    // Search on description field.
                }

                if (newCollection.location) {
                    // Search on email1 field.
                }
            });
        }

        function newEntity() {
            vm.entity = {};
        }

        function pageChanged() {
            // TODO: Enter page change logic.
            var currentPage = vm.pagination.page;
        }

        function refreshSelection(){
            var check = function (entity) {
                return entity.isSelected;
            };

            var allSelected = _.all(vm.entities, check);
            var someSelected = _.any(vm.entities, check);
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
            vm.entity = null;
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

        function setupGrid() {
            var sDom = "<'dt-toolbar'<'col-xs-12 col-sm-6'T><'col-sm-6 col-xs-6 hidden-xs'C>r>"+
                "t"+
                "<'dt-toolbar-footer'<'col-sm-12 col-xs-12'i>>";

            // ColVis specified in sDom as 'C'. Don't need withColVis option.
            vm.gridOptions = DTOptionsBuilder
                .newOptions()
                .withDOM(sDom)
                .withBootstrap()
                .withOption("paging", false)
                .withOption("autoWidth", true)
                .withOption('responsive', true);

            $translate([
                "fc.table.COL_VIS_TEXT",
                "fc.table.COPY_TOOL_TEXT",
                "fc.table.PRINT_TOOL_TEXT",
                "fc.table.SAVE_AS_TOOL_TEXT"
            ]).then(function (translations) {
                var colVisText = translations["fc.table.COL_VIS_TEXT"];
                vm.gridOptions.withColVisOption("buttonText", colVisText);

                var ttBtnCfg = [
                    {
                        "sExtends": "copy",
                        "sButtonText": translations["fc.table.COPY_TOOL_TEXT"]
                    },
                    {
                        "sExtends": "print",
                        "sButtonText": translations["fc.table.PRINT_TOOL_TEXT"]
                    },
                    {
                        "sExtends": "collection",
                        "sButtonText": translations["fc.table.SAVE_AS_TOOL_TEXT"],
                        "aButtons": [
                            "csv",
                            "xls",
                            "pdf"
                        ]
                    }
                ];

                vm.gridOptions.withTableToolsOption("sSwfPath", "theme/SmartAdmin/js/plugin/datatables/swf/copy_csv_xls_pdf.swf");
                vm.gridOptions.withTableToolsButtons(ttBtnCfg);
            });

            // TODO: Add external filtering and sorting.
        }

        function setupPagination() {
            vm.pagination.page = 1;
            vm.pagination.total = 100;
            vm.pagination.maxSize = 5;
        }

        function toggleSelection(item) {
            item.isSelected = !item.isSelected;

            refreshSelection();
        }
    }

    entityDetail.$inject = ["$modalInstance", "data"];

    function entityDetail($modalInstance, data) {
        var vm = this;

        vm.cancel = cancel;
        vm.canSaveChanges = canSaveChanges;
        vm.entity = data.entity;
        vm.ok = ok;
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
                },
                location: {
                    required: true
                },
                name: {
                    required: true
                }
            };
        }

        function cancel() {
            $modalInstance.dismiss();
        }

        function canSaveChanges() {
            return vm.mapping && vm.mapping.supplier && vm.mapping.product && vm.mapping.supplierCode;
        }

        function ok() {
            $modalInstance.close(vm.mapping);
        }
    }
})();