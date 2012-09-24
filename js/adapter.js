var register_jawr_requirejs_adapter = function(scope, urlRoot, jawr_mapping_dir, is_env_local) {
    if (urlRoot[urlRoot.length - 1] != '/') {
        urlRoot = urlRoot + '/';
    }

    if (null == scope.raw_require) {
        scope.raw_require = scope.require;
    }

    if (null == scope.raw_define) {
        scope.raw_define = scope.define;
    }

    /**
     * @author HUANGTA
     * Overwrite requireJs for purposes :
     *  1. make js loading sync, instead of async, to support current js module
     *  2. make js load from jawr folder, so it can be minimized and zipped
     *  3. add a random factor so it could be updated then.
     */
    scope.raw_require([jawr_mapping_dir + '/jawr_loader.js'], function () {
        var find_bundle = function (file) {
            for (var i = 0; i < JAWR.loader.jsbundles.length; i++) {
                var bundle = JAWR.loader.jsbundles[i];
                if (bundle.name.indexOf(file) != -1) {
                    return bundle;
                }
            }
        }

        var fix_url = function(url) {
            while (url != url.replace('//','/')) {
                url = url.replace('//','/');
            }
            return url;
        };

        var build_jawr_file_path = function (path, prefix) {
            return fix_url(urlRoot  + '/' + jawr_mapping_dir + '/' + path + '?r=' + prefix.replace('/', ''));
        };

        var build_bundle_path = function (path, prefix) {
            return fix_url(urlRoot + path + '?r=' + prefix.replace('/', ''));
        };

        var build_prod_file_path = function (path, prefix) {
            return fix_url(urlRoot + '/' + jawr_mapping_dir + '/' + prefix + '/' + path);
        };

        var find_raw_files = function (url) {
            var bundle = find_bundle(url);
            if (!bundle) {
                throw "url required is not in JAWR scope";
            }
            var ret = []
            if (!is_env_local()) {
                /**
                 * @author HUANGTA
                 * PROD
                 */
                ret = [build_prod_file_path(bundle.name, bundle.prefix)]
            } else if (!bundle.itemPathList) {
                /**
                 * @author HUANGTA
                 * Local
                 * JAWR Orphan bundle
                 */
                var path = build_jawr_file_path(bundle.name, bundle.prefix);
                ret = ret.concat(path)
            } else {
                /**
                 * @author HUANGTA
                 * Local
                 * Non-Orphan bundle
                 */
                for (var i = 0; i < bundle.itemPathList.length; i++) {
                    var path = build_bundle_path(bundle.itemPathList[i], bundle.prefix);
                    ret = ret.concat(path);
                }
            }
            return ret;
        }

        var get_require_files = function(files) {
            if (!(files instanceof Array)) {
                files = [files]
            }
            require_files = [];
            for (var i = 0; i < files.length; i++) {
                var url = find_raw_files(files[i]);
                require_files = require_files.concat(url);
            }
            return require_files;
        }

        scope.require = function (files, func) {
            require_files = get_require_files(files);

            var inner = function (files) {
                if (files.length > 1) {
                    scope.raw_require([files[0]], function () {
                        inner(files.slice(1));
                    })
                } else {
                    scope.raw_require([files[0]], func);
                }
            }
            inner(require_files);
        }

        scope.define = function(files, func) {
            if (arguments.length == 2) {
                require_files = get_require_files(files);
                scope.raw_define(require_files, func);
            } else {
                scope.raw_define.apply(this, arguments)
            }
        }
    });
}
