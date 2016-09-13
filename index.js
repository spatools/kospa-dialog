(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "knockout", "@kospa/base/activator", "@kospa/base/composer", "@kospa/base/system"], factory);
    }
})(function (require, exports) {
    "use strict";
    var ko = require("knockout");
    var activator = require("@kospa/base/activator");
    var composer = require("@kospa/base/composer");
    var system_1 = require("@kospa/base/system");
    var doc = document, opened = {};
    exports.defaults = {
        container: defaultContainer(),
        activate: true,
        create: defaultCreate,
        close: defaultClose
    };
    function open(options) {
        var opts = system_1.extend({}, exports.defaults, options);
        return Promise.resolve(opts.create(opts))
            .then(function (container) { return compose(container, opts); })
            .then(function (node) { return opts.after && opts.after(node, opts); })
            .then(function () {
            opts.__dfd = system_1.deferred();
            opened[opts.id] = opts;
            opts.viewmodel.dialogId = opts.id;
            return opts.__dfd.promise;
        });
    }
    exports.open = open;
    function close(id, result) {
        var opts = opened[id];
        if (!opts) {
            return Promise.resolve();
        }
        return activator.deactivate(opts.viewmodel)
            .then(function () { return opts.close(opts); })
            .then(function () {
            opts.__dfd.resolve(result);
            delete opts.viewmodel.dialogId;
            delete opened[opts.id];
        });
    }
    exports.close = close;
    function compose(container, options) {
        if (options.template) {
            return composer.compose(container, {
                viewmodel: TemplateViewModel,
                view: options.template,
                activate: options.activate,
                args: [options]
            });
        }
        return composer.compose(container, options);
    }
    var zIndex = 10000;
    function defaultCreate(options) {
        var dialog = doc.createElement("div"), global = ensureGlobalContainer(options.container);
        if (!options.id) {
            options.id = generateId();
        }
        dialog.id = options.id;
        dialog.classList.add("kospa-dialog");
        dialog.style.zIndex = String(zIndex++);
        global.appendChild(dialog);
        return dialog;
    }
    function defaultClose(options) {
        var container = options.container, dialog = doc.getElementById(options.id);
        container.removeChild(dialog);
        zIndex--;
    }
    function defaultContainer() {
        var div = doc.createElement("div");
        div.id = "kospa-dialogs-container";
        return div;
    }
    function ensureGlobalContainer(container) {
        var globalContainer = typeof container === "string" ?
            doc.getElementById(container) :
            container;
        if (globalContainer.parentElement === null) {
            doc.body.appendChild(globalContainer);
        }
        return globalContainer;
    }
    function generateId() {
        return Math.round(Math.random() * 100000000).toString(36);
    }
    var TemplateViewModel = (function () {
        function TemplateViewModel() {
            var _this = this;
            this.viewmodel = ko.observable();
            this.title = ko.pureComputed(function () {
                var vm = _this.viewmodel();
                return vm && ko.unwrap(vm.title) || _this._title;
            }, this);
        }
        TemplateViewModel.prototype.close = function () {
            close(this.id);
        };
        TemplateViewModel.prototype.activate = function (options) {
            this.id = options.id;
            this._title = options.title;
        };
        TemplateViewModel.prototype.bindingComplete = function (container, options) {
            var _this = this;
            var node = container.getElementsByTagName("dialog-content")[0];
            if (node) {
                return composer.compose(node, options)
                    .then(function () { return _this.viewmodel(options.viewmodel); });
            }
        };
        return TemplateViewModel;
    }());
});
