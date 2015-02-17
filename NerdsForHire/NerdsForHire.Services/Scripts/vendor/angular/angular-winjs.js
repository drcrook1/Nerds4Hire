/*!
* angular-winjs
*
* Copyright 2013 Josh Williams and other contributors
* Released under the MIT license
*/
(function (global) {
    "use strict";

    // setImmediate is not implemented in all browsers, if it doesn't exist instead use setTimeout(_, 0)
    //
    var setImmediate = window.setImmediate;
    if (!setImmediate) {
        setImmediate = function (f) {
            return setTimeout(f, 0);
        };
    }

    // Map is used in the list binding code, on browsers with Map support we simply use the built in
    // primitive, for list elements which are extensible we instead map from the list elements to their
    // current index (note that we must do the full mapping on every diff in order to ensure we don't
    // see stale indicies), and for non-extensible objects we fall back to using an array with O(N)
    // lookup behavior on get.
    //
    var Map = window.Map;
    if (!Map) {
        // A simple value -> integer map
        Map = function () {
            this._nonExtensibleBacking = [];
        };
        Map.key = "$$$$mapkey";
        Map.prototype.has = function (key) {
            if (Object.isExtensible(key)) {
                return Map.key in key;
            } else {
                return this._nonExtensibleBacking.indexOf(key) !== -1;
            }
        };
        Map.prototype.get = function (key) {
            if (Object.isExtensible(key)) {
                return key[Map.key];
            } else {
                return this._nonExtensibleBacking.indexOf(key);
            }
        };
        Map.prototype.set = function (key, value) {
            if (Object.isExtensible(key)) {
                key[Map.key] = value;
            } else {
                this._nonExtensibleBacking[value] = key;
            }
        };
    }

    // Pure utility
    //
    function objectMap(obj, mapping) {
        return Object.keys(obj).reduce(function (result, key) {
            var value = mapping(obj[key], key);
            if (value) {
                result[key] = value;
            }
            return result;
        }, {});
    }

    function root(element) {
        return element.parentNode ? root(element.parentNode) : element;
    }

    function select(selector, element) {
        return document.querySelector(selector) || root(element).querySelector(selector);
    }

    var WrapperList = WinJS.Class.derive(WinJS.Binding.List, function (array) {
        WinJS.Binding.List.call(this, array);
    });

    // Directive utilities
    //
    function addDestroyListener($scope, control, bindings, destroyed) {
        $scope.$on("$destroy", function () {
            (destroyed || angular.identity)();

            bindings.forEach(function (w) { w(); });

            if (control.dispose) {
                control.dispose();
            }
        });
    }

    function apply($scope, f) {
        switch ($scope.$root.$$phase) {
            case "$apply":
            case "$digest":
                f();
                break;
            default:
                $scope.$apply(function () {
                    f();
                });
                break;
        }
    }
    
    function applyShown(control, shown) {
		if(shown === true) {
			control.show();
		}
		else if (shown === false) {
			control.hide();
		}
	}

    function exists(control) {
        return !!Object.getOwnPropertyDescriptor(WinJS.UI, control);
    }

    function list($scope, key, getControl, getList, bindings) {
        var initialBindings = bindings.length;
        var value = $scope[key];
        if (value) {
            if (Array.isArray(value)) {
                value = new WrapperList(value);
                bindings.push($scope.$watchCollection(key, function (array) {
                    var list = getList();
                    if (!list) {
                        return;
                    }
                    if (!array) {
                        list.length = 0;
                        return;
                    }
                    var targetIndicies = new Map();
                    for (var i = 0, len = array.length; i < len; i++) {
                        targetIndicies.set(array[i], i);
                    }
                    var arrayIndex = 0, listIndex = 0;
                    while (arrayIndex < array.length) {
                        var arrayData = array[arrayIndex];
                        if (listIndex >= list.length) {
                            list.push(arrayData);
                        } else {
                            while (listIndex < list.length) {
                                var listData = list.getAt(listIndex);
                                if (listData === arrayData) {
                                    listIndex++;
                                    arrayIndex++;
                                    break;
                                } else {
                                    if (targetIndicies.has(listData)) {
                                        var targetIndex = targetIndicies.get(listData);
                                        if (targetIndex < arrayIndex) {
                                            // already in list, remove the duplicate
                                            list.splice(listIndex, 1);
                                        } else {
                                            list.splice(listIndex, 0, arrayData);
                                            arrayIndex++;
                                            listIndex++;
                                            break;
                                        }
                                    } else {
                                        // deleted, remove from list
                                        list.splice(listIndex, 1);
                                    }
                                }
                            }
                        }
                    }
                    // clip any items which are left over in the tail.
                    list.length = array.length;
                }));
            }
            if (value.dataSource) {
                value = value.dataSource;
            }
        }
        if (bindings.length === initialBindings) {
            bindings.push($scope.$watch(key, function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    getControl()[key] = list($scope, key, getControl, getList, bindings);
                }
            }));
        }
        return value;
    }

    function proxy($scope, controller, name) {
        Object.defineProperty(controller, name, {
            get: function () { return $scope[name]; },
            set: function (value) { $scope[name] = value; }
        });
    }

    function BINDING_anchor($scope, key, element, getControl, bindings) {
        bindings.push($scope.$watch(key, function (newValue, oldValue) {
            newValue = typeof newValue === "string" ? select(newValue, element) : newValue;
            oldValue = typeof oldValue === "string" ? select(oldValue, element) : oldValue;
            if (oldValue && oldValue._anchorClick) {
                oldValue.removeEventListener("click", oldValue._anchorClick);
                oldValue._anchorClick = null;
            }
            if (newValue && !newValue._anchorClick) {
                newValue._anchorClick = function () { getControl().show(); };
                newValue.addEventListener("click", newValue._anchorClick);
            }
            return newValue;
        }));
        var anchor = $scope[key];
        return typeof anchor === "string" ? select(anchor, element) : anchor;
    }
    BINDING_anchor.binding = "=?";

    function BINDING_dataSource($scope, key, element, getControl, bindings) {
        function getList() {
            var control = getControl();
            if (control) {
                var list = control[key];
                if (list) {
                    return list.list;
                }
            }
        }
        return list($scope, key, getControl, getList, bindings);
    }
    BINDING_dataSource.binding = "=?";

    function BINDING_event($scope, key, element, getControl, bindings) {
        bindings.push($scope.$watch(key, function (newValue, oldValue) {
            if (newValue !== oldValue) {
                getControl()[key] = newValue;
            }
        }));
        var value = $scope[key];
        return function (event) {
            apply($scope, function () { value({ $event: event }); });
        };
    }
    BINDING_event.binding = "&";

    function BINDING_property($scope, key, element, getControl, bindings) {
        bindings.push($scope.$watch(key, function (newValue, oldValue) {
            if (newValue !== oldValue) {
                (getControl() || {})[key] = newValue;
            }
        }));
        return $scope[key];
    }
    BINDING_property.binding = "=?";

    function BINDING_selection($scope, key, element, getControl, bindings) {
        bindings.push($scope.$watchCollection(key, function (selection) {
            var value = (getControl() || {})[key];
            if (value) {
                value.set(selection);
            }
        }));
        return $scope[key];
    }
    BINDING_selection.binding = "=?";

    function BINDING_list($scope, key, element, getControl, bindings) {
        function getList() {
            var control = getControl();
            if (control) {
                return control[key];
            }
        }
        return list($scope, key, getControl, getList, bindings);
    }
    BINDING_list.binding = "=?";

    // Shared compile/link functions
    //
    function compileTemplate(name) {
        return function (tElement, tAttrs, transclude) {
            var rootElement = document.createElement("div");
            Object.keys(tAttrs).forEach(function (key) {
                if (key[0] !== '$') {
                    rootElement.setAttribute(key, tAttrs[key]);
                }
            });
            var immediateToken;
            return function ($scope, elements, attrs, parents) {
                var parent = parents.reduce(function (found, item) { return found || item; });
                parent[name] = function (itemPromise) {
                    return WinJS.Promise.as(itemPromise).then(function (item) {
                        var itemScope = $scope.$new();
                        itemScope.item = item;
                        var result = rootElement.cloneNode(false);
                        transclude(itemScope, function (clonedElement) {
                            for (var i = 0, len = clonedElement.length; i < len; i++) {
                                result.appendChild(clonedElement[i]);
                            }
                        });
                        WinJS.Utilities.markDisposable(result, function () {
                            itemScope.$destroy();
                        });
                        immediateToken = immediateToken || setImmediate(function () {
                            immediateToken = null;
                            itemScope.$apply();
                        });
                        return result;
                    })
                };
            };
        };
    }

    // WinJS module definition
    //
    var module = angular.module("winjs", []);

    module.config(['$compileProvider', function ($compileProvider) {
        switch (document.location.protocol.toLowerCase()) {
            // http://msdn.microsoft.com/en-us/library/windows/apps/xaml/jj655406.aspx
            //
            case "ms-appx:":
            case "ms-appx-web:":
                // Whitelist the Windows Runtime URL schemes so Angular does not flag as 'unsafe'.
                //
                var whitelist = /^\s*(https|ms-appx|ms-appx-web|ms-appdata):/i;
                $compileProvider.imgSrcSanitizationWhitelist(whitelist);
                $compileProvider.aHrefSanitizationWhitelist(whitelist);
                break;
        }
    }]);

    module.run(['$rootScope', function ($rootScope) {
        var Scope = Object.getPrototypeOf($rootScope);
        var Scope$eval = Scope.$eval;
        Scope.$eval = function (expr, locals) {
            var that = this;
            if (window.MSApp) {
                return MSApp.execUnsafeLocalFunction(function () {
                    return Scope$eval.call(that, expr, locals);
                });
            } else {
                return Scope$eval.call(that, expr, locals);
            }
        };
    }]);

    // Directives
    //
    exists("AppBar") && module.directive("winAppBar", ['$parse', function ($parse) {
        var api = {
            closedDisplayMode: BINDING_property,
            commands: BINDING_property,
            disabled: BINDING_property,
            hidden: BINDING_property,
            layout: BINDING_property,
            placement: BINDING_property,
            sticky: BINDING_property,
            onafterhide: BINDING_event,
            onaftershow: BINDING_event,
            onbeforehide: BINDING_event,
            onbeforeshow: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: objectMap(api, function (value) { return value.binding; }),
            template: "<DIV ng-transclude='true'></DIV>",
            transclude: true,
            link: function ($scope, elements, attrs) {
                var element = elements[0];
                element.removeAttribute("disabled");
                var bindings = [];
                var appbar;
                var options = objectMap(api, function (value, key) { return value($scope, key, element, function () { return appbar; }, bindings); });
                appbar = new WinJS.UI.AppBar(element, options);
                if(attrs.shown) {
                	var shownProp = $parse(attrs.shown);
                	applyShown(appbar, shownProp($scope));
                	$scope.$watch(attrs.shown, function (newVal, oldVal, scope) {
                		applyShown(appbar, shownProp(scope));
                	});
                	appbar.addEventListener("beforehide", function () {
                		shownProp.assign($scope, false);
                	});
                	appbar.addEventListener("beforeshow", function () {
                		shownProp.assign($scope, true);
                	});
   	            }
                addDestroyListener($scope, appbar, bindings);
                return appbar;
            }
        };
    }]);

    exists("AppBar") && module.directive("winAppBarCommand", function () {
        var api = {
            disabled: BINDING_property,
            extraClass: BINDING_property,
            firstElementFocus: BINDING_property,
            flyout: BINDING_property,
            hidden: BINDING_property,
            icon: BINDING_property,
            id: BINDING_property,
            label: BINDING_property,
            lastElementFocus: BINDING_property,
            section: BINDING_property,
            selected: BINDING_property,
            tooltip: BINDING_property,
            type: BINDING_property,
            onclick: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: objectMap(api, function (value) { return value.binding; }),
            template: "<BUTTON ng-transclude='true'></BUTTON>",
            transclude: true,
            link: function ($scope, elements) {
                var element = elements[0];
                element.removeAttribute("disabled");
                element.removeAttribute("id");
                var bindings = [];
                var command;
                var options = objectMap(api, function (value, key) { return value($scope, key, element, function () { return command; }, bindings); });
                command = new WinJS.UI.AppBarCommand(element, options);
                addDestroyListener($scope, command, bindings);
                return command;
            }
        };
    });
	
	exists("AppBar") && module.directive("winAppBarSeparator", function () {
        var api = {
            disabled: BINDING_property,
            extraClass: BINDING_property,
            firstElementFocus: BINDING_property,
            flyout: BINDING_property,
            hidden: BINDING_property,
            icon: BINDING_property,
            id: BINDING_property,
            label: BINDING_property,
            lastElementFocus: BINDING_property,
            section: BINDING_property,
            selected: BINDING_property,
            tooltip: BINDING_property,
            type: BINDING_property,
            onclick: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: objectMap(api, function (value) { return value.binding; }),
            template: "<HR ng-transclude='true'></HR>",
            transclude: true,
            link: function ($scope, elements) {
                var element = elements[0];
                element.removeAttribute("disabled");
                element.removeAttribute("id");
                element.removeAttribute("type");
                var bindings = [];
                var command;
                var options = objectMap(api, function (value, key) { return value($scope, key, element, function () { return command; }, bindings); });
                options.type = 'separator';
                command = new WinJS.UI.AppBarCommand(element, options);
                addDestroyListener($scope, command, bindings);
                return command;
            }
        };
    });
	
    exists("BackButton") && module.directive("winBackButton", function () {
        return {
            restrict: "E",
            replace: true,
            template: "<BUTTON></BUTTON>",
            link: function ($scope, elements) {
                var element = elements[0];
                var control = new WinJS.UI.BackButton(element);
                addDestroyListener($scope, control, []);
                return control;
            }
        };
    });

    exists("CellSpanningLayout") && module.directive("winCellSpanningLayout", function () {
        var api = {
            groupHeaderPosition: BINDING_property,
            groupInfo: BINDING_property,
            itemInfo: BINDING_property,
            maximumRowsOrColumns: BINDING_property,
            orientation: BINDING_property
        };
        return {
            require: "^winListView",
            restrict: "E",
            replace: true,
            template: "",
            scope: objectMap(api, function (value) { return value.binding; }),
            link: function ($scope, elements, attrs, listView) {
                var bindings = [];
                var layout;
                var options = objectMap(api, function (value, key) { return value($scope, key, null, function () { return layout; }, bindings); });
                layout = listView.layout = new WinJS.UI.CellSpanningLayout(options);
                addDestroyListener($scope, layout, bindings);
                return layout;
            }
        };
    });

    exists("NavBarContainer") && module.directive("winCommandTemplate", function () {
        return {
            require: ["^?winNavBarContainer"],
            restrict: "E",
            replace: true,
            transclude: true,
            compile: compileTemplate("template")
        };
    });

    exists("DatePicker") && module.directive("winDatePicker", function () {
        var api = {
            calendar: BINDING_property,
            current: BINDING_property,
            datePattern: BINDING_property,
            disabled: BINDING_property,
            maxYear: BINDING_property,
            minYear: BINDING_property,
            monthPattern: BINDING_property,
            yearPattern: BINDING_property,
            onchange: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: objectMap(api, function (value) { return value.binding; }),
            template: "<DIV></DIV>",
            link: function ($scope, elements) {
                var element = elements[0];
                element.removeAttribute("disabled");
                var bindings = [];
                var datePicker;
                var options = objectMap(api, function (value, key) { return value($scope, key, element, function () { return datePicker; }, bindings); });
                datePicker = new WinJS.UI.DatePicker(element, options);
                datePicker.addEventListener("change", function () {
                    apply($scope, function () {
                        $scope["current"] = datePicker["current"];
                    });
                });
                addDestroyListener($scope, datePicker, bindings);
                return datePicker;
            }
        };
    });

    exists("FlipView") && module.directive("winFlipView", ['$parse', function ($parse) {
        var api = {
            currentPage: BINDING_property,
            itemDataSource: BINDING_dataSource,
            itemSpacing: BINDING_property,
            itemTemplate: BINDING_property,
            orientation: BINDING_property,
            ondatasourcecountchanged: BINDING_event,
            onpagecompleted: BINDING_event,
            onpageselected: BINDING_event,
            onpagevisibilitychanged: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: objectMap(api, function (value) { return value.binding; }),
            template: "<DIV ng-transclude='true'></DIV>",
            transclude: true,
            controller: ['$scope', function ($scope) {
                proxy($scope, this, "itemTemplate");
            }],
            link: function ($scope, elements, attrs) {
                var element = elements[0];
                var bindings = [];
                var flipView;
                var options = objectMap(api, function (value, key) { return value($scope, key, element, function () { return flipView; }, bindings); });
                flipView = new WinJS.UI.FlipView(element, options);
                addDestroyListener($scope, flipView, bindings);
                return flipView;
            }
        };
    }]);

    exists("Flyout") && module.directive("winFlyout", ['$parse', function ($parse) {
        var api = {
            alignment: BINDING_property,
            anchor: BINDING_anchor,
            hidden: BINDING_property,
            placement: BINDING_property,
            onafterhide: BINDING_event,
            onaftershow: BINDING_event,
            onbeforehide: BINDING_event,
            onbeforeshow: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: objectMap(api, function (value) { return value.binding; }),
            template: "<DIV ng-transclude='true'></DIV>",
            transclude: true,
            link: function ($scope, elements, attrs) {
                var element = elements[0];
                var bindings = [];
                var flyout;
                var options = objectMap(api, function (value, key) { return value($scope, key, element, function () { return flyout; }, bindings); });
                flyout = new WinJS.UI.Flyout(element, options);
                var anchor = flyout.anchor;
                if (anchor && anchor instanceof HTMLElement && !anchor._anchorClick) {
                    anchor._anchorClick = function () { flyout.show(); };
                    anchor.addEventListener("click", anchor._anchorClick);
                }
                if(attrs.shown) {
                	var shownProp = $parse(attrs.shown);
                	applyShown(flyout, shownProp($scope));
                	$scope.$watch(attrs.shown, function (newVal, oldVal, scope) {
                		applyShown(flyout, shownProp(scope));
                	});
                	flyout.addEventListener("beforehide", function () {
                		shownProp.assign($scope, false);
                	});
                	flyout.addEventListener("beforeshow", function () {
                		shownProp.assign($scope, true);
                	});
   	            }
                addDestroyListener($scope, flyout, bindings);
                return flyout;
            }
        };
    }]);

    exists("GridLayout") && module.directive("winGridLayout", function () {
        var api = {
            groupHeaderPosition: BINDING_property,
            maximumRowsOrColumns: BINDING_property,
            orientation: BINDING_property
        };
        return {
            require: "^winListView",
            restrict: "E",
            replace: true,
            template: "",
            scope: objectMap(api, function (value) { return value.binding; }),
            link: function ($scope, elements, attrs, listView) {
                var bindings = [];
                var layout;
                var options = objectMap(api, function (value, key) { return value($scope, key, null, function () { return layout; }, bindings); });
                layout = listView.layout = new WinJS.UI.GridLayout(options);
                addDestroyListener($scope, layout, bindings);
                return layout;
            }
        };
    });

    exists("ListView") && module.directive("winGroupHeaderTemplate", function () {
        return {
            require: ["^?winListView"],
            restrict: "E",
            replace: true,
            transclude: true,
            compile: compileTemplate("groupHeaderTemplate")
        };
    });

    exists("Hub") && module.directive("winHub", function () {
        var api = {
            headerTemplate: BINDING_property,
            indexOfFirstVisible: BINDING_property,
            indexOfLastVisible: BINDING_property,
            loadingState: BINDING_property,
            orientation: BINDING_property,
            scrollPosition: BINDING_property,
            sectionOnScreen: BINDING_property,
            sections: BINDING_list,
            oncontentanimating: BINDING_event,
            onheaderinvoked: BINDING_event,
            onloadingstatechanged: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: objectMap(api, function (value) { return value.binding; }),
            template: "<DIV><DIV class='placeholder-holder' style='display:none;' ng-transclude='true'></DIV></DIV>",
            transclude: true,
            controller: ['$scope', function ($scope) {
                // The children will (may) call back before the Hub is constructed so we queue up the calls to
                //  addSection and removeSection and execute them later.
                $scope.deferredCalls = [];
                function deferred(wrapped) {
                    return function () {
                        var f = Function.prototype.apply.bind(wrapped, null, arguments);
                        if ($scope.deferredCalls) {
                            $scope.deferredCalls.push(f);
                        } else {
                            f();
                        }
                    }
                }
                proxy($scope, this, "headerTemplate");
                this.addSection = deferred(function (section, index) {
                    $scope.addSection(section, index);
                });
                this.removeSection = deferred(function (section) {
                    $scope.removeSection(section);
                });
            }],
            link: function ($scope, elements) {
                var element = elements[0];
                // NOTE: the Hub will complain if this is in the DOM when it is constructed so we temporarially remove it.
                //       It must be in the DOM when repeaters run and hosted under the hub.
                var sectionsHost = element.firstElementChild;
                sectionsHost.parentNode.removeChild(sectionsHost);
                var bindings = [];
                var hub;
                var options = objectMap(api, function (value, key) { return value($scope, key, element, function () { return hub; }, bindings); });
                hub = new WinJS.UI.Hub(element, options);
                element.appendChild(sectionsHost);
                $scope.addSection = function (section, index) {
                    hub.sections.splice(index, 0, section);
                };
                $scope.removeSection = function (section) {
                    hub.sections.splice(hub.sections.indexOf(section), 1);
                };
                $scope.deferredCalls.forEach(function (f) { f(); });
                $scope.deferredCalls = null;
                hub.addEventListener("loadingstatechanged", function () {
                    apply($scope, function () {
                        $scope["loadingState"] = hub["loadingState"];
                    });
                });
                addDestroyListener($scope, hub, bindings);
                return hub;
            }
        };
    });

    exists("HubSection") && module.directive("winHubSection", function () {
        var api = {
            header: BINDING_property,
            isHeaderStatic: BINDING_property
        };
        return {
            restrict: "E",
            require: "^winHub",
            replace: true,
            scope: objectMap(api, function (value) { return value.binding; }),
            // NOTE: there is an arbitrary wrapper here .placeholder which is used in scenarios where developers stamp
            //       out hub sections using ng-repeat. In order to support things like that we need to infer the order
            //       that the sections are in relative to static sections so we manage them in a .placeholder-holder
            //       element (see winHub directive above), the placeholder always lives in that thing. The content
            //       (meaning the real hub section) ends up being owned by the Hub.
            template: "<DIV class='placeholder'><DIV ng-transclude='true'></DIV></DIV>",
            transclude: true,
            link: function ($scope, elements, attrs, hub) {
                var placeholder = elements[0];
                var element = placeholder.firstElementChild;
                var bindings = [];
                var section;
                var options = objectMap(api, function (value, key) { return value($scope, key, element, function () { return section; }, bindings); });
                section = new WinJS.UI.HubSection(element, options);
                hub.addSection(section, Array.prototype.indexOf.call(placeholder.parentNode.children, placeholder));
                addDestroyListener($scope, section, bindings, function () {
                    hub.removeSection(section);
                });
                return section;
            }
        };
    });

    exists("ItemContainer") && module.directive("winItemContainer", function () {
        var api = {
            draggable: BINDING_property,
            selected: BINDING_dataSource,
            selectionDisabled: BINDING_property,
            swipeBehavior: BINDING_property,
            tapBehavior: BINDING_property,
            oninvoked: BINDING_event,
            onselectionchanged: BINDING_event,
            onselectionchanging: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: objectMap(api, function (value) { return value.binding; }),
            template: "<DIV ng-transclude='true'></DIV>",
            transclude: true,
            link: function ($scope, elements) {
                var element = elements[0];
                var bindings = [];
                var itemContainer;
                var options = objectMap(api, function (value, key) { return value($scope, key, element, function () { return itemContainer; }, bindings); });
                itemContainer = new WinJS.UI.ItemContainer(element, options);
                itemContainer.addEventListener("selectionchanged", function () {
                    apply($scope, function () {
                        $scope["selected"] = itemContainer["selected"];
                    });
                });
                addDestroyListener($scope, itemContainer, bindings);
                return itemContainer;
            }
        };
    });

    (exists("ListView") || exists("FlipView")) && module.directive("winItemTemplate", function () {
        return {
            require: ["^?winListView", "^?winFlipView"],
            restrict: "E",
            replace: true,
            transclude: true,
            compile: compileTemplate("itemTemplate")
        };
    });

    exists("ListLayout") && module.directive("winListLayout", function () {
        var api = {
            groupHeaderPosition: BINDING_property,
            orientation: BINDING_property
        };
        return {
            require: "^winListView",
            restrict: "E",
            replace: true,
            template: "",
            scope: objectMap(api, function (value) { return value.binding; }),
            link: function ($scope, elements, attrs, listView) {
                var bindings = [];
                var layout;
                var options = objectMap(api, function (value, key) { return value($scope, key, null, function () { return layout; }, bindings); });
                layout = listView.layout = new WinJS.UI.ListLayout(options);
                addDestroyListener($scope, layout, bindings);
                return layout;
            }
        };
    });

    exists("ListView") && module.directive("winListView", ['$parse', function ($parse) {
        var api = {
            currentItem: BINDING_property,
            groupDataSource: BINDING_dataSource,
            groupHeaderTemplate: BINDING_property,
            groupHeaderTapBehavior: BINDING_property,
            indexOfFirstVisible: BINDING_property,
            indexOfLastVisible: BINDING_property,
            itemDataSource: BINDING_dataSource,
            itemsDraggable: BINDING_property,
            itemsReorderable: BINDING_property,
            itemTemplate: BINDING_property,
            layout: BINDING_property,
            loadingBehavior: BINDING_property,
            maxDeferredItemsCleanup: BINDING_property,
            scrollPosition: BINDING_property,
            selection: BINDING_selection,
            selectionMode: BINDING_property,
            swipeBehavior: BINDING_property,
            tapBehavior: BINDING_property,
            oncontentanimating: BINDING_event,
            ongroupheaderinvoked: BINDING_event,
            onitemdragstart: BINDING_event,
            onitemdragenter: BINDING_event,
            onitemdragbetween: BINDING_event,
            onitemdragleave: BINDING_event,
            onitemdragchanged: BINDING_event,
            onitemdragdrop: BINDING_event,
            oniteminvoked: BINDING_event,
            onkeyboardnavigating: BINDING_event,
            onloadingstatechanged: BINDING_event,
            onselectionchanged: BINDING_event,
            onselectionchanging: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: objectMap(api, function (value) { return value.binding; }),
            template: "<DIV ng-transclude='true'></DIV>",
            transclude: true,
            controller: ['$scope', function ($scope) {
                proxy($scope, this, "itemTemplate");
                proxy($scope, this, "groupHeaderTemplate");
                proxy($scope, this, "layout");
                proxy($scope, this, "selection");
            }],
            link: function ($scope, elements, attrs) {
                var element = elements[0];
                var bindings = [];
                var listView;
                var options = objectMap(api, function (value, key) { return value($scope, key, element, function () { return listView; }, bindings); });
                listView = new WinJS.UI.ListView(element, options);
                listView.addEventListener("selectionchanged", function () {
                    var value = $scope["selection"];
                    if (value) {
                        apply($scope, function () {
                            var current = listView.selection.getIndices();
                            value.length = 0;
                            current.forEach(function (item) {
                                value.push(item);
                            });
                        });
                    }
                });
                addDestroyListener($scope, listView, bindings);
                return listView;
            }
        };
    }]);

    exists("Menu") && module.directive("winMenu", ['$parse', function ($parse) {
        var api = {
            alignment: BINDING_property,
            anchor: BINDING_anchor,
            commmands: BINDING_property,
            onafterhide: BINDING_event,
            onaftershow: BINDING_event,
            onbeforehide: BINDING_event,
            onbeforeshow: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: objectMap(api, function (value) { return value.binding; }),
            template: "<DIV ng-transclude='true'></DIV>",
            transclude: true,
            link: function ($scope, elements, attrs) {
                var element = elements[0];
                var bindings = [];
                var menu;
                var options = objectMap(api, function (value, key) { return value($scope, key, element, function () { return menu; }, bindings); });
                menu = new WinJS.UI.Menu(element, options);
                var anchor = menu.anchor;
                if (anchor && anchor instanceof HTMLElement && anchor._anchorClick) {
                    anchor._anchorClick = function () { menu.show(); };
                    anchor.addEventListener("click", anchor._anchorClick);
                }
                if(attrs.shown) {
                	var shownProp = $parse(attrs.shown);
                	applyShown(menu, shownProp($scope));
                	$scope.$watch(attrs.shown, function (newVal, oldVal, scope) {
                		applyShown(menu, shownProp(scope));
                	});
                	menu.addEventListener("beforehide", function () {
                		shownProp.assign($scope, false);
                	});
                	menu.addEventListener("beforeshow", function () {
                		shownProp.assign($scope, true);
                	});
   	            }
                addDestroyListener($scope, menu, bindings);
                return menu;
            }
        };
    }]);

    exists("MenuCommand") && module.directive("winMenuCommand", function () {
        var api = {
            disabled: BINDING_property,
            extraClass: BINDING_property,
            flyout: BINDING_property,
            hidden: BINDING_property,
            id: BINDING_property,
            label: BINDING_property,
            section: BINDING_property,
            selected: BINDING_property,
            type: BINDING_property,
            onclick: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: objectMap(api, function (value) { return value.binding; }),
            template: "<BUTTON></BUTTON>",
            link: function ($scope, elements) {
                var element = elements[0];
                element.removeAttribute("disabled");
                element.removeAttribute("id");
                var bindings = [];
                var command;
                var options = objectMap(api, function (value, key) { return value($scope, key, element, function () { return command; }, bindings); });
                command = new WinJS.UI.MenuCommand(element, options);
                addDestroyListener($scope, command, bindings);
                return command;
            }
        };
    });
	
    exists("NavBar") && module.directive("winNavBar", ['$parse', function ($parse) {
        return {
            restrict: "E",
            replace: true,
            template: "<DIV ng-transclude='true'></DIV>",
            transclude: true,
            link: function ($scope, elements, attrs) {
                var element = elements[0];
                var navbar = new WinJS.UI.NavBar(element);
                if(attrs.shown) {
                	var shownProp = $parse(attrs.shown);
                	applyShown(navbar, shownProp($scope));
                	$scope.$watch(attrs.shown, function (newVal, oldVal, scope) {
                		applyShown(navbar, shownProp(scope));
                	});
                	navbar.addEventListener("beforehide", function () {
                		shownProp.assign($scope, false);
                	});
                	navbar.addEventListener("beforeshow", function () {
                		shownProp.assign($scope, true);
                	});
   	            }
                addDestroyListener($scope, navbar, []);
                return navbar;
            }
        };
    }]);

    exists("NavBarCommand") && module.directive("winNavBarCommand", function () {
        var api = {
            icon: BINDING_property,
            label: BINDING_property,
            location: BINDING_property,
            splitButton: BINDING_property,
            state: BINDING_property,
            tooltip: BINDING_property
        };
        return {
            restrict: "E",
            replace: true,
            scope: objectMap(api, function (value) { return value.binding; }),
            template: "<DIV ng-transclude='true'></DIV>",
            transclude: true,
            link: function ($scope, elements) {
                var element = elements[0];
                var bindings = [];
                var command;
                var options = objectMap(api, function (value, key) { return value($scope, key, element, function () { return command; }, bindings); });
                command = new WinJS.UI.NavBarCommand(element, options);
                addDestroyListener($scope, command, bindings);
                return command;
            }
        };
    });

    exists("NavBarContainer") && module.directive("winNavBarContainer", function () {
        var api = {
            data: BINDING_list,
            fixedSize: BINDING_property,
            layout: BINDING_property,
            template: BINDING_property,
            maxRows: BINDING_property,
            oninvoked: BINDING_event,
            onsplittoggle: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: objectMap(api, function (value) { return value.binding; }),
            template: "<DIV ng-transclude='true'></DIV>",
            transclude: true,
            controller: ['$scope', function ($scope) {
                proxy($scope, this, "template");
            }],
            link: function ($scope, elements) {
                var element = elements[0];
                var bindings = [];
                var container;
                var options = objectMap(api, function (value, key) { return value($scope, key, element, function () { return container; }, bindings); });
                container = new WinJS.UI.NavBarContainer(element, options);
                addDestroyListener($scope, container, bindings);
                return container;
            }
        };
    });

    exists("Pivot") && module.directive("winPivot", function () {
        var api = {
            items: BINDING_list,
            locked: BINDING_property,
            selectedIndex: BINDING_property,
            selectedItem: BINDING_property,
            title: BINDING_property,
            onitemanimationend: BINDING_event,
            onitemanimationstart: BINDING_event,
            onselectionchanged: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: objectMap(api, function (value) { return value.binding; }),
            template: "<DIV><DIV class='placeholder-holder' style='display:none;' ng-transclude='true'></DIV></DIV>",
            transclude: true,
            controller: ['$scope', function ($scope) {
                // The children will (may) call back before the Pivot is constructed so we queue up the calls to
                //  addItem and removeItem and execute them later.
                $scope.deferredCalls = [];
                function deferred(wrapped) {
                    return function () {
                        var f = Function.prototype.apply.bind(wrapped, null, arguments);
                        if ($scope.deferredCalls) {
                            $scope.deferredCalls.push(f);
                        } else {
                            f();
                        }
                    }
                }
                this.addItem = deferred(function (item, index) {
                    $scope.addItem(item, index);
                });
                this.removeItem = deferred(function (item) {
                    $scope.removeItem(item);
                });
            }],
            link: function ($scope, elements) {
                var element = elements[0];
                // NOTE: the Pivot will complain if this is in the DOM when it is constructed so we temporarially remove it.
                //       It must be in the DOM when repeaters run and hosted under the pivot.
                var itemsHost = element.firstElementChild;
                itemsHost.parentNode.removeChild(itemsHost);
                var bindings = [];
                var pivot;
                var options = objectMap(api, function (value, key) { return value($scope, key, element, function () { return pivot; }, bindings); });
                pivot = new WinJS.UI.Pivot(element, options);
                element.appendChild(itemsHost);
                $scope.addItem = function (item, index) {
                    pivot.items.splice(index, 0, item);
                };
                $scope.removeItem = function (item) {
                    pivot.items.splice(pivot.items.indexOf(item), 1);
                };
                $scope.deferredCalls.forEach(function (f) { f(); });
                $scope.deferredCalls = null;
                addDestroyListener($scope, pivot, bindings);
                return pivot;
            }
        };
    });

    exists("PivotItem") && module.directive("winPivotItem", function () {
        var api = {
            header: BINDING_property
        };
        return {
            restrict: "E",
            require: "^winPivot",
            replace: true,
            scope: objectMap(api, function (value) { return value.binding; }),
            // NOTE: there is an arbitrary wrapper here .placeholder which is used in scenarios where developers stamp
            //       out pivot sections using ng-repeat. In order to support things like that we need to infer the order
            //       that the sections are in relative to static sections so we manage them in a .placeholder-holder
            //       element (see winPivot directive above), the placeholder always lives in that thing. The content
            //       (meaning the real pivot section) ends up being owned by the Hub.
            template: "<DIV class='placeholder'><DIV ng-transclude='true'></DIV></DIV>",
            transclude: true,
            link: function ($scope, elements, attrs, pivot) {
                var placeholder = elements[0];
                var element = placeholder.firstElementChild;
                var bindings = [];
                var item;
                var options = objectMap(api, function (value, key) { return value($scope, key, element, function () { return item; }, bindings); });
                item = new WinJS.UI.PivotItem(element, options);
                pivot.addItem(item, Array.prototype.indexOf.call(placeholder.parentNode.children, placeholder));
                addDestroyListener($scope, item, bindings, function () {
                    pivot.removeItem(item);
                });
                return item;
            }
        };
    });

    exists("Rating") && module.directive("winRating", function () {
        var api = {
            averageRating: BINDING_property,
            disabled: BINDING_property,
            enableClear: BINDING_property,
            maxRating: BINDING_property,
            tooltipStrings: BINDING_property,
            userRating: BINDING_property,
            oncancel: BINDING_event,
            onchange: BINDING_event,
            onpreviewchange: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: objectMap(api, function (value) { return value.binding; }),
            template: "<DIV></DIV>",
            link: function ($scope, elements) {
                var element = elements[0];
                element.removeAttribute("disabled");
                var bindings = [];
                var rating;
                var options = objectMap(api, function (value, key) { return value($scope, key, element, function () { return rating; }, bindings); });
                rating = new WinJS.UI.Rating(element, options);
                rating.addEventListener("change", function () {
                    apply($scope, function () {
                        $scope["userRating"] = rating["userRating"];
                    });
                });
                addDestroyListener($scope, rating, bindings);
                return rating;
            }
        };
    });

    exists("SearchBox") && module.directive("winSearchBox", ['$parse', function ($parse) {
        var api = {
            chooseSuggestionOnEnter: BINDING_property,
            disabled: BINDING_property,
            focusOnKeyboardInput: BINDING_property,
            placeholderText: BINDING_property,
            queryText: BINDING_property,
            searchHistoryContext: BINDING_property,
            searchHistoryDisabled: BINDING_property,
            onquerychanged: BINDING_event,
            onquerysubmitted: BINDING_event,
            onreceivingfocusonkeyboardinput: BINDING_event,
            onresultsuggestionchosen: BINDING_event,
            onsuggestionsrequested: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: objectMap(api, function (value) { return value.binding; }),
            template: "<DIV></DIV>",
            link: function ($scope, elements, attrs) {
                var element = elements[0];
                element.removeAttribute("disabled");
                var bindings = [];
                var searchBox;
                var options = objectMap(api, function (value, key) { return value($scope, key, element, function () { return searchBox; }, bindings); });
                searchBox = new WinJS.UI.SearchBox(element, options);
                searchBox.addEventListener("querychanged", function () {
                    apply($scope, function () {
                        $scope["queryText"] = searchBox["queryText"];
                    });
                });
                addDestroyListener($scope, searchBox, bindings);
                return searchBox;
            }
        };
    }]);

    exists("SectionHeaderTemplate") && module.directive("winSectionHeaderTemplate", function () {
        return {
            require: ["^?winHub"],
            restrict: "E",
            replace: true,
            transclude: true,
            compile: compileTemplate("headerTemplate")
        };
    });

    exists("SemanticZoom") && module.directive("winSemanticZoom", function () {
        var api = {
            enableButton: BINDING_property,
            locked: BINDING_property,
            zoomedOut: BINDING_property,
            zoomFactor: BINDING_property,
            onzoomchanged: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: objectMap(api, function (value) { return value.binding; }),
            template: "<DIV ng-transclude='true'></DIV>",
            transclude: true,
            link: function ($scope, elements) {
                var element = elements[0];
                var bindings = [];
                var sezo;
                var options = objectMap(api, function (value, key) { return value($scope, key, element, function () { return sezo; }, bindings); });
                sezo = new WinJS.UI.SemanticZoom(element, options);
                addDestroyListener($scope, sezo, bindings);
                return sezo;
            }
        };
    });

    exists("TimePicker") && module.directive("winTimePicker", function () {
        var api = {
            clock: BINDING_property,
            current: BINDING_property,
            disabled: BINDING_property,
            hourPattern: BINDING_property,
            minuteIncrement: BINDING_property,
            minutePattern: BINDING_property,
            periodPattern: BINDING_property,
            onchange: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: objectMap(api, function (value) { return value.binding; }),
            template: "<DIV></DIV>",
            link: function ($scope, elements) {
                var element = elements[0];
                element.removeAttribute("disabled");
                var bindings = [];
                var timePicker;
                var options = objectMap(api, function (value, key) { return value($scope, key, element, function () { return timePicker; }, bindings); });
                timePicker = new WinJS.UI.TimePicker(element, options);
                timePicker.addEventListener("change", function () {
                    apply($scope, function () {
                        $scope["current"] = timePicker["current"];
                    });
                });
                addDestroyListener($scope, timePicker, bindings);
                return timePicker;
            }
        };
    });

    exists("ToggleSwitch") && module.directive("winToggleSwitch", function () {
        var api = {
            checked: BINDING_property,
            disabled: BINDING_property,
            labelOff: BINDING_property,
            labelOn: BINDING_property,
            title: BINDING_property,
            onchange: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: objectMap(api, function (value) { return value.binding; }),
            template: "<DIV></DIV>",
            link: function ($scope, elements) {
                var element = elements[0];
                element.removeAttribute("checked");
                element.removeAttribute("disabled");
                element.removeAttribute("title");
                var bindings = [];
                var toggle;
                var options = objectMap(api, function (value, key) { return value($scope, key, element, function () { return toggle; }, bindings); });
                toggle = new WinJS.UI.ToggleSwitch(element, options);
                toggle.addEventListener("change", function () {
                    apply($scope, function () {
                        $scope["checked"] = toggle["checked"];
                    });
                });
                addDestroyListener($scope, toggle, bindings);
                return toggle;
            }
        };
    });

    exists("Tooltip") && module.directive("winTooltip", ['$parse', function ($parse) {
        var api = {
            contentElement: BINDING_property,
            extraClass: BINDING_property,
            innerHTML: BINDING_property,
            infotip: BINDING_property,
            placement: BINDING_property,
            onbeforeclose: BINDING_event,
            onbeforeopen: BINDING_event,
            onclosed: BINDING_event,
            onopened: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: objectMap(api, function (value) { return value.binding; }),
            template: "<DIV ng-transclude='true'></DIV>",
            transclude: true,
            controller: ['$scope', function ($scope) {
                proxy($scope, this, "contentElement");
            }],
            link: function ($scope, elements, attrs) {
                var element = elements[0];
                var bindings = [];
                var tooltip;
                var options = objectMap(api, function (value, key) { return value($scope, key, element, function () { return tooltip; }, bindings); });
                tooltip = new WinJS.UI.Tooltip(element, options);
                addDestroyListener($scope, tooltip, bindings);
                return tooltip;
            }
        };
    }]);

    // Tooltop is a little odd because you have to be able to specify both the element
    // which has a tooltip (the content) and the tooltip's content itself. We specify
    // a special directive <win-tooltip-content /> which represents the latter.
    exists("Tooltip") && module.directive("winTooltipContent", function () {
        return {
            require: "^winTooltip",
            restrict: "E",
            replace: true,
            transclude: true,
            template: "\
<div style='display:none'>\
  <div ng-transclude='true'></div>\
</div>",
            link: function ($scope, elements, attrs, tooltip) {
                tooltip.contentElement = elements[0].firstElementChild;
            }
        };
    });

    // @TODO, This guy is a real odd-ball, you really need to coordinate with the settings 
    // event which fires, I need to think more about this.
    WinJS.UI.SettingsFlyout;

    // Do not support explicitly, use ng-repeat
    //WinJS.UI.Repeater;
	
	//surface winControl property as win-control directive
	//keep priority set to a higher value than others (default is 0)
	//as 'link' ie. postLink functions run highest priority last
	module.directive("winControl", ['$parse', function ($parse) {
        return {
            restrict: "A",
            priority: 1,
            link: function ($scope, element, attrs) {
                if (attrs.winControl) {
                	$parse(attrs.winControl).assign($scope, element[0].winControl);
                }
            }
        };
    }]);
	
}(this));
