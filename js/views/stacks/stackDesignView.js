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
        'common',
        'text!templates/stacks/stackDesignTemplate.html',
        'collections/assemblies',
        '/js/aws/views/cloud_formation/awsCloudFormationStackCreateView.js',
        'ace',
        'collections/configManagers',
        'mode-json',
        'jquery.jstree'
], function( $, _, Backbone, Common,  stackDesignTemplate, Assemblies, StackCreate, ace, ConfigManagers) {
    'use strict';

    var StackDesignView = Backbone.View.extend({
        template: _.template(stackDesignTemplate),
        editor: undefined,
        stack: undefined,
        newTemplateResources: undefined,
        newResourceTree: undefined,
        assemblies: undefined,
        config: undefined,

        events: {
            "click .jstree_custom_item": "treeFolderClick",
            "click #save_template_button": "saveTemplate",
            'click #run_template_button': "runTemplate",
            "click .toggle_resource": "toggleResourceHandler",
            'click .toggle_assembly' : 'toggleAssemblyHandler'
        },

        initialize: function() {
            $("#design_time_content").html(this.el);
            this.$el.html(this.template);
            var configManagers = new ConfigManagers();
            configManagers.fetch({
              data: $.param({org_id: sessionStorage.org_id})
            });
            this.config = configManagers.toJSON();
            this.assemblies = new Assemblies();
            this.assemblies.on( 'reset', this.addAllAssemblies, this );
        },

        render: function() {
            this.editor = window.ace.edit("design_editor");
            this.editor.setTheme("ace/theme/monokai");
            this.editor.getSession().setUseWorker(false);
            this.editor.getSession().setMode("ace/mode/json");

            this.newResourceTree = $("#new_resources").jstree({
                // List of active plugins
                "plugins" : [
                    "json_data", "crrm", "themeroller"
                ],

                "core": {
                    "animation": 0
                 },

                "json_data" : {
                    "ajax": {
                        "url": "samples/cloud_resources.json",
                        "success": function(data) {
                            var services = {};
                            var itemId;
                            $.each(data, function(index, d) {
                                 if (services[d.service] === undefined) {
                                     services[d.service] = [];
                                 }
                                 //Add reference to parent tree
                                 d.parent_tree = "#new_resources";
                                 itemId = d.label.toLowerCase().replace(/\s/g, "_");
                                 services[d.service].push({
                                     "data": {
                                         "title": d.label,
                                         "attr": {
                                             "id": itemId,
                                             "class": "toggle_resource"
                                         }
                                     },
                                     "attr": {"id": itemId + "_container"},
                                     "metadata": d
                                 });
                            });

                            var treeData = [];
                            $.each(services, function(s, v) {
                                treeData.push({
                                    data: s,
                                    children: v,
                                    "metadata": {"parent_tree": "#new_resources"}
                                });
                            });
                            return treeData;
                        }
                    },
                    "correct_state": false
                },

                "themeroller": {
                    "item": "jstree_custom_item"
                }
            });

            this.assemblies.fetch({reset:true});

            if(this.stack) {
                this.setStack(this.stack);
            }
        },

        addAllAssemblies: function() {
            $("#assemblies_list").empty();
            this.assemblies.each(function(assembly) {
                var assemblyEl = $("<li><a>"+assembly.attributes.name+"</a></li>")
                  .data('configuration', assembly.attributes)
                  .addClass('toggle_assembly');
                $("#assemblies_list").append(assemblyEl);
            });
        },

        //[TODO] iterate through a list of assembly specific resources to toggle on or off
        //i.e., Ansible would be Instance KeyName, Python and SSH
        //Right now we only manipulate Instance
        //
        removeAssemblyResources: function(){
        },

        addAssemblyResources: function(){
        },

        toggleAssemblyHandler: function(e) {
          var conf  = $(e.currentTarget).data()['configuration'];
          var content = this.getContent();
          var resourceNode = $('#instance_container');
          var resource = resourceNode.data();
          var disable = resourceNode.hasClass('ui-state-active');
          var t = resource.template;
          // Common for all AWS assemblies
          t.NewInstance.Properties['AvailabilityZone'] = 'us-east-1'; // defaults for now
          t.NewInstance.Properties['ImageId'] = conf.image.region['us-east-1'];
          switch(conf.tool){
            case 'Ansible':
              var ansible_config; 
              $.each(this.config['ansible'], function(index, config){
                if (config.enabled){
                  ansible_config = config;
                }
              });
              var auth = ansible_config.auth_properties;
              var user = auth.ansible_ssh_username;

              // t.NewInstance.Properties['KeyName'] = 'Selected_Key_Name'; 
              t.NewInstance.Properties['UserData']={"Fn::Base64":{"Fn::Join":["",[
                "#!/bin/bash\n",
                'useradd -m -p `perl -e '+ "‘print crypt("+'“'+auth.ansible_ssh_password +'”, “salt”),”\\n"'+"‘`"+user+'\n',
                "echo '"+user +"    ALL=(ALL)       ALL' >> /etc/sudoers.d/ansible\n",
                "HOME_DIR = `grep "+user+" /etc/passwd| cut -d ':' -f 6`\n",
                "mkdir $HOME_DIR/.ssh\n",
                "chown "+user+" $HOME_DIR/.ssh\n",
                "chmod 700 $HOME_DIR/.ssh\n",
                "echo '"+auth.ssh_key_data +"' > $HOME_DIR/.ssh/authorized_keys\n"  
              ]]}};
            break;
          }
          if (disable) {
            this.removeResource(resource, content);
            $(resourceNode).removeClass('ui-state-active');
          } else {
            this.addResource(resource, content,t);
            $(resourceNode).addClass('ui-state-active');
          }
        },
        
        getContent: function(){
          var content = this.editor.getValue();
          if (content.replace(/\s/g,"") !== '') {
              content = jQuery.parseJSON(content);
          } else {
              content = {};
          }
          return content;
        },


        setStack: function(stack) {
            this.stack = stack;
            this.editor.getSession().setValue(stack.attributes.template);
            $("#stack_name").html(this.stack.attributes.name);
            $("#stack_description").html(this.stack.attributes.description);
            if(this.stack.attributes.compatible_clouds instanceof Array) {
                $("#stack_compatible_clouds").html(this.stack.attributes.compatible_clouds.join(", "));
            }else {
                $("#stack_compatible_clouds").html("");
            }
        },

        saveTemplate: function() {
            if(this.stack) {
                this.stack.attributes.template = this.editor.getValue();
                this.stack.update(this.stack.attributes);
            }
        },

        setContent: function(resource, content){
          this.editor.setValue(JSON.stringify(content, null,'\t'));
        },

        removeResource:  function (resource, content) {
          if (content[resource.group]) {
              delete content[resource.group][resource.name];
          }
          this.setContent(resource, content);
        },

        addResource: function(resource, content, conf) {
            var groupSelector = "#current_" + resource.group.toLowerCase();
            if (!content[resource.group]) {
                content[resource.group] = {};
            }
            if (!conf){
              conf = resource.template;
            }
            $.extend(content[resource.group], conf);
            this.setContent(resource, content);
            var range = this.editor.find(resource.name);
            this.editor.getSelection().setSelectionRange(range);
        },

        toggleResourceHandler: function(event) {
            var resourceNode = event.currentTarget.parentNode;
            var resource = $(resourceNode).data();
            var content = this.getContent();
            var disable = $(resourceNode).hasClass('ui-state-active');
            if (disable) {
              this.removeResource(resource, content);
              $(resourceNode).removeClass('ui-state-active');
            } else {
              this.addResource(resource, content);
              $(resourceNode).addClass('ui-state-active');
            }
        },


        treeFolderClick: function(event) {
            if($(event.target.parentElement).hasClass("jstree-closed")) {
                $(event.target.parentElement).removeClass("jstree-closed");
                $(event.target.parentElement).addClass("jstree-open");
            }else{
                $(event.target.parentElement).removeClass("jstree-open");
                $(event.target.parentElement).addClass("jstree-closed");
            }
            return false;
        },

        runTemplate: function() {
            var template = this.editor.getValue();
            this.newResourceDialog = new StackCreate({cred_id: this.credentialId, 
                mode: "run",
                stack: this.stack,
                content: template
            });
            this.newResourceDialog.render();
        }
    });

    return StackDesignView;
});
