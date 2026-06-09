'use strict';

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::daily-capacity.daily-capacity');
