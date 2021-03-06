(function () {
    'use strict';

    angular
        .module('fc.merchandising')
        .controller('SubBranchMasterCtrl', subBranchMaster);

    subBranchMaster.$inject = ['lodash', '$scope', '$translate', 'DTOptionsBuilder'];

    /* @ngInject */
    function subBranchMaster(_, $scope, $translate, DTOptionsBuilder) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.cancelChanges = cancelChanges;
        vm.edit = edit;
        vm.filters = {};
        vm.gridOptions = {};
        vm.pageChanged = pageChanged;
        vm.pagination = {};
        vm.saveChanges = saveChanges;
        vm.selectedAll = false;
        vm.selectedSubBranches = [];
        vm.selectedSubBranch = null;
        vm.subBranch = null;
        vm.subBranches = null;
        vm.titleKey = 'fc.merchandising.subBranch.MASTER_PAGE_TITLE';
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
            vm.subBranch = null;
        }

        function edit() {
            // Use extend to prevent reference copying.
            vm.subBranch = angular.extend({}, vm.selectedSubBranch);

            // Clear table selection
            delete vm.selectedSubBranch.isSelected;
            vm.selectedSubBranches = [];
            vm.selectedSubBranch = null;
        }

        function load() {
            vm.subBranches = [
                {id: 1, code: "CLL", name: "Compulynx Limited", address1: "Address",address2: "Address", phone1: "22222222",phone2: "22222222", email: "cl@mail.com", email1: "cl2@mail.com",fax1: "22222222",fax2: "22222222",pin: "22222222",registration: "22222222"},
                {id: 2, code: "CLL", name: "Compulynx Limited", address1: "Address",address2: "Address", phone1: "22222222",phone2: "22222222", email: "cl@mail.com", email1: "cl2@mail.com",fax1: "22222222",fax2: "22222222",pin: "22222222",registration: "22222222"},
                {id: 3, code: "CLL", name: "Compulynx Limited", address1: "Address",address2: "Address", phone1: "22222222",phone2: "22222222", email: "cl@mail.com", email1: "cl2@mail.com",fax1: "22222222",fax2: "22222222",pin: "22222222",registration: "22222222"},
                {id: 4, code: "CLL", name: "Compulynx Limited", address1: "Address",address2: "Address", phone1: "22222222",phone2: "22222222", email: "cl@mail.com", email1: "cl2@mail.com",fax1: "22222222",fax2: "22222222",pin: "22222222",registration: "22222222"}
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
            });
        }

        function pageChanged() {
            // TODO: Enter page change logic.
            var currentPage = vm.pagination.page;
        }

        function saveChanges() {
            // TODO: Enter save logic
            vm.subBranch = null;
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
            var index = vm.selectedSubBranches.indexOf(item);
            item.isSelected = !item.isSelected;

            if (item.isSelected) {
                vm.selectedSubBranch = item;

                // If item isn't in the selected items array...
                if (index < 0) {
                    // add it.
                    vm.selectedSubBranches.push(item);
                }
            } else {
                // If item isn't in the selected items array...
                if (index > -1) {
                    // remove it.
                    vm.selectedSubBranches.splice(index, 1);
                }

                vm.selectedSubBranch = _.last(vm.selectedSubBranches);
            }
        }
    }
})();