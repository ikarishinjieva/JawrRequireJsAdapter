# JawrRequireJsAdapter
## Background
We use Jawr before, and now we need requireJs. This adapter will make both Jawr and RequireJs work at the same time, so we can apply requireJs solution module by module.

## Feature
1. support old Jawr bundle
2. support RequireJs
3. support requireJs solution, while we use Jawr to zip and minimize js files

## How
1. RequireJS 2.0.6 and Jawr 3.3.3 are supported.
2. We assumed you already applied Jawr solution to your project
3. Modify your web.xml, add mapping in Jawr js servlet, like
    `<servlet>

        <servlet-name>JavascriptServlet</servlet-name>
        <servlet-class>net.jawr.web.servlet.JawrServlet</servlet-class>
        <init-param>
                <param-name>configLocation</param-name>
                <param-value>/jawr.properties</param-value>
        </init-param>
        <init-param>
            *<param-name>mapping</param-name>*
            *<param-value>/jawr/</param-value>*
        </init-param>
    </servlet>
    `

4. Modify your web.xml, change mapping of Jawr js servlet to the mapping folder, like
    `<servlet-mapping>

            <servlet-name>JavascriptServlet</servlet-name>
            *<url-pattern>/jawr/*</url-pattern>*
    </servlet-mapping>
    `
5. If you want to load non-bundle file (we call it orphan file), please make sure that your JAWR could support orphan file (please refer section "Orphan resources" in http://jawr.java.net/docs/custom_bundles.html) and the file is not in any JAWR bundle.
6. load adapter.js after require.js
7. call register_jawr_requirejs_adapter, the interface is
    `
    register_jawr_requirejs_adapter(window, 'http://<your_web_root>', '<your_jawr_servlet_mapping_folder>', <a_function_indicates_if_it_is_develop_mode_or_prod_mode>
    `
a example:
    `register_jawr_requirejs_adapter(window, 'http://huangta', 'jawr', function() {
            return true;
     });
     `
8. then you can use `require(['a.js',...], callback_fn)` or `define(['a.js',...], callback_fn)`, the 'a.js' could be JAWR bundle file name, or an orphan js file name.