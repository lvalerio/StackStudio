/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true requirejs:true require:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'common',
        'text!templates/account/managementCloudAccountListTemplate.html',
        'collections/groups',
        'collections/users',
        'views/account/cloudAccountCreateView',
        'views/account/groupManageUsersView',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator'
], function( $, _, Backbone, Common, groupsManagementListTemplate, Groups, Users, CloudAccountCreate, ManageGroupUsers ) {

    var CloudAccountsManagementListView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(groupsManagementListTemplate),
        
        rootView: undefined,

        groups: undefined,
        
        users: new Users(),

        selectedGroup: undefined,
        
        CloudAccountCreateView: CloudAccountCreate,

        events: {
            "click #create_group_button" : "createGroup",
            "click #delete_group_button" : "deleteGroup",
            'click #group_users_table tr': 'selectGroup'
        },

        initialize: function( options ) {
            this.$el.html(this.template);
            this.rootView = options.rootView;
            $("#submanagement_app").html(this.$el);
            $("button").button();
            $("#group_users_table").dataTable({
                "bJQueryUI": true,
                "bProcessing": true
            });
            
            var managementView = this;
            Common.vent.on("managementRefresh", function() {
                managementView.render();
            });
            
            this.selectedGroup = undefined;
            this.groups = this.rootView.cloudAccounts;
            this.render();
        },

        render: function () {
            this.disableSelectionRequiredButtons(true);
            $("#group_users_table").dataTable().fnClearTable();
            
            var groupListView = this;
            this.groups.fetch({
                data: $.param({ org_id: sessionStorage.org_id, account_id: sessionStorage.account_id}),
                reset: true,
                success: function(){
                    groupListView.addAllGroups();
                }
            });
        },
        
        selectGroup: function(event){
            $("#group_users_table tr").removeClass('row_selected');
            $(event.currentTarget).addClass('row_selected');
            
            var rowData = $("#group_users_table").dataTable().fnGetData(event.currentTarget);
            
            this.selectedGroup = this.groups.get($.parseHTML(rowData[0])[0]);
            
            if(this.selectedGroup) {
                this.disableSelectionRequiredButtons(false);
            }
        },
        
        addAllGroups: function() {
            $("#group_users_table").dataTable().fnClearTable();
            $.each(this.groups.models, function(index, value) {
                var auth_url = "";
                if(value.attributes.url){
                    auth_url = value.attributes.url;
                }
                
                var rowData = ['<a href="#account/management/cloud-accounts" id="'+value.attributes.id+'" class="cloud_account_item">'+value.attributes.name+"</a>", value.attributes.cloud_provider, auth_url];
                $("#group_users_table").dataTable().fnAddData(rowData);
            });
        },

        disableSelectionRequiredButtons: function(toggle) {
            if(toggle) {
                $("#delete_group_button").attr("disabled", true);
                $("#delete_group_button").addClass("ui-state-disabled");
                $("#delete_group_button").removeClass("ui-state-hover");
                $("#manage_group_users_button").attr("disabled", true);
                $("#manage_group_users_button").addClass("ui-state-disabled");
            }else {
                $("#delete_group_button").removeAttr("disabled");
                $("#delete_group_button").removeClass("ui-state-disabled");
                $("#manage_group_users_button").removeAttr("disabled");
                $("#manage_group_users_button").removeClass("ui-state-disabled");
            }
            
            this.adminCheck();
        },
        
        adminCheck: function(){
            var groupsView = this;
            groupsView.users.fetch({success: function(){
                var isAdmin = false;
                if(groupsView.users.get(sessionStorage.account_id).attributes.permissions.length > 0){
                    isAdmin = groupsView.users.get(sessionStorage.account_id).attributes.permissions[0].permission.name === "admin";
                }
                if(!isAdmin){
                    $("#delete_group_button").attr("disabled", true);
                    $("#delete_group_button").addClass("ui-state-disabled");
                    $("#delete_group_button").removeClass("ui-state-hover");
                    $("#create_group_button").attr("disabled", true);
                    $("#create_group_button").addClass("ui-state-disabled");
                }
            }});
        },

        createGroup: function() {
            var CloudAccountCreateView = this.CloudAccountCreateView;
            
            this.newResourceDialog = new CloudAccountCreateView({ org_id: sessionStorage.org_id, account_id: sessionStorage.account_id, rootView: this.rootView });
            
            this.newResourceDialog.render();
        },

        deleteGroup: function() {
            if(this.selectedGroup) {
                this.selectedGroup.destroy(sessionStorage.login);
            }
        },

        clearSelection: function() {
            this.selectedGroup = undefined;
            $(".group_item").removeClass("selected_item");
        },

        close: function(){
            this.$el.remove();
        }  
    });

    return CloudAccountsManagementListView;
});