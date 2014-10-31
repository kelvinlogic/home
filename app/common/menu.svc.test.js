/**
 * Created by Caleb on 9/18/2014.
 */
"use strict";

describe('fc.common module', function () {
    var _, httpBackend, menuSvc, menuData, menuUrlPrefix, menuUrlSuffix;

    beforeEach(function () {
        menuUrlPrefix = 'data';
        menuUrlSuffix = '.menu.json';

        angular.module('fc.common').config(['menuSvcProvider', function (menuSvcProvider) {
            menuSvcProvider.menuUrlPrefix = menuUrlPrefix;
            menuSvcProvider.menuUrlSuffix = menuUrlSuffix;
        }]);

        module('fc.common');
    });

    describe('menu service', function () {
        beforeEach(inject(function (lodash, $httpBackend, _menuSvc_) {
            _ = lodash;
            httpBackend = $httpBackend;
            menuSvc = _menuSvc_;
            menuData = [
                {name: 'Unprotected'},
                {name: 'Admin DashBoard', role: 'Admin'},
                {name: 'User Profile', role: 'User'}
            ];

            var menuUrl = menuUrlPrefix + '/test' + menuUrlSuffix;
            httpBackend.whenGET(menuUrl).respond(menuData);
        }));

        afterEach(function () {
            httpBackend.flush();
        });

        describe('the getMenuData method', function () {
            it('should return all items for user in all roles', function () {
                menuSvc.getMenuData('test').then(function (data) {
                    expect(data.length).toEqual(3);
                    expect(_.sortBy(data, 'name')).toEqual(_.sortBy(menuData, 'name'));
                });
            });
        });
    });
});