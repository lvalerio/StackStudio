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
        'views/resource/resourceDetailView',
        'text!templates/vcloud/compute/vcloudVappTemplate.html',
        '/js/vcloud/models/compute/vcloudVapp.js',
        '/js/vcloud/collections/compute/vcloudVapps.js',
        'text!templates/emptyGraphTemplate.html',
        'icanhaz',
        'common',
        'morris',
        'spinner',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceDetailView, VCloudVappTemplate, Vapp, Vapps, emptyGraph, ich, Common, Morris, Spinner ) {
    'use strict';

    var VCloudVappsAppView = ResourceDetailView.extend({
        
        template : _.template(VCloudVappTemplate)
    });

    return VCloudVappsAppView;
});