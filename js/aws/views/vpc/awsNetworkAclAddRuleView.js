/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'underscore',
        'backbone',
        'views/dialogView',
        'text!templates/aws/vpc/awsNetworkAclAddRuleTemplate.html',
        'icanhaz',
        'common',
        'jquery.multiselect',
        'jquery.multiselect.filter'
        
], function( $, _, Backbone, DialogView, networkAclAddRuleTemplate, ich, Common ) {
			
    /**
     * NetworkAclAddRuleView adds a rule to an existing Network ACL.
     *
     * @name NetworkAclAddRuleView
     * @constructor
     * @category NetworkAcl
     * @param {Object} initialization object.
     * @returns {Object} Returns a NetworkAclAddRuleView instance.
     */
	
	var NetworkAclAddRuleView = DialogView.extend({

        credentialId: undefined,

        region: undefined,


		template: _.template(networkAclAddRuleTemplate),

		// Delegated events for creating new instances, etc.
		events: {
			"dialogclose": "close"
		},

		initialize: function(options) {
			//TODO
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.networkAcl = options.networkAcl;
            this.render();
		},

		render: function() {
			var createView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Add Network Acl Rule",
                width:500,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: {
                    Add: function () {
                        createView.addRule();
                    },
                    Cancel: function() {
                        createView.cancel();
                    }
                }
                
            });
           
		},

		addRule: function() {
			var networkAcl = this.networkAcl;
            var options = {};
            var issue = false;

            //Validate and create

            if(!issue) {
                // networkAcl.addRule(options, this.credentialId, this.region);
                this.$el.dialog('close');
            }else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
		}

	});
    
	return NetworkAclAddRuleView;
});
