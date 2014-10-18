module.exports = function (config) {
    config.set({

        basePath: './app',

        files: [
            'bower_components/lodash/dist/lodash.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/angular-ui-router/release/angular-ui-router.js',
            'bower_components/angular-translate/angular-translate.js',
            'bower_components/angular-translate-loader-partial/angular-translate-loader-partial.js',
            'fc.module.js',
            'app.js',
            'common/fc.common.module.js',
            'common/*.js',
            'login/fc.login.module.js',
            'login/*.js',
            'configuration/fc.startup.module.js',
            'configuration/*.js'
        ],

        exclude: [
            'common/bootstrap.js',
            'fc.lang.config.js',
            'common/fc.common.lang.config.js',
            'login/fc.login.lang.config.js',
            'startup/fc.startup.lang.config.js'
        ],

        autoWatch: true,

        frameworks: ['jasmine'],

        browsers: ['Chrome'],

        plugins: [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-junit-reporter'
        ],

        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    });
};
