// main.js
;(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'knockout', 'osfutils'], factory);
    } else {
        global.PrivateLinkManager  = factory(jQuery, ko);
        $script.done("privateLinkManager");
    }
}(this, function($, ko) {

    var NODE_OFFSET = 25;
    var PrivateLinkViewModel = function(url) {
        var self = this;

        self.url = url;
        self.title = ko.observable('');
        self.name = ko.observable(null);
        self.pageTitle = 'Generate New Link to Share Project';
        self.errorMsg = ko.observable('');

        self.nodes = ko.observableArray([]);
        self.nodesToChange = ko.observableArray();

        /**
         * Fetches the node info from the server and updates the viewmodel.
         */

        function onFetchSuccess(response) {
            self.title(response.node.title);
            $.each(response['children'], function(idx, child) {
                child['margin'] = NODE_OFFSET + child['indent'] * NODE_OFFSET + 'px';
            });
            self.nodes(response['children']);
        }

        function onFetchError() {
          //TODO
          console.log('an error occurred');
        }

        function fetch() {
            $.ajax({url: url, type: 'GET', dataType: 'json',
              success: onFetchSuccess,
              error: onFetchError
            });
        }

        // Initial fetch of data
        fetch();

        self.cantSelectNodes = function() {
            return self.nodesToChange().length == self.nodes().length;
        };
        self.cantDeselectNodes = function() {
            return self.nodesToChange().length == 0;
        };

        self.selectNodes = function() {
            self.nodesToChange($.osf.mapByProperty(self.nodes(), 'id'));
        };
        self.deselectNodes = function() {
            self.nodesToChange([]);
        };

        self.submit = function() {
            $.ajax(
                nodeApiUrl + 'private_link/',
                {
                    type: 'post',
                    data: JSON.stringify({
                        node_ids: self.nodesToChange(),
                        name: self.name()
                    }),
                    contentType: 'application/json',
                    dataType: 'json',
                    success: function(response) {
                        window.location.reload();
                    }
                }
            )
        };

        self.clear = function() {
            self.nodesToChange([]);
        };
    };


    function PrivateLinkManager (selector, url) {
        var self = this;
        self.viewModel = new PrivateLinkViewModel(url);
        $.osf.applyBindings(self.viewModel, selector);
    }
    return PrivateLinkManager;

}));