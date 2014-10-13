/**
 * Created by Caleb on 9/20/2014.
 */
"use strict";

(function () {
    angular.module("fc.common").service("appConfig", config);

    function config(){
        var conf = {};

        conf.loginPage = "login.html";
        conf.defaultPage = "startup.html";

        conf.keyboardToggledEvent = 'fc.keyboardToggled';
        conf.languageChanged = 'fc.languageChanged';

        return conf;
    }
})();