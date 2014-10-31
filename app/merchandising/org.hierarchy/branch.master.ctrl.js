(function () {
    'use strict';

    angular
        .module('fc.merchandising')
        .controller('BranchMasterCtrl', branchMaster);

    branchMaster.$inject = ['lodash', '$scope'];

    /* @ngInject */
    function branchMaster(_, $scope) {
        /* jshint validthis: true */
        var vm = this,
            _gridApi = null;

        vm.activate = activate;
        vm.cancelChanges = cancelChanges;
        vm.edit = edit;
        vm.gridOptions = {};
        vm.pageChanged = pageChanged;
        vm.pagination = {};
        vm.saveChanges = saveChanges;
        vm.selectedAll = false;
        vm.selectedBranches = [];
        vm.selectedBranch = null;
        vm.branch = null;
        vm.titleKey = 'fc.merchandising.branch.MASTER_PAGE_TITLE';

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            // Set up grid.
            setupGrid();
            // Set up pagination.
            setupPagination();

            // TODO: Load user data here.
            vm.gridOptions.data = [
                {id: 1, code: "CLL", name: "Compulynx Limited", address1: "Address", phone1: "22222222", email1: "cl@mail.com", email2: "cl2@mail.com"},
                {id: 2, code: "CLL", name: "Compulynx Limited", address2: "Address 2", phone2: "33333333", fax1: "33333345"},
                {id: 3, code: "CLL", name: "Compulynx Limited"},
                {id: 4, code: "CLL", name: "Compulynx Limited"}
            ];
        }

        function cancelChanges() {
            vm.branch = null;
        }

        function edit() {
            // Use extend to prevent reference copying.
            vm.branch = angular.extend({}, vm.selectedBranch);
            vm.selectedBranches = [];
            vm.selectedBranch = null;
        }

        function pageChanged() {
            // TODO: Enter page change logic.
            var currentPage = vm.pagination.page;
        }

        function saveChanges() {
            // TODO: Enter save logic
            vm.branch = null;
        }

        function setupGrid() {
            vm.gridOptions.enableGridMenu = true;
//            vm.gridOptions.enableRowHeaderSelection = false;
//            vm.gridOptions.enableScrollbars = false;
            vm.gridOptions.enableSelectAll = true;
            vm.gridOptions.enableSelectionBatchEvent = false;
            vm.gridOptions.multiSelect = true;

            // Addresses: 4, Phones: 4, Faxes: 2, Emails: 2
            vm.gridOptions.columnDefs = [
                {name: "id", visible: false},
                {name: "code"},
                {name: "name"},
                {name: "email1", displayName: "Email"},
                {name: "email2", displayName: "Email 2", visible: false},
                {name: "phone1", displayName: "Phone"},
                {name: "phone2", displayName: "Phone 2", visible: false},
                {name: "phone3", displayName: "Phone 3", visible: false},
                {name: "phone4", displayName: "Phone 4", visible: false},
                {name: "address1", displayName: "Address"},
                {name: "address2", displayName: "Address 2", visible: false},
                {name: "address3", displayName: "Address 3", visible: false},
                {name: "address4", displayName: "Address 4", visible: false},
                {name: "fax1", displayName: "Fax", visible: false},
                {name: "fax2", displayName: "Fax 2", visible: false},
                {name: "pin", displayName: "PIN", visible: false},
                {name: "registration", displayName: "Registration", visible: false}
            ];

            vm.gridOptions.onRegisterApi = function (gridApi) {
                _gridApi = gridApi;
                
                // Listen for row selection changed.
                gridApi.selection.on.rowSelectionChanged($scope, function (gridRow) {
                    var index = vm.selectedBranches.indexOf(gridRow.entity);

                    if (gridRow.isSelected) {
                        vm.selectedBranch = gridRow.entity;

                        // If element isn't in the selected elements array...
                        if (index < 0) {
                            // add it.
                            vm.selectedBranches.push(gridRow.entity)
                        }
                    } else {
                        // If element isn't in the selected elements array...
                        if (index > -1) {
                            // remove it.
                            vm.selectedBranches.splice(index, 1);
                        }

                        vm.selectedBranch = _.last(vm.selectedBranches);
                    }
                });
            };

            // TODO: Add external filtering and sorting.
        }

        function setupPagination() {
            vm.pagination.page = 1;
            vm.pagination.total = 100;
            vm.pagination.maxSize = 5;
        }
    }
})();