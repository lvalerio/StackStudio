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
        'common'
], function( $, Backbone, Common ) {
    'use strict';

    /**
     *
     * @name SecurityGroupRule
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a SecurityGroup.
     */
    var SecurityGroupRule = Backbone.Model.extend({
        /** Default attributes for security group */
        defaults: {
            fromPort: '0',
            toPort: '65535',
            ipProtocol: "tcp",
            cidr: "0.0.0.0/0"
        }
    });

    return SecurityGroupRule;
});
