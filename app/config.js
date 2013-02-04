requirejs.config({
    baseUrl: '../lib',
    paths: {
        app: './'
    },
    shim: {
        backbone: {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        },
        underscore: {
            exports: '_'
        }
    }
});