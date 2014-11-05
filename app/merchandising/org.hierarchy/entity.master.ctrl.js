(function () {
    'use strict';

    angular
        .module('fc.merchandising')
        .controller('EntityMasterCtrl', entityMaster);

    entityMaster.$inject = ['lodash', '$scope', '$translate', 'DTOptionsBuilder'];

    /* @ngInject */
    function entityMaster(_, $scope, $translate, DTOptionsBuilder) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.entities = [];
        vm.cancelChanges = cancelChanges;
        vm.edit = edit;
        vm.filters = {};
        vm.gridOptions = {};
        vm.pageChanged = pageChanged;
        vm.pagination = {};
        vm.saveChanges = saveChanges;
        vm.selectedAll = false;
        vm.selectedEntities = [];
        vm.selectedEntity = null;
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

            // TODO: Load user data here.
            load();
        }

        function cancelChanges() {
            vm.entity = null;
        }

        function edit() {
            // Use extend to prevent reference copying.
            vm.entity = angular.extend({}, vm.selectedEntity);

            // Clear table selection
            delete vm.selectedEntity.isSelected;
            vm.selectedEntities = [];
            vm.selectedEntity = null;
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

        function pageChanged() {
            // TODO: Enter page change logic.
            var currentPage = vm.pagination.page;
        }

        function saveChanges() {
            // TODO: Enter save logic
            vm.entity = null;
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
            var index = vm.selectedEntities.indexOf(item);
            item.isSelected = !item.isSelected;

            if (item.isSelected) {
                vm.selectedEntity = item;

                // If item isn't in the selected items array...
                if (index < 0) {
                    // add it.
                    vm.selectedEntities.push(item);
                }
            } else {
                // If item isn't in the selected items array...
                if (index > -1) {
                    // remove it.
                    vm.selectedEntities.splice(index, 1);
                }

                vm.selectedEntity = _.last(vm.selectedEntities);
            }
        }
    }
})();