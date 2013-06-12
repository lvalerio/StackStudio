/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'backbone',
        '/js/aws/models/notification/awsTopic.js',
        'common'
], function( $, Backbone, Topic, Common ) {
    'use strict';

    // Topic Collection
    // ---------------

    var TopicList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: Topic,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/aws/notification/topics'
    });
    
    // Create our global collection of **Topics**.
    return TopicList;

});
