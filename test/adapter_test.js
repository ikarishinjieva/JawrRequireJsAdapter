module( "jawr_requirejs_adapter", {
    setup: function() {
        var scope = {
            test_result : [],
            raw_require : function (files, fn) {
                if (files[0] == 'jawr/jawr_loader.js') {
                    window.JAWR = {};
                    window.JAWR.loader = {};
                    window.JAWR.loader.jsbundles = [
                        {
                            name : 'a.js',
                            prefix : '111'
                        },
                        {
                            name : 'b.js',
                            prefix : '222',
                            itemPathList : ['/js/bb.js']
                        }
                    ]
                } else {
                    scope.test_result = scope.test_result.concat(files);
                }
                fn.apply(scope);
            }
        };
        this.scope = scope;
    },

    teardown: function() {
        window.test_result = undefined;
    }
});
test("require js orphan file in dev should success", function () {
    register_jawr_requirejs_adapter(this.scope, 'webroot', 'jawr', function() {
        return true;
    });
    this.scope.require(['a.js'], function() {});
    equal('webroot/jawr/a.js?r=111', this.scope.test_result[0]);
});

test("require js bundle file in dev should success", function() {
    register_jawr_requirejs_adapter(this.scope, 'webroot', 'jawr', function() {
        return true;
    });
    this.scope.require(['b.js'], function() {});
    equal('webroot/js/bb.js?r=222', this.scope.test_result[0]);
});

test("require js orphan file in prod should success", function() {
    register_jawr_requirejs_adapter(this.scope, 'webroot', 'jawr', function() {
        return false;
    });
    this.scope.require(['a.js'], function() {});
    equal('webroot/jawr/111/a.js', this.scope.test_result[0]);
});

test("require js bundle file in prod should success", function() {
    register_jawr_requirejs_adapter(this.scope, 'webroot', 'jawr', function() {
        return false;
    });
    this.scope.require(['b.js'], function() {});
    equal('webroot/jawr/222/b.js', this.scope.test_result[0]);
});